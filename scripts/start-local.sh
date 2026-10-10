#!/usr/bin/env bash
# Terminal 3: runs the Vite dev server on http://localhost:5173 against a LOCAL Web.Api
# (default http://127.0.0.1:7299 — start it with lpserver's scripts/local-test/start-server.sh).
# Auth0 settings come from ux/.env.production; only the API address is overridden.
# See lpserver Documents/LocalDevelopment.md.
set -euo pipefail
UX="$(cd "$(dirname "${BASH_SOURCE[0]}")/../ux" && pwd)"
API_BASE="${API_BASE:-http://127.0.0.1:7299}"

cd "$UX"
if [[ ! -x node_modules/.bin/vite ]]; then
  echo "==> Installing dependencies"
  npm install --ignore-scripts
fi
curl -sf "$API_BASE/api/health/live" >/dev/null || echo "Warning: no API responding at $API_BASE (start the server first)."

set -a; source .env.production; set +a
export VITE_API_BASE_URL="$API_BASE"
echo "==> Client on http://localhost:5173 using API $VITE_API_BASE_URL"
# Port 5173 is required: Web.Api's CORS policy only allows the listed localhost ports.
exec npx vite --port 5173 --strictPort
