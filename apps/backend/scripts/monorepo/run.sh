#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/venv.sh"

activate_venv "${BASH_SOURCE[0]}"

cd "$BACKEND_DIR"

# Create a folder to store logs.
LOG_DIR="logs"
if [[ ! -d "$LOG_DIR" ]]; then
  mkdir -p "$LOG_DIR"
fi

LOG_CONFIG=${LOG_CONFIG:-logging.ini}

exec uvicorn src.main:app --reload --port 16000 --log-config "$LOG_CONFIG"
