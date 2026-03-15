#!/bin/bash
set -e

echo "Starting Health Tracker Backend..."
python -m backend.main &
BACKEND_PID=$!
echo "Backend: http://localhost:8000"

