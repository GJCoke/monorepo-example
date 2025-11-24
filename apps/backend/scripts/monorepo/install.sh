#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/venv.sh"

activate_venv "${BASH_SOURCE[0]}"

if [ -f "$BACKEND_DIR/pyproject.toml" ]; then
    echo "Installing dependencies from pyproject.toml..."
    pip install -e "$BACKEND_DIR[dev]"
fi

