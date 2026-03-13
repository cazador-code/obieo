#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sqlite3
import subprocess
import sys
from pathlib import Path


REQUIRED_BATCH_HEADERS = [
    "firstName",
    "lastName",
    "phoneNumber",
    "street",
    "city",
    "state",
    "zip",
]

SOURCE_REQUIRED_COLUMNS = [
    "firstName",
    "lastName",
    "propertyAddress",
    "phone1",
    "phone1_type",
    "phone2",
    "phone2_type",
    "phone3",
    "phone3_type",
]

ROOT = Path(__file__).resolve().parent.parent
RUNNER_ROOT = Path(os.environ.get("SMS_CAMPAIGN_RUNNER_ROOT", ROOT / ".tools" / "sms-campaign-runner"))
DB_PATH = Path(os.environ.get("SMS_CAMPAIGN_RUNNER_DB_PATH", RUNNER_ROOT / "runner.db"))


def now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Process queued SMS campaign runner jobs.")
    parser.add_argument("--run-id", required=True, type=int, help="Queued campaign_runs.id to process")
    return parser.parse_args()


def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 5000")
    return conn


def fetch_one(conn: sqlite3.Connection, query: str, params: tuple = ()) -> sqlite3.Row | None:
    return conn.execute(query, params).fetchone()


def fetch_all(conn: sqlite3.Connection, query: str, params: tuple = ()) -> list[sqlite3.Row]:
    return conn.execute(query, params).fetchall()


def ensure_run_dir(relative_path: str) -> Path:
    path = RUNNER_ROOT / relative_path
    path.mkdir(parents=True, exist_ok=True)
    return path


