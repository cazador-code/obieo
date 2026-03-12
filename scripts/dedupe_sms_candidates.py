#!/usr/bin/env python3
"""
Deduplicate SMS candidate rows against one or more prior GHL exports.

This script is intentionally CSV-only and dependency-free so ops can run it
from the repo without setting up anything extra.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Iterable


COMMON_PHONE_COLUMNS = (
    "phoneNumber",
    "phone",
    "Phone",
    "mobile",
    "mobilePhone",
    "Mobile Phone",
    "Phone 1",
)

COMMON_LINE_TYPE_COLUMNS = (
    "LLR_LineType",
    "lineType",
    "Line Type",
)

COMMON_DNC_TYPE_COLUMNS = (
    "LLR_DNCType",
    "dncType",
    "DNC Type",
)

GOOD_LINE_TYPES = {"mobile"}
BAD_DNC_TYPES = {"dnc", "litigator", "invalid"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Remove rows from a candidate CSV when the phone number already "
            "exists in prior GHL exports. Optionally keep only clean mobile rows."
        )
    )
    parser.add_argument("--candidate", required=True, help="New candidate CSV to clean")
    parser.add_argument(
        "--history",
        action="append",
        default=[],
        help="Prior GHL export CSV. Repeat this flag for multiple files.",
    )
    parser.add_argument("--output", required=True, help="Path for kept rows CSV")
    parser.add_argument(
        "--excluded-output",
        help="Optional path for excluded rows CSV with exclusionReason appended",
    )
    parser.add_argument(
        "--report-output",
        help="Optional path for JSON summary report",
    )
    parser.add_argument(
        "--candidate-phone-column",
        help="Override auto-detected phone column name for the candidate file",
    )
    parser.add_argument(
        "--history-phone-column",
        help="Override auto-detected phone column name for all history files",
    )
    parser.add_argument(
        "--require-clean",
        action="store_true",
        help="Keep only clean mobile rows when line/DNC columns exist",
    )
    return parser.parse_args()


def normalize_phone(value: str | None) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def detect_column(fieldnames: Iterable[str] | None, preferred: str | None, options: tuple[str, ...], label: str) -> str:
    if not fieldnames:
        raise ValueError(f"Could not read headers while looking for {label}.")
    names = list(fieldnames)
    if preferred:
        if preferred in names:
            return preferred
        raise ValueError(f"Requested {label} column '{preferred}' was not found. Available columns: {names}")
    for option in options:
        if option in names:
            return option
    raise ValueError(f"Could not auto-detect {label} column. Available columns: {names}")


def load_history_phone_set(paths: list[str], phone_column_override: str | None) -> tuple[set[str], dict[str, int]]:
    phones: set[str] = set()
    stats = {"history_files": len(paths), "history_rows": 0, "history_unique_phones": 0}
    for raw_path in paths:
        path = Path(raw_path)
        with path.open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            phone_column = detect_column(reader.fieldnames, phone_column_override, COMMON_PHONE_COLUMNS, f"history phone for {path.name}")
            for row in reader:
                stats["history_rows"] += 1
                phone = normalize_phone(row.get(phone_column))
                if phone:
                    phones.add(phone)
    stats["history_unique_phones"] = len(phones)
    return phones, stats


def csv_writer(path: Path, fieldnames: list[str]) -> tuple[csv.DictWriter, object]:
    handle = path.open("w", newline="", encoding="utf-8")
    writer = csv.DictWriter(handle, fieldnames=fieldnames)
    writer.writeheader()
    return writer, handle


def detect_clean_columns(
    fieldnames: Iterable[str] | None,
    require_clean: bool,
) -> tuple[str | None, str | None]:
    if not require_clean:
        return None, None

    try:
        line_type_column = detect_column(fieldnames, None, COMMON_LINE_TYPE_COLUMNS, "candidate line type")
    except ValueError:
        line_type_column = None

    try:
        dnc_type_column = detect_column(fieldnames, None, COMMON_DNC_TYPE_COLUMNS, "candidate DNC type")
    except ValueError:
        dnc_type_column = None

    return line_type_column, dnc_type_column


def build_summary(
    args: argparse.Namespace,
    candidate_path: Path,
    output_path: Path,
    excluded_output_path: Path | None,
    phone_column: str,
    line_type_column: str | None,
    dnc_type_column: str | None,
    history_stats: dict[str, int],
) -> dict[str, object]:
    return {
        "candidate_file": str(candidate_path),
        "output_file": str(output_path),
        "excluded_output_file": str(excluded_output_path) if excluded_output_path else None,
        "require_clean": args.require_clean,
        "candidate_phone_column": phone_column,
        "candidate_line_type_column": line_type_column,
        "candidate_dnc_type_column": dnc_type_column,
        **history_stats,
        "candidate_rows": 0,
        "kept_rows": 0,
        "excluded_rows": 0,
        "excluded_by_reason": Counter(),
    }


def get_phone_exclusion_reason(phone: str, history_phones: set[str], seen_candidate_phones: set[str]) -> str | None:
    if not phone:
        return "blank_phone"
    if phone in history_phones:
        return "duplicate_in_history"
    if phone in seen_candidate_phones:
        return "duplicate_in_candidate"
    return None


def get_line_type_exclusion_reason(row: dict[str, str], line_type_column: str | None) -> str | None:
    if not line_type_column:
        return None
    line_type = (row.get(line_type_column) or "").strip().lower()
    if line_type and line_type not in GOOD_LINE_TYPES:
        return f"line_type_{line_type}"
    return None


def get_dnc_exclusion_reason(row: dict[str, str], dnc_type_column: str | None) -> str | None:
    if not dnc_type_column:
        return None
    dnc_type = (row.get(dnc_type_column) or "").strip().lower()
    if dnc_type in BAD_DNC_TYPES:
        return f"dnc_type_{dnc_type}"
    return None


def get_exclusion_reason(
    row: dict[str, str],
    phone_column: str,
    history_phones: set[str],
    seen_candidate_phones: set[str],
    require_clean: bool,
    line_type_column: str | None,
    dnc_type_column: str | None,
) -> tuple[str, str | None]:
    phone = normalize_phone(row.get(phone_column))
    phone_reason = get_phone_exclusion_reason(phone, history_phones, seen_candidate_phones)
    if phone_reason:
        return phone, phone_reason

    if require_clean:
        line_type_reason = get_line_type_exclusion_reason(row, line_type_column)
        if line_type_reason:
            return phone, line_type_reason

        dnc_reason = get_dnc_exclusion_reason(row, dnc_type_column)
        if dnc_reason:
            return phone, dnc_reason

    return phone, None


def process_candidate_rows(
    reader: csv.DictReader,
    kept_writer: csv.DictWriter,
    excluded_writer: csv.DictWriter | None,
    history_phones: set[str],
    require_clean: bool,
    phone_column: str,
    line_type_column: str | None,
    dnc_type_column: str | None,
    summary: dict[str, object],
) -> None:
    seen_candidate_phones: set[str] = set()
    excluded_by_reason = summary["excluded_by_reason"]
    if not isinstance(excluded_by_reason, Counter):
        raise ValueError("excluded_by_reason summary field must be a Counter during processing.")

    for row in reader:
        summary["candidate_rows"] = int(summary["candidate_rows"]) + 1
        phone, exclusion_reason = get_exclusion_reason(
            row=row,
            phone_column=phone_column,
            history_phones=history_phones,
            seen_candidate_phones=seen_candidate_phones,
            require_clean=require_clean,
            line_type_column=line_type_column,
            dnc_type_column=dnc_type_column,
        )

        if exclusion_reason is None:
            kept_writer.writerow(row)
            summary["kept_rows"] = int(summary["kept_rows"]) + 1
            seen_candidate_phones.add(phone)
            continue

        summary["excluded_rows"] = int(summary["excluded_rows"]) + 1
        excluded_by_reason[exclusion_reason] += 1
        if excluded_writer:
            row_with_reason = dict(row)
            row_with_reason["exclusionReason"] = exclusion_reason
            excluded_writer.writerow(row_with_reason)


def main() -> int:
    args = parse_args()
    candidate_path = Path(args.candidate)
    output_path = Path(args.output)
    excluded_output_path = Path(args.excluded_output) if args.excluded_output else None
    report_output_path = Path(args.report_output) if args.report_output else None

    history_phones, history_stats = load_history_phone_set(args.history, args.history_phone_column)

    with candidate_path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        phone_column = detect_column(reader.fieldnames, args.candidate_phone_column, COMMON_PHONE_COLUMNS, "candidate phone")
        line_type_column, dnc_type_column = detect_clean_columns(reader.fieldnames, args.require_clean)

        kept_writer, kept_handle = csv_writer(output_path, fieldnames)
        excluded_writer = None
        excluded_handle = None
        if excluded_output_path:
            excluded_writer, excluded_handle = csv_writer(excluded_output_path, fieldnames + ["exclusionReason"])

        summary = build_summary(
            args=args,
            candidate_path=candidate_path,
            output_path=output_path,
            excluded_output_path=excluded_output_path,
            phone_column=phone_column,
            line_type_column=line_type_column,
            dnc_type_column=dnc_type_column,
            history_stats=history_stats,
        )

        try:
            process_candidate_rows(
                reader=reader,
                kept_writer=kept_writer,
                excluded_writer=excluded_writer,
                history_phones=history_phones,
                require_clean=args.require_clean,
                phone_column=phone_column,
                line_type_column=line_type_column,
                dnc_type_column=dnc_type_column,
                summary=summary,
            )
        finally:
            kept_handle.close()
            if excluded_handle:
                excluded_handle.close()

    summary["excluded_by_reason"] = dict(sorted(summary["excluded_by_reason"].items()))
    print(json.dumps(summary, indent=2))

    if report_output_path:
        report_output_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
