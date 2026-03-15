#!/bin/bash
set -e

# Ensure we are in the root directory and Python can find the 'backend' module
export PYTHONPATH=$PYTHONPATH:.

echo "Starting Health Tracker Backend..."
# Run in foreground so Render knows the app is alive. 
# Use the system python (which has dependencies from requirements.txt)
# backend/venv/bin/python -m backend.main
python -m backend.main
