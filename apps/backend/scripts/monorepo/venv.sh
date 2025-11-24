#!/usr/bin/env bash
set -e

# Resolve script dir of the caller
get_script_dir() {
    local SRC="$1"
    local DIR
    DIR="$(cd "$(dirname "$SRC")" && pwd)"
    echo "$DIR"
}

# Initialize and activate venv
activate_venv() {
    local SCRIPT_DIR
    SCRIPT_DIR=$(get_script_dir "$1")
    export BACKEND_DIR
    BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
    export VENV_PATH
    VENV_PATH="$BACKEND_DIR/.venv"

    echo "Backend root directory: $BACKEND_DIR"
    echo "Virtual environment path: $VENV_PATH"

    OS_NAME=$(uname)
    echo "Detected OS: $OS_NAME"

    if [ ! -d "$VENV_PATH" ]; then
        echo "Virtual environment not found, creating .venv..."
        python3 -m venv "$VENV_PATH"
    fi

    if [ "$OS_NAME" = "Linux" ] || [ "$OS_NAME" = "Darwin" ]; then
        source "$VENV_PATH/bin/activate"
    elif [[ "$OS_NAME" == *"MINGW"* || "$OS_NAME" == *"CYGWIN"* || "$OS_NAME" == *"MSYS"* ]]; then
        source "$VENV_PATH/Scripts/activate"
    else
        echo "Unsupported operating system: $OS_NAME"
        return 1
    fi
}
