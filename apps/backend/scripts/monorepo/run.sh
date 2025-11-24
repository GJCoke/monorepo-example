#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/venv.sh"

activate_venv "${BASH_SOURCE[0]}"

cd "$BACKEND_DIR"

exec uvicorn src.main:app --reload --port 8006
