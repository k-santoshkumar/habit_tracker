#!/bin/bash
set -e

cd frontend
echo "Starting Health Tracker Frontend..."
npm run dev -- --host --force &
FRONTEND_PID=$!

echo "Frontend: http://localhost:5173"

trap "kill $FRONTEND_PID" EXIT

wait
