from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI(title="Health Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Routers
from backend.routers import profile, tablets, diet, study, activity, health, dashboard, insights, reflections, settings
from backend.routers import sleep, mood, habits, goals, pomodoro, weekly, photos, auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(tablets.router, prefix="/api/tablets")
app.include_router(diet.router, prefix="/api/diet")
app.include_router(study.router, prefix="/api/study")
app.include_router(activity.router, prefix="/api/activity")
app.include_router(health.router, prefix="/api/health")
app.include_router(insights.router, prefix="/api/insights")
app.include_router(reflections.router, prefix="/api/reflections")
app.include_router(settings.router, prefix="/api/settings")
app.include_router(sleep.router, prefix="/api/sleep")
app.include_router(mood.router, prefix="/api/mood")
app.include_router(habits.router, prefix="/api/habits")
app.include_router(goals.router, prefix="/api/goals")
app.include_router(pomodoro.router, prefix="/api/pomodoro")
app.include_router(weekly.router, prefix="/api/weekly")
app.include_router(photos.router, prefix="/api/photos")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # reload=True is for local development, Render needs reload=False or it may cause issues
    is_dev = os.environ.get("RENDER") is None
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=is_dev)
