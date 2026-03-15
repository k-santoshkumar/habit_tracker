from fastapi import APIRouter
from backend.database import db
from datetime import date, timedelta

router = APIRouter()

@router.get("/{date_str}")
async def get_weekly_review(date_str: str):
    """Generate a weekly review for the week ending on date_str"""
    try:
        end_date = date.fromisoformat(date_str)
    except:
        end_date = date.today()
    
    start_date = end_date - timedelta(days=6)
    dates = [str(start_date + timedelta(days=i)) for i in range(7)]
    
    # Daily scores
    scores_cursor = db.daily_scores.find({"date": {"$in": dates}})
    scores_list = await scores_cursor.to_list(length=10)
    scores = {s["date"]: s["score"] for s in scores_list}
    
    daily_scores = [{"date": d, "score": scores.get(d, 0)} for d in dates]
    logged_scores = [s["score"] for s in daily_scores if s["score"] > 0]
    avg_score = sum(logged_scores) / max(len(logged_scores), 1)
    best_day = max(daily_scores, key=lambda x: x["score"]) if daily_scores else None
    worst_day = min([s for s in daily_scores if s["score"] > 0], key=lambda x: x["score"]) if logged_scores else None
    
    # Sleep summary
    sleeps = await db.sleep_logs.find({"date": {"$in": dates}}).to_list(length=10)
    avg_sleep = sum(s.get("duration_min", 0) for s in sleeps) / max(len(sleeps), 1) if sleeps else 0
    avg_quality = sum(s.get("quality", 3) for s in sleeps) / max(len(sleeps), 1) if sleeps else 0
    
    # Mood summary
    moods = await db.mood_entries.find({"date": {"$in": dates}}).to_list(length=10)
    avg_mood = sum(m.get("mood", 3) for m in moods) / max(len(moods), 1) if moods else 0
    
    # Habits completion for the week
    habits_completed = await db.habit_logs.count_documents({"date": {"$in": dates}, "checked": True})
    
    return {"success": True, "data": {
        "week_start": dates[0],
        "week_end": dates[-1],
        "daily_scores": daily_scores,
        "avg_score": round(avg_score, 1),
        "best_day": best_day,
        "worst_day": worst_day,
        "sleep": {"avg_duration_min": round(avg_sleep), "avg_quality": round(avg_quality, 1), "nights_logged": len(sleeps)},
        "mood": {"avg_mood": round(avg_mood, 1), "entries": len(moods)},
        "habits_completed": habits_completed,
    }}
