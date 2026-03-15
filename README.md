# Health Tracker

A full-stack personal health and lifestyle tracking web app built with React (Vite) + TailwindCSS for the frontend and Python FastAPI + SQLite for the backend.

## Prerequisites
- Node.js (for npm)
- Python 3.x
- macOS/Linux/WSL

## Setup
The necessary dependencies are included and scaffolded. If you are starting fresh:
1. `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
2. `cd frontend && npm install`

## Running the App
Run the following scripts from the root directory:

1. **Backend**: `chmod +x backend.sh && ./backend.sh`
2. **Frontend**: `cd frontend && npm run dev`

Alternatively, run as a module: `python -m backend.main`

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Features
- **Dashboard**: Track daily score, streaks, and a 12-week heatmap. Reflection prompt displays automatically after 8 PM.
- **Tablets Tracker**: Manage daily tablets categorized by timing.
- **Diet & Water Tracker**: Manage meal slots, protein, and water consumption.
- **Study & Habits Tracker**: Stay on top of learning tracks.
- **Activities**: Log custom activities duration and intensity.
- **Health Metrics**: Input custom health metrics entries.
- **Insights**: Find patterns and stay engaged with automatically extracted data insights!
- **Dark/Light Mode**: Persisted local theme settings.
- **PWA Ready**: Mobile-friendly, capable of installing to homescreen.

Enjoy daily habit tracking and building consistently better routines. 
