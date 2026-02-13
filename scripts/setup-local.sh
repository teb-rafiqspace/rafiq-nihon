#!/usr/bin/env bash
# setup-local.sh — Full local deployment for Rafiq Nihon
# Usage: bash scripts/setup-local.sh
# Run from the rafiq-nihon/ directory
#
# Prerequisites:
#   - Docker Desktop (running)
#   - Node.js + npm (npx used for supabase CLI)
#   - psql (PostgreSQL client — auto-detected on Windows)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "============================================"
echo "  Rafiq Nihon — Local Setup"
echo "============================================"
echo ""

# ─── Step 1: Check prerequisites ───────────────────────────────────────────────

echo "[1/6] Checking prerequisites..."

MISSING=()

if ! command -v docker &> /dev/null; then
  MISSING+=("docker (Docker Desktop)")
fi

if ! command -v node &> /dev/null; then
  MISSING+=("node (Node.js)")
fi

if ! command -v npm &> /dev/null; then
  MISSING+=("npm")
fi

# psql: check PATH first, then common Windows PostgreSQL install paths
if command -v psql &> /dev/null; then
  PSQL_CMD="psql"
else
  PSQL_CMD=""
  for pg_ver in 18 17 16 15 14; do
    for pg_dir in "/c/Program Files/PostgreSQL/${pg_ver}/bin" "C:/Program Files/PostgreSQL/${pg_ver}/bin"; do
      if [ -f "${pg_dir}/psql.exe" ] || [ -f "${pg_dir}/psql" ]; then
        export PATH="${pg_dir}:$PATH"
        PSQL_CMD="psql"
        echo "      Found psql in ${pg_dir}"
        break 2
      fi
    done
  done
  if [ -z "$PSQL_CMD" ]; then
    MISSING+=("psql (PostgreSQL client — install PostgreSQL or add its bin/ to PATH)")
  fi
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "ERROR: Missing required tools:"
  for tool in "${MISSING[@]}"; do
    echo "  - $tool"
  done
  echo ""
  echo "Install the missing tools and try again."
  exit 1
fi

# Verify npx can run supabase
if ! npx supabase --version &> /dev/null; then
  echo "ERROR: 'npx supabase' failed. Make sure npm/npx is working."
  exit 1
fi

# Check Docker is running
if ! docker info &> /dev/null 2>&1; then
  echo "ERROR: Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

echo "      All prerequisites found."
echo "      supabase CLI: $(npx supabase --version 2>/dev/null)"
echo "      psql:         $(psql --version 2>/dev/null)"

# ─── Step 2: Install npm dependencies ──────────────────────────────────────────

echo ""
echo "[2/6] Installing npm dependencies..."
cd "$PROJECT_DIR"
npm install
echo "      Dependencies installed."

# ─── Step 3: Start Supabase ────────────────────────────────────────────────────

echo ""
echo "[3/6] Starting local Supabase..."
echo "      This will start Postgres, Auth, Storage, and APIs."
echo "      Migrations will be applied automatically."
echo ""

cd "$PROJECT_DIR"
npx supabase start

echo ""
echo "      Supabase is running."

# ─── Step 4: Capture keys from supabase status ────────────────────────────────

echo ""
echo "[4/6] Capturing Supabase keys..."

# Capture status JSON once and parse individual fields
STATUS_JSON=$(npx supabase status -o json 2>/dev/null || true)

if [ -z "$STATUS_JSON" ]; then
  echo "ERROR: 'npx supabase status -o json' returned empty output."
  echo "Try running 'npx supabase status' manually to debug."
  exit 1
fi

# Extract values — try both possible JSON key formats (UPPER and lower)
extract_json_value() {
  local json="$1"
  local key="$2"
  echo "$json" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1
}

ANON_KEY=$(extract_json_value "$STATUS_JSON" "ANON_KEY")
[ -z "$ANON_KEY" ] && ANON_KEY=$(extract_json_value "$STATUS_JSON" "anon_key")

SERVICE_ROLE_KEY=$(extract_json_value "$STATUS_JSON" "SERVICE_ROLE_KEY")
[ -z "$SERVICE_ROLE_KEY" ] && SERVICE_ROLE_KEY=$(extract_json_value "$STATUS_JSON" "service_role_key")

