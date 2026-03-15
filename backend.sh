#!/bin/bash
set -e

echo "Starting Health Tracker Backend..."
source backend/venv/bin/activate
export PYTHONPATH=$PWD
python backend/main.py &
BACKEND_PID=$!

echo "Backend: http://localhost:8000"