def update_run_state(
    conn: sqlite3.Connection,
    run_id: int,
    *,
    state: str,
    worker_pid: int | None = None,
    command_text: str | None = None,
    stdout_rel_path: str | None = None,
    stderr_rel_path: str | None = None,
    summary_rel_path: str | None = None,
    error_text: str | None = None,
    started_at: str | None = None,
    ended_at: str | None = None,
) -> None:
    fields: list[str] = ["state = ?"]
    values: list[object] = [state]

    if worker_pid is not None:
        fields.append("worker_pid = ?")
        values.append(worker_pid)
    if command_text is not None:
        fields.append("command_text = ?")
        values.append(command_text)
    if stdout_rel_path is not None:
        fields.append("stdout_rel_path = ?")
        values.append(stdout_rel_path)
    if stderr_rel_path is not None:
        fields.append("stderr_rel_path = ?")
        values.append(stderr_rel_path)
    if summary_rel_path is not None:
        fields.append("summary_rel_path = ?")
        values.append(summary_rel_path)
    if error_text is not None:
        fields.append("error_text = ?")
        values.append(error_text)
    if started_at is not None:
        fields.append("started_at = ?")
        values.append(started_at)
    if ended_at is not None:
        fields.append("ended_at = ?")
        values.append(ended_at)

    values.append(run_id)
    conn.execute(f"UPDATE campaign_runs SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()


def set_job_blocked_reason(conn: sqlite3.Connection, job_key: str, reason: str | None) -> None:
    conn.execute(
        "UPDATE campaign_jobs SET blocked_reason = ?, updated_at = ? WHERE job_key = ?",
        (reason, now_iso(), job_key),
    )
    conn.commit()


def count_csv_rows(path: Path) -> tuple[int, list[str]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.reader(handle)
        header = next(reader, [])
        rows = sum(1 for _ in reader)
    return rows, header


def csv_dict_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        headers = list(reader.fieldnames or [])
        rows = [dict(row) for row in reader]
    return headers, rows


def normalize_phone(value: str | None) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""


def normalize_zip(value: str | None) -> str:
    match = re.search(r"(\d{5})", (value or "").strip())
    return match.group(1) if match else ""


def parse_zip_from_filename(file_name: str) -> str:
    match = re.search(r"_zip-(\d{5})(?:_|\.csv$)", file_name)
    return match.group(1) if match else ""


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def build_extract_sql(job: sqlite3.Row, selected_zips: list[str], output_csv: Path) -> str:
    source_path = sql_escape(job["source_csv_path"])
    output_path = sql_escape(str(output_csv))
    quoted_zips = ", ".join(f"'{sql_escape(zip_code)}'" for zip_code in selected_zips)

    return f"""
COPY (
  WITH source AS (
    SELECT
      trim(coalesce(firstName, '')) AS firstName,
      trim(coalesce(lastName, '')) AS lastName,
      trim(coalesce(propertyAddress, '')) AS propertyAddress,
      trim(coalesce(CAST(phone1 AS VARCHAR), '')) AS phone1,
      upper(trim(coalesce(phone1_type, ''))) AS phone1_type,
      trim(coalesce(CAST(phone2 AS VARCHAR), '')) AS phone2,
      upper(trim(coalesce(phone2_type, ''))) AS phone2_type,
      trim(coalesce(CAST(phone3 AS VARCHAR), '')) AS phone3,
      upper(trim(coalesce(phone3_type, ''))) AS phone3_type,
      trim(coalesce(email1, '')) AS email1,
      trim(coalesce(email2, '')) AS email2,
      trim(coalesce(email3, '')) AS email3
    FROM read_csv(
      '{source_path}',
      header = true,
      ignore_errors = true,
      strict_mode = false,
      columns = {{
        'firstName': 'VARCHAR',
        'lastName': 'VARCHAR',
        'propertyAddress': 'VARCHAR',
        'phone1': 'VARCHAR',
        'phone1_type': 'VARCHAR',
        'phone2': 'VARCHAR',
        'phone2_type': 'VARCHAR',
        'phone3': 'VARCHAR',
        'phone3_type': 'VARCHAR',
        'email1': 'VARCHAR',
        'email2': 'VARCHAR',
        'email3': 'VARCHAR'
      }}
    )
  ),
  picked AS (
    SELECT
      *,
      regexp_extract(propertyAddress, '(\\d{{5}})(?:-\\d{{4}})?\\s*$', 1) AS zip,
      CASE
        WHEN phone1_type = 'W' THEN phone1
        WHEN phone2_type = 'W' THEN phone2
        WHEN phone3_type = 'W' THEN phone3
        ELSE ''
      END AS selected_phone_raw,
      CASE
        WHEN phone1_type = 'W' THEN 'phone1'
        WHEN phone2_type = 'W' THEN 'phone2'
        WHEN phone3_type = 'W' THEN 'phone3'
        ELSE ''
      END AS selectedPhoneSlot,
      CASE
        WHEN phone1_type = 'W' OR phone2_type = 'W' OR phone3_type = 'W' THEN 'W'
        ELSE ''
      END AS selectedPhoneType
    FROM source
  ),
  normalized AS (
    SELECT
      firstName,
      lastName,
      propertyAddress,
      zip,
      selectedPhoneSlot,
      selectedPhoneType,
      email1,
      email2,
      email3,
      CASE
        WHEN length(regexp_replace(selected_phone_raw, '[^0-9]', '', 'g')) = 11
             AND starts_with(regexp_replace(selected_phone_raw, '[^0-9]', '', 'g'), '1')
          THEN substring(regexp_replace(selected_phone_raw, '[^0-9]', '', 'g'), 2, 10)
        WHEN length(regexp_replace(selected_phone_raw, '[^0-9]', '', 'g')) = 10
          THEN regexp_replace(selected_phone_raw, '[^0-9]', '', 'g')
        ELSE ''
      END AS phoneNumber
    FROM picked
  ),
  filtered AS (
    SELECT *
    FROM normalized
    WHERE phoneNumber <> ''
      AND zip <> ''
      AND zip IN ({quoted_zips})
  ),
  deduped AS (
    SELECT *
    FROM (
      SELECT
        *,
        row_number() OVER (
          PARTITION BY phoneNumber
          ORDER BY zip ASC, selectedPhoneSlot ASC, propertyAddress ASC
        ) AS dedupe_rank
      FROM filtered
    )
    WHERE dedupe_rank = 1
  )
  SELECT
    firstName,
    lastName,
    propertyAddress,
    phoneNumber,
    zip,
    selectedPhoneSlot,
    selectedPhoneType,
    email1,
    email2,
    email3
  FROM deduped
  ORDER BY zip ASC, lastName ASC, firstName ASC, propertyAddress ASC, phoneNumber ASC
  LIMIT {int(job['target_contacts'])}
) TO '{output_path}' WITH (FORMAT CSV, HEADER TRUE);
""".strip()


def run_subprocess(command: list[str], stdout_path: Path, stderr_path: Path) -> subprocess.CompletedProcess[str]:
    with stdout_path.open("w", encoding="utf-8") as stdout_handle, stderr_path.open("w", encoding="utf-8") as stderr_handle:
        return subprocess.run(
            command,
            cwd=ROOT,
            stdout=stdout_handle,
            stderr=stderr_handle,
            text=True,
            check=False,
        )


def mark_failed(conn: sqlite3.Connection, run: sqlite3.Row, message: str, summary_rel_path: str | None = None) -> None:
    update_run_state(
        conn,
        run["id"],
        state="failed",
        error_text=message,
        summary_rel_path=summary_rel_path,
        ended_at=now_iso(),
    )
    set_job_blocked_reason(conn, run["job_key"], message)


def mark_succeeded(conn: sqlite3.Connection, run: sqlite3.Row, summary_rel_path: str | None = None) -> None:
    update_run_state(
        conn,
        run["id"],
        state="succeeded",
        summary_rel_path=summary_rel_path,
        error_text=None,
        ended_at=now_iso(),
    )
    set_job_blocked_reason(conn, run["job_key"], None)


def latest_successful_run(conn: sqlite3.Connection, job_key: str, action: str) -> sqlite3.Row | None:
    return fetch_one(
        conn,
        """
        SELECT * FROM campaign_runs
        WHERE job_key = ? AND action = ? AND state = 'succeeded'
        ORDER BY id DESC
        LIMIT 1
        """,
        (job_key, action),
    )


def update_job_timestamp(conn: sqlite3.Connection, job_key: str) -> None:
    conn.execute("UPDATE campaign_jobs SET updated_at = ? WHERE job_key = ?", (now_iso(), job_key))
    conn.commit()


def process_extract(conn: sqlite3.Connection, run: sqlite3.Row, job: sqlite3.Row, run_dir: Path) -> None:
    selected_zips = [
        row["zip_code"]
        for row in fetch_all(
            conn,
            """
            SELECT zip_code
            FROM campaign_job_zips
            WHERE job_key = ? AND selection_state = 'selected'
            ORDER BY sort_order ASC, id ASC
            """,
            (job["job_key"],),
        )
    ]
    if not selected_zips:
        mark_failed(conn, run, "Extraction requires at least one selected ZIP.")
        return

    source_path = Path(job["source_csv_path"])
    if not source_path.exists():
        mark_failed(conn, run, f"Source CSV not found: {source_path}")
        return

    sql_path = run_dir / "extract.sql"
    raw_path = run_dir / "raw.csv"
    stdout_rel = str(Path(run["artifact_dir_rel_path"]) / "stdout.log")
    stderr_rel = str(Path(run["artifact_dir_rel_path"]) / "stderr.log")
    stdout_path = RUNNER_ROOT / stdout_rel
    stderr_path = RUNNER_ROOT / stderr_rel

    sql_text = build_extract_sql(job, selected_zips, raw_path)
    sql_path.write_text(sql_text + "\n", encoding="utf-8")
    update_run_state(
        conn,
        run["id"],
        state="running",
        worker_pid=os.getpid(),
        command_text=f"duckdb -c @ {sql_path}",
        stdout_rel_path=stdout_rel,
        stderr_rel_path=stderr_rel,
        started_at=now_iso(),
    )

    completed = run_subprocess(["duckdb", "-c", sql_text], stdout_path, stderr_path)
    if completed.returncode != 0:
        mark_failed(conn, run, "DuckDB extraction command failed.")
        return

    if not raw_path.exists():
        mark_failed(conn, run, "DuckDB extraction finished without producing raw.csv.")
        return

    row_count, headers = count_csv_rows(raw_path)
    if row_count == 0:
        mark_failed(conn, run, "Extraction produced zero data rows.")
        return

    expected_headers = [
        "firstName",
        "lastName",
        "propertyAddress",
        "phoneNumber",
        "zip",
        "selectedPhoneSlot",
        "selectedPhoneType",
        "email1",
        "email2",
        "email3",
    ]
    if headers != expected_headers:
        mark_failed(conn, run, f"Raw export headers did not match expected schema: {headers}")
        return

    summary = {
        "action": "extract_raw",
        "source_profile": "merged_master_v1",
        "source_csv_path": str(source_path),
        "selected_zips": selected_zips,
        "required_source_columns": SOURCE_REQUIRED_COLUMNS,
        "raw_output_file": str(raw_path.relative_to(RUNNER_ROOT)),
        "row_count": row_count,
        "headers": headers,
    }
    summary_path = run_dir / "summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    mark_succeeded(conn, run, str(summary_path.relative_to(RUNNER_ROOT)))
    update_job_timestamp(conn, job["job_key"])


def process_format(conn: sqlite3.Connection, run: sqlite3.Row, job: sqlite3.Row, run_dir: Path) -> None:
    extract_run = fetch_one(conn, "SELECT * FROM campaign_runs WHERE id = ?", (run["input_run_id"],))
    if extract_run is None:
        extract_run = latest_successful_run(conn, job["job_key"], "extract_raw")
    if extract_run is None:
        mark_failed(conn, run, "Formatting requires a successful extraction run.")
        return

    raw_path = RUNNER_ROOT / extract_run["artifact_dir_rel_path"] / "raw.csv"
    if not raw_path.exists():
        mark_failed(conn, run, f"Expected raw export is missing: {raw_path}")
        return

    batch_dir = run_dir / "batches"
    batch_dir.mkdir(parents=True, exist_ok=True)
    stdout_rel = str(Path(run["artifact_dir_rel_path"]) / "stdout.log")
    stderr_rel = str(Path(run["artifact_dir_rel_path"]) / "stderr.log")
    stdout_path = RUNNER_ROOT / stdout_rel
    stderr_path = RUNNER_ROOT / stderr_rel

    command = [
        "python3",
        "scripts/prepare_sms_contacts.py",
        "--input",
        str(raw_path),
        "--output-dir",
        str(batch_dir),
        "--file-stem",
        job["job_key"],
        "--chunk-size",
        str(job["chunk_size"]),
    ]
    if int(job["group_by_zip"]) == 1:
        command.append("--group-by-zip")

    update_run_state(
        conn,
        run["id"],
        state="running",
        worker_pid=os.getpid(),
        command_text=" ".join(command),
        stdout_rel_path=stdout_rel,
        stderr_rel_path=stderr_rel,
        started_at=now_iso(),
    )

    completed = run_subprocess(command, stdout_path, stderr_path)
    if completed.returncode != 0:
        mark_failed(conn, run, "Formatter command failed.")
        return

    batch_files = sorted(batch_dir.glob("*.csv"))
    if not batch_files:
        mark_failed(conn, run, "Formatting produced zero batch files.")
        return

    insert_batch = conn.execute
    summary_batches: list[dict[str, object]] = []
    created_at = now_iso()
    for index, batch_file in enumerate(batch_files, start=1):
        row_count, _headers = count_csv_rows(batch_file)
        if row_count == 0:
            mark_failed(conn, run, f"Formatted batch has no data rows: {batch_file.name}")
            return

        batch_key = f"{job['job_key']}__{run['run_key']}__batch-{index:03d}"
        batch_rel_path = str(batch_file.relative_to(RUNNER_ROOT))
        zip_from_name = parse_zip_from_filename(batch_file.name) or None
        insert_batch(
            """
            INSERT INTO campaign_batches (
              batch_key, job_key, source_run_id, batch_index, zip_code, file_name, rel_path, row_count,
              headers_verified, duplicate_phone_count, zip_purity_verified, traceability_verified,
              validation_summary_rel_path, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, NULL, ?, ?)
            """,
            (
                batch_key,
                job["job_key"],
                run["id"],
                index,
                zip_from_name,
                batch_file.name,
                batch_rel_path,
                row_count,
                created_at,
                created_at,
            ),
        )
        summary_batches.append(
            {
                "file_name": batch_file.name,
                "relative_path": batch_rel_path,
                "row_count": row_count,
                "zip_code": zip_from_name,
            }
        )

    conn.commit()
    summary = {
        "action": "format_batches",
        "input_run_id": extract_run["id"],
        "raw_input_file": str(raw_path.relative_to(RUNNER_ROOT)),
        "batch_count": len(summary_batches),
        "batches": summary_batches,
        "group_by_zip": bool(job["group_by_zip"]),
        "chunk_size": job["chunk_size"],
    }
    summary_path = run_dir / "summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    mark_succeeded(conn, run, str(summary_path.relative_to(RUNNER_ROOT)))
    update_job_timestamp(conn, job["job_key"])


def process_validate(conn: sqlite3.Connection, run: sqlite3.Row, job: sqlite3.Row, run_dir: Path) -> None:
    format_run = fetch_one(conn, "SELECT * FROM campaign_runs WHERE id = ?", (run["input_run_id"],))
    if format_run is None:
        format_run = latest_successful_run(conn, job["job_key"], "format_batches")
    if format_run is None:
        mark_failed(conn, run, "Validation requires a successful formatting run.")
        return

    batches = fetch_all(
        conn,
        "SELECT * FROM campaign_batches WHERE source_run_id = ? ORDER BY batch_index ASC",
        (format_run["id"],),
    )
    if not batches:
        mark_failed(conn, run, "Validation requires formatted batches from the selected run.")
        return

    update_run_state(
        conn,
        run["id"],
        state="running",
        worker_pid=os.getpid(),
        command_text=f"validate batches from format run {format_run['id']}",
        stdout_rel_path=str(Path(run["artifact_dir_rel_path"]) / "stdout.log"),
        stderr_rel_path=str(Path(run["artifact_dir_rel_path"]) / "stderr.log"),
        started_at=now_iso(),
    )
    (RUNNER_ROOT / run["artifact_dir_rel_path"] / "stdout.log").write_text(
        f"Validating {len(batches)} batch files\n", encoding="utf-8"
    )
    (RUNNER_ROOT / run["artifact_dir_rel_path"] / "stderr.log").write_text("", encoding="utf-8")

    duplicate_index: dict[str, list[str]] = {}
    summary_batches: list[dict[str, object]] = []
    failures: list[str] = []
    summary_path = run_dir / "validation.json"
    summary_rel_path = str(summary_path.relative_to(RUNNER_ROOT))
    is_grouped = int(job["group_by_zip"]) == 1

    for batch in batches:
        batch_path = RUNNER_ROOT / batch["rel_path"]
        batch_result = {
            "batch_key": batch["batch_key"],
            "file_name": batch["file_name"],
            "relative_path": batch["rel_path"],
            "row_count": 0,
            "headers_verified": False,
            "traceability_verified": False,
            "zip_purity_verified": not is_grouped,
            "issues": [],
        }

        if not batch_path.exists():
            batch_result["issues"].append("missing_file")
            failures.append(f"Batch file missing: {batch['file_name']}")
            summary_batches.append(batch_result)
            conn.execute(
                """
                UPDATE campaign_batches
                SET headers_verified = 0,
                    duplicate_phone_count = 0,
                    zip_purity_verified = 0,
                    traceability_verified = 0,
                    validation_summary_rel_path = ?,
                    updated_at = ?
                WHERE batch_key = ?
                """,
                (summary_rel_path, now_iso(), batch["batch_key"]),
            )
            continue

        headers, rows = csv_dict_rows(batch_path)
        batch_result["row_count"] = len(rows)
        headers_verified = headers == REQUIRED_BATCH_HEADERS
        traceability_verified = batch["file_name"].startswith(job["job_key"]) and batch["file_name"].endswith(".csv")

        if not headers_verified:
            batch_result["issues"].append("header_mismatch")
            failures.append(f"Header mismatch in {batch['file_name']}")

        if len(rows) == 0:
            batch_result["issues"].append("empty_batch")
            failures.append(f"Empty batch file: {batch['file_name']}")

        expected_zip = parse_zip_from_filename(batch["file_name"]) if is_grouped else ""
        if is_grouped and not expected_zip:
            batch_result["issues"].append("missing_zip_in_filename")
            failures.append(f"Grouped ZIP batch filename is missing a parseable ZIP: {batch['file_name']}")
        normalized_batch_zips: set[str] = set()
        seen_batch_duplicates = 0
        for row in rows:
            phone_number = normalize_phone(row.get("phoneNumber"))
            if not phone_number:
                batch_result["issues"].append("blank_phone")
                failures.append(f"Missing phoneNumber in {batch['file_name']}")
                continue

            duplicate_index.setdefault(phone_number, []).append(batch["file_name"])
            normalized_zip = normalize_zip(row.get("zip"))
            if not normalized_zip:
                batch_result["issues"].append("invalid_zip")
                failures.append(f"Invalid ZIP in {batch['file_name']}")
            normalized_batch_zips.add(normalized_zip)

            if is_grouped and expected_zip and normalized_zip != expected_zip:
                batch_result["issues"].append("zip_filename_mismatch")
                failures.append(f"ZIP mismatch in {batch['file_name']}: expected {expected_zip}, found {normalized_zip or 'blank'}")

        if is_grouped and len({zip_code for zip_code in normalized_batch_zips if zip_code}) > 1:
            batch_result["issues"].append("mixed_zip_batch")
            failures.append(f"Mixed ZIP batch: {batch['file_name']}")

        zip_purity_verified = (
            (not is_grouped)
            or (
                len(rows) > 0
                and len({zip_code for zip_code in normalized_batch_zips if zip_code}) == 1
                and expected_zip != ""
                and next(iter({zip_code for zip_code in normalized_batch_zips if zip_code}), "") == expected_zip
            )
        )

        batch_result["headers_verified"] = headers_verified
        batch_result["traceability_verified"] = traceability_verified
        batch_result["zip_purity_verified"] = zip_purity_verified
        summary_batches.append(batch_result)

        conn.execute(
            """
            UPDATE campaign_batches
            SET headers_verified = ?,
                duplicate_phone_count = ?,
                zip_purity_verified = ?,
                traceability_verified = ?,
                validation_summary_rel_path = ?,
                updated_at = ?
            WHERE batch_key = ?
            """,
            (
                1 if headers_verified else 0,
                seen_batch_duplicates,
                1 if zip_purity_verified else 0,
                1 if traceability_verified else 0,
                summary_rel_path,
                now_iso(),
                batch["batch_key"],
            ),
        )

    duplicates = {
        phone: sorted(set(file_names))
        for phone, file_names in duplicate_index.items()
        if len(file_names) > 1
    }
    duplicate_count = len(duplicates)
    if duplicate_count > 0:
        failures.append(f"Duplicate phone numbers found across batch set: {duplicate_count}")
        for batch in batches:
            conn.execute(
                """
                UPDATE campaign_batches
                SET duplicate_phone_count = ?,
                    validation_summary_rel_path = ?,
                    updated_at = ?
                WHERE batch_key = ?
                """,
                (duplicate_count, summary_rel_path, now_iso(), batch["batch_key"]),
            )

    conn.commit()
    summary = {
        "action": "validate_lr_ready",
        "input_run_id": format_run["id"],
        "job_key": job["job_key"],
        "group_by_zip": is_grouped,
        "required_headers": REQUIRED_BATCH_HEADERS,
        "duplicate_phone_count": duplicate_count,
        "duplicate_phone_samples": list(duplicates.keys())[:10],
        "batches": summary_batches,
        "passed": len(failures) == 0,
        "failures": failures,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    if failures:
        mark_failed(conn, run, "LR-ready validation failed.", summary_rel_path)
        return

    mark_succeeded(conn, run, summary_rel_path)
    update_job_timestamp(conn, job["job_key"])


def main() -> int:
    args = parse_args()
    conn = connect_db()
    run = fetch_one(conn, "SELECT * FROM campaign_runs WHERE id = ?", (args.run_id,))
    if run is None:
        print(f"Run not found: {args.run_id}", file=sys.stderr)
        return 1

    job = fetch_one(conn, "SELECT * FROM campaign_jobs WHERE job_key = ?", (run["job_key"],))
    if job is None:
        print(f"Job not found for run {args.run_id}", file=sys.stderr)
        return 1

    run_dir = ensure_run_dir(run["artifact_dir_rel_path"])
    try:
        if run["action"] == "extract_raw":
            process_extract(conn, run, job, run_dir)
        elif run["action"] == "format_batches":
            process_format(conn, run, job, run_dir)
        elif run["action"] == "validate_lr_ready":
            process_validate(conn, run, job, run_dir)
        else:
            mark_failed(conn, run, f"Unsupported run action: {run['action']}")
            return 1
    except Exception as exc:  # pragma: no cover - operational catch-all
        mark_failed(conn, run, f"Worker crashed: {exc}")
        return 1
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