API_URL=$(extract_json_value "$STATUS_JSON" "API_URL")
[ -z "$API_URL" ] && API_URL=$(extract_json_value "$STATUS_JSON" "api_url")
[ -z "$API_URL" ] && API_URL="http://127.0.0.1:54321"

STUDIO_URL=$(extract_json_value "$STATUS_JSON" "STUDIO_URL")
[ -z "$STUDIO_URL" ] && STUDIO_URL=$(extract_json_value "$STATUS_JSON" "studio_url")
[ -z "$STUDIO_URL" ] && STUDIO_URL="http://127.0.0.1:54323"

DB_URL=$(extract_json_value "$STATUS_JSON" "DB_URL")
[ -z "$DB_URL" ] && DB_URL=$(extract_json_value "$STATUS_JSON" "db_url")
[ -z "$DB_URL" ] && DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

if [ -z "$ANON_KEY" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "ERROR: Could not parse keys from supabase status."
  echo "Raw output:"
  echo "$STATUS_JSON"
  echo ""
  echo "Try running 'npx supabase status' manually to debug."
  exit 1
fi

echo "      Anon key:         ${ANON_KEY:0:20}..."
echo "      Service role key: ${SERVICE_ROLE_KEY:0:20}..."

# ─── Step 5: Generate .env files ───────────────────────────────────────────────

echo ""
echo "[5/6] Generating environment files..."

# Frontend .env.local
cat > "$PROJECT_DIR/.env.local" <<EOF
# Local Supabase — overrides .env for local development
# Generated by scripts/setup-local.sh on $(date)

VITE_SUPABASE_URL=${API_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY}
VITE_SUPABASE_PROJECT_ID=local
EOF
echo "      Created .env.local (frontend)"

# Edge functions supabase/.env.local
# Preserve any existing external API keys
EXISTING_GOOGLE_KEY="your-google-tts-key-here"
EXISTING_ANTHROPIC_KEY="your-anthropic-key-here"
EXISTING_LOVABLE_KEY="your-lovable-key-here"

if [ -f "$PROJECT_DIR/supabase/.env.local" ]; then
  EXISTING_GOOGLE_KEY=$(grep '^GOOGLE_CLOUD_TTS_API_KEY=' "$PROJECT_DIR/supabase/.env.local" | cut -d'=' -f2- || echo "your-google-tts-key-here")
  EXISTING_ANTHROPIC_KEY=$(grep '^ANTHROPIC_API_KEY=' "$PROJECT_DIR/supabase/.env.local" | cut -d'=' -f2- || echo "your-anthropic-key-here")
  EXISTING_LOVABLE_KEY=$(grep '^LOVABLE_API_KEY=' "$PROJECT_DIR/supabase/.env.local" | cut -d'=' -f2- || echo "your-lovable-key-here")
fi

cat > "$PROJECT_DIR/supabase/.env.local" <<EOF
# Supabase Edge Functions — Local Development Secrets
# Generated by scripts/setup-local.sh on $(date)

# Local Supabase (auto-set)
SUPABASE_URL=${API_URL}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# External APIs (fill these in manually)
GOOGLE_CLOUD_TTS_API_KEY=${EXISTING_GOOGLE_KEY}
ANTHROPIC_API_KEY=${EXISTING_ANTHROPIC_KEY}
LOVABLE_API_KEY=${EXISTING_LOVABLE_KEY}
EOF
echo "      Created supabase/.env.local (edge functions)"

# ─── Step 6: Seed the database ─────────────────────────────────────────────────

echo ""
echo "[6/6] Seeding database with content data..."
echo ""

export DATABASE_URL="$DB_URL"
bash "$SCRIPT_DIR/seed-db.sh"

# ─── Done! ─────────────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "  Supabase Studio:  ${STUDIO_URL}"
echo "  Supabase API:     ${API_URL}"
echo "  Database:         ${DB_URL}"
echo ""
echo "  Start the app:"
echo "    npm run dev"
echo "    Open http://localhost:8080"
echo ""
echo "  Start edge functions:"
echo "    npx supabase functions serve --env-file supabase/.env.local"
echo ""
echo "  Edge function secrets needed for full functionality:"
echo "    - GOOGLE_CLOUD_TTS_API_KEY  (google-tts function)"
echo "    - ANTHROPIC_API_KEY         (kanji-ocr function)"
echo "    - LOVABLE_API_KEY           (rafiq-chat function)"
echo "    Edit supabase/.env.local to add your keys."
echo ""
echo "============================================"
