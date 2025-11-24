#!/bin/bash
set -e
TARGET_DIR=${1:-src}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/venv.sh"

activate_venv "${BASH_SOURCE[0]}"

ruff check --fix "$TARGET_DIR"
ruff format "$TARGET_DIR"