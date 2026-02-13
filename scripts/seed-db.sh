#!/usr/bin/env bash
# seed-db.sh — Import 27 content CSVs into local Supabase PostgreSQL
# Usage: bash scripts/seed-db.sh
# Run from rafiq-nihon/ directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_DIR="$PROJECT_DIR/supabase/seed-data"

# On Windows (Git Bash/MSYS), psql.exe needs Windows-style paths
# Convert /d/path to D:\path using cygpath if available
to_native_path() {
  if command -v cygpath &> /dev/null; then
    cygpath -w "$1"
  else
    echo "$1"
  fi
}

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

echo "=== Rafiq Nihon: Database Seeder ==="
echo "Database: $DB_URL"
echo "Seed data: $SEED_DIR"
echo ""

# Check psql is available (auto-detect on Windows)
if ! command -v psql &> /dev/null; then
  for pg_ver in 18 17 16 15 14; do
    for pg_dir in "/c/Program Files/PostgreSQL/${pg_ver}/bin" "C:/Program Files/PostgreSQL/${pg_ver}/bin"; do
      if [ -f "${pg_dir}/psql.exe" ] || [ -f "${pg_dir}/psql" ]; then
        export PATH="${pg_dir}:$PATH"
        echo "Found psql in ${pg_dir}"
        break 2
      fi
    done
  done
fi
if ! command -v psql &> /dev/null; then
  echo "ERROR: psql not found. Install PostgreSQL client tools."
  echo "  Windows: Install PostgreSQL or use 'choco install postgresql'"
  echo "  macOS:   brew install libpq"
  echo "  Linux:   sudo apt install postgresql-client"
  exit 1
fi

# Check seed data directory
if [ ! -d "$SEED_DIR" ]; then
  echo "ERROR: Seed data directory not found: $SEED_DIR"
  exit 1
fi

# All 27 content tables in FK-dependency order
PHASE1_TABLES=(
  badges
  chapters
  kana_characters
  time_vocabulary
  flashcard_decks
  practice_quiz_sets
  daily_challenges
  speaking_lessons
  reading_passages
  listening_items
  cultural_tips
  kanji_characters
  test_institutions
  test_types
  mock_test_questions
)

PHASE2_TABLES=(
  lessons
  vocabulary
  quiz_questions
  flashcard_cards
  practice_quiz_questions
  speaking_items
  conversation_scripts
  roleplay_scenarios
  reading_questions
  listening_questions
  test_schedules
)

PHASE3_TABLES=(
  conversation_lines
)

ALL_TABLES=("${PHASE1_TABLES[@]}" "${PHASE2_TABLES[@]}" "${PHASE3_TABLES[@]}")

# Generate a psql script that runs everything in one session
# This keeps session_replication_role = 'replica' active for all imports
PSQL_SCRIPT=$(mktemp)
trap "rm -f $PSQL_SCRIPT" EXIT

echo "-- Generated seed script" > "$PSQL_SCRIPT"
echo "SET session_replication_role = 'replica';" >> "$PSQL_SCRIPT"
echo "" >> "$PSQL_SCRIPT"

# Truncate all tables
TRUNCATE_LIST=$(IFS=','; echo "${ALL_TABLES[*]}")
echo "TRUNCATE TABLE ${TRUNCATE_LIST} CASCADE;" >> "$PSQL_SCRIPT"
echo "" >> "$PSQL_SCRIPT"

# Temporarily drop NOT NULL on columns that can be empty in exported CSVs
# conversation_lines: user-turn rows have empty japanese_text and meaning_id
echo "ALTER TABLE conversation_lines ALTER COLUMN japanese_text DROP NOT NULL;" >> "$PSQL_SCRIPT"
echo "ALTER TABLE conversation_lines ALTER COLUMN meaning_id DROP NOT NULL;" >> "$PSQL_SCRIPT"
echo "" >> "$PSQL_SCRIPT"

# Generate \copy commands for each table
import_count=0
for table in "${ALL_TABLES[@]}"; do
  csv_file="$SEED_DIR/${table}.csv"

  if [ ! -f "$csv_file" ]; then
    echo "WARNING: ${table}.csv not found, skipping"
    continue
  fi

  # Get header row to use as column list
  header=$(head -1 "$csv_file" | tr ';' ',')

  # Use native (Windows) path for psql \copy
  csv_file_native=$(to_native_path "$csv_file")
  echo "\\copy ${table}(${header}) FROM '${csv_file_native}' WITH (FORMAT csv, DELIMITER ';', HEADER true, QUOTE '\"')" >> "$PSQL_SCRIPT"
  import_count=$((import_count + 1))
done

# Restore NOT NULL constraints and fix NULLs
echo "" >> "$PSQL_SCRIPT"
echo "UPDATE conversation_lines SET japanese_text = '' WHERE japanese_text IS NULL;" >> "$PSQL_SCRIPT"
echo "UPDATE conversation_lines SET meaning_id = '' WHERE meaning_id IS NULL;" >> "$PSQL_SCRIPT"
echo "ALTER TABLE conversation_lines ALTER COLUMN japanese_text SET NOT NULL;" >> "$PSQL_SCRIPT"
echo "ALTER TABLE conversation_lines ALTER COLUMN meaning_id SET NOT NULL;" >> "$PSQL_SCRIPT"

echo "" >> "$PSQL_SCRIPT"
echo "SET session_replication_role = 'origin';" >> "$PSQL_SCRIPT"

echo "[1/2] Truncating and importing $import_count tables..."
echo "      (triggers disabled during import)"
echo ""

# Run the entire script in one psql session
PSQL_SCRIPT_NATIVE=$(to_native_path "$PSQL_SCRIPT")
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$PSQL_SCRIPT_NATIVE" 2>&1 | while IFS= read -r line; do
  # Show COPY results (e.g., "COPY 15")
  if [[ "$line" == COPY* ]]; then
    echo "  $line"
  elif [[ -n "$line" ]]; then
    echo "  $line"
  fi
done

PSQL_EXIT=${PIPESTATUS[0]}
if [ "$PSQL_EXIT" -ne 0 ]; then
  echo ""
  echo "ERROR: Database seeding failed. Check the output above."
  exit 1
fi

echo ""
echo "[2/2] Verifying row counts..."
# Quick verification of a few key tables
psql "$DB_URL" -t -A -c "
SELECT 'badges: ' || count(*) FROM badges
UNION ALL SELECT 'chapters: ' || count(*) FROM chapters
UNION ALL SELECT 'lessons: ' || count(*) FROM lessons
UNION ALL SELECT 'vocabulary: ' || count(*) FROM vocabulary
UNION ALL SELECT 'flashcard_cards: ' || count(*) FROM flashcard_cards
UNION ALL SELECT 'kanji_characters: ' || count(*) FROM kanji_characters
UNION ALL SELECT 'kana_characters: ' || count(*) FROM kana_characters
UNION ALL SELECT 'quiz_questions: ' || count(*) FROM quiz_questions
ORDER BY 1;
"

echo ""
echo "=== Seeding complete! ==="
echo "Imported $import_count tables from $SEED_DIR"
