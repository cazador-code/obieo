#!/usr/bin/env python3
"""
Format raw SMS contact CSVs into Landline Remover-ready chunk files.

This stays dependency-free so ops can run it from the repo without installing
extra Python packages.
"""

from __future__ import annotations

import argparse
import csv
import math
import re
from pathlib import Path


COMMON_FIRST_NAME_COLUMNS = ("firstName", "First Name", "first_name")
COMMON_LAST_NAME_COLUMNS = ("lastName", "Last Name", "last_name")
COMMON_PHONE_COLUMNS = ("phoneNumber", "phone", "Phone", "mobile", "mobilePhone")
COMMON_ADDRESS_COLUMNS = ("propertyAddress", "address", "Address", "property_address")
COMMON_ZIP_COLUMNS = ("zip", "zip_code", "ZIP", "Zip", "postalCode")

ADDRESS_PATTERN = re.compile(
    r"^(?P<street>.*?),\s*(?P<city>[^,]+),\s*(?P<state>[A-Za-z]{2})\s+(?P<zip>\d{5})(?:-\d{4})?$"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare raw SMS contact CSVs for Landline Remover uploads."
    )
    parser.add_argument("--input", required=True, help="Raw candidate CSV path")
    parser.add_argument("--output-dir", required=True, help="Directory for chunk files")
    parser.add_argument(
        "--file-stem",
        required=True,
        help="Base filename for output chunks, without extension",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=15000,
        help="Max rows per output file (default: 15000)",
    )
    parser.add_argument(
        "--group-by-zip",
        action="store_true",
        help="Write separate chunk files for each ZIP code",
    )
    return parser.parse_args()


def detect_column(fieldnames: list[str], options: tuple[str, ...], label: str) -> str:
    for option in options:
        if option in fieldnames:
            return option
    raise ValueError(f"Could not find {label} column. Available columns: {fieldnames}")


def normalize_phone(value: str | None) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""


def proper_case(value: str | None) -> str:
    text = (value or "").strip().lower()
    if not text:
        return ""
    parts = re.split(r"([ '-])", text)
    return "".join(part.capitalize() if index % 2 == 0 else part for index, part in enumerate(parts))


def parse_address(raw_address: str | None, fallback_zip: str | None) -> tuple[str, str, str, str]:
    address = (raw_address or "").strip()
    match = ADDRESS_PATTERN.match(address)
    if match:
        return (
            match.group("street").strip(),
            match.group("city").strip(),
            match.group("state").strip().upper(),
            match.group("zip").strip(),
        )
    return address, "", "", (fallback_zip or "").strip()


def chunk_path(output_dir: Path, file_stem: str, chunk_index: int, chunk_count: int) -> Path:
    if chunk_count == 1:
        return output_dir / f"{file_stem}.csv"
    return output_dir / f"{file_stem}_part-{chunk_index:02d}.csv"


def build_zip_file_stem(file_stem: str, zip_code: str) -> str:
    safe_zip = (zip_code or "unknown_zip").strip() or "unknown_zip"
    return f"{file_stem}_zip-{safe_zip}"


def prepare_rows(input_path: Path) -> list[dict[str, str]]:
    with input_path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        if not fieldnames:
            raise ValueError(f"No headers found in {input_path}")

        first_name_column = detect_column(fieldnames, COMMON_FIRST_NAME_COLUMNS, "first name")
        last_name_column = detect_column(fieldnames, COMMON_LAST_NAME_COLUMNS, "last name")
        phone_column = detect_column(fieldnames, COMMON_PHONE_COLUMNS, "phone")
        address_column = detect_column(fieldnames, COMMON_ADDRESS_COLUMNS, "address")
        zip_column = next((column for column in COMMON_ZIP_COLUMNS if column in fieldnames), None)

        prepared_rows: list[dict[str, str]] = []
        for row in reader:
            phone_number = normalize_phone(row.get(phone_column))
            if not phone_number:
                continue

            street, city, state, zip_code = parse_address(row.get(address_column), row.get(zip_column))
            prepared_rows.append(
                {
                    "firstName": proper_case(row.get(first_name_column)),
                    "lastName": proper_case(row.get(last_name_column)),
                    "phoneNumber": phone_number,
                    "street": street,
                    "city": proper_case(city),
                    "state": state,
                    "zip": zip_code,
                }
            )

    if not prepared_rows:
        raise ValueError("No valid rows found after phone normalization.")

    return prepared_rows


def build_row_groups(
    file_stem: str,
    prepared_rows: list[dict[str, str]],
    group_by_zip: bool,
) -> list[tuple[str, list[dict[str, str]]]]:
    if not group_by_zip:
        return [(file_stem, prepared_rows)]

    grouped_rows: dict[str, list[dict[str, str]]] = {}
    for row in prepared_rows:
        grouped_rows.setdefault(row["zip"], []).append(row)

    return [
        (build_zip_file_stem(file_stem, zip_code), grouped_rows[zip_code])
        for zip_code in sorted(grouped_rows)
    ]


def write_output_files(
    output_dir: Path,
    headers: list[str],
    row_groups: list[tuple[str, list[dict[str, str]]]],
    chunk_size: int,
) -> list[Path]:
    output_files: list[Path] = []
    for file_stem, rows in row_groups:
        chunk_count = max(1, math.ceil(len(rows) / chunk_size))
        for index in range(chunk_count):
            start = index * chunk_size
            end = start + chunk_size
            output_path = chunk_path(output_dir, file_stem, index + 1, chunk_count)
            output_files.append(output_path)
            with output_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows[start:end])
    return output_files


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    prepared_rows = prepare_rows(input_path)
    headers = ["firstName", "lastName", "phoneNumber", "street", "city", "state", "zip"]
    row_groups = build_row_groups(args.file_stem, prepared_rows, args.group_by_zip)
    output_files = write_output_files(output_dir, headers, row_groups, args.chunk_size)

    print(f"Input rows kept: {len(prepared_rows)}")
    for output_file in output_files:
        print(output_file)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
