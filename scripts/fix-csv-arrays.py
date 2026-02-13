"""
fix-csv-arrays.py — Convert JSON arrays in CSV files to PostgreSQL array format.

Converts ["val1","val2"] → {val1,val2} for columns that are text[] in Postgres.
Operates on supabase/seed-data/*.csv files in-place.

Usage: python scripts/fix-csv-arrays.py
"""

import csv
import json
import os
import sys

# Map of table -> columns that are text[] arrays in PostgreSQL
ARRAY_COLUMNS = {
    "conversation_lines": ["acceptable_responses", "response_hints"],
    "conversation_scripts": ["participants"],
    "daily_challenges": ["quiz_set_ids"],
    "flashcard_cards": ["tags"],
    "kanji_characters": ["kun_readings", "on_readings", "radicals"],
    "practice_quiz_questions": ["tags"],
    "roleplay_scenarios": ["key_phrases", "objectives"],
    "test_schedules": ["levels_available", "payment_methods", "requirements"],
    "test_types": ["levels"],
}

SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "supabase", "seed-data")


def json_array_to_pg_array(value: str) -> str:
    """Convert a JSON array string to PostgreSQL array literal.

    '["a","b","c"]' -> '{a,b,c}'
    Empty/null values pass through unchanged.
    """
    if not value or not value.strip():
        return value

    value = value.strip()

    # Check if it looks like a JSON array
    if not (value.startswith("[") and value.endswith("]")):
        # Already in Postgres format or not an array
        return value

    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            # Convert to Postgres array literal
            # Quote elements that contain commas, spaces, or special chars
            elements = []
            for item in parsed:
                s = str(item)
                if "," in s or " " in s or '"' in s or "\\" in s or s == "":
                    s = '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
                elements.append(s)
            return "{" + ",".join(elements) + "}"
    except (json.JSONDecodeError, TypeError):
        pass

    return value


def fix_csv_file(table_name: str, array_cols: list[str]):
    """Fix array columns in a single CSV file."""
    csv_path = os.path.join(SEED_DIR, f"{table_name}.csv")

    if not os.path.exists(csv_path):
        print(f"  SKIP: {table_name}.csv not found")
        return

    # Read the file
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        fieldnames = reader.fieldnames
        rows = list(reader)

    if not fieldnames:
        print(f"  SKIP: {table_name}.csv has no headers")
        return

    # Check which array columns exist in this file
    cols_to_fix = [c for c in array_cols if c in fieldnames]
    if not cols_to_fix:
        print(f"  SKIP: {table_name}.csv — no matching array columns")
        return

    # Convert array columns
    fixed_count = 0
    for row in rows:
        for col in cols_to_fix:
            old_val = row[col]
            new_val = json_array_to_pg_array(old_val)
            if old_val != new_val:
                row[col] = new_val
                fixed_count += 1

    # Write back
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";",
                                quoting=csv.QUOTE_MINIMAL, quotechar='"')
        writer.writeheader()
        writer.writerows(rows)

    print(f"  OK: {table_name}.csv — fixed {fixed_count} values in {cols_to_fix}")


def main():
    print(f"Fixing JSON arrays in CSV files at: {SEED_DIR}")
    print()

    for table_name, array_cols in sorted(ARRAY_COLUMNS.items()):
        fix_csv_file(table_name, array_cols)

    print()
    print("Done!")


if __name__ == "__main__":
    main()
