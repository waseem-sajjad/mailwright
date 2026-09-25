#!/usr/bin/env bash
# Creates the Python environment for fine-tuning and serving on a CPU VPS.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -r ai/requirements.txt
echo "Ready. Next: python3 ai/pipeline.py"
