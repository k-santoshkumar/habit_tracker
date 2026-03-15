#!/bin/bash
set -e

echo "Starting Health Tracker Backend..."
python backend/main.py &
BACKEND_PID=$!
echo "Backend: http://localhost:8000"

