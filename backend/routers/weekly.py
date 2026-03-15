from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, timedelta
from backend.database import get_db
from backend.models import DailyScore, SleepLog, MoodEntry, CustomHabitLog, ActivityLog, TabletLog, MealLog, WaterLog

router = APIRouter()

@router.get("/{date_str}")
async def get_weekly_review(date_str: str, db: AsyncSession = Depends(get_db)):
    """Generate a weekly review for the week ending on date_str"""
    try:
        end_date = date.fromisoformat(date_str)
    except:
        end_date = date.today()
    
    start_date = end_date - timedelta(days=6)
    dates = [str(start_date + timedelta(days=i)) for i in range(7)]
    
    # Daily scores
    scores_q = await db.execute(select(DailyScore).filter(DailyScore.date.in_(dates)))
    scores = {s.date: s.score for s in scores_q.scalars().all()}
    
    daily_scores = [{"date": d, "score": scores.get(d, 0)} for d in dates]
    avg_score = sum(s["score"] for s in daily_scores) / max(len([s for s in daily_scores if s["score"] > 0]), 1)
    best_day = max(daily_scores, key=lambda x: x["score"]) if daily_scores else None
    worst_day = min([s for s in daily_scores if s["score"] > 0], key=lambda x: x["score"]) if any(s["score"] > 0 for s in daily_scores) else None
    
    # Sleep summary
    sleep_q = await db.execute(select(SleepLog).filter(SleepLog.date.in_(dates)))
    sleeps = sleep_q.scalars().all()
    avg_sleep = sum(s.duration_min for s in sleeps) / max(len(sleeps), 1) if sleeps else 0
    avg_quality = sum(s.quality for s in sleeps) / max(len(sleeps), 1) if sleeps else 0
    
    # Mood summary
    mood_q = await db.execute(select(MoodEntry).filter(MoodEntry.date.in_(dates)))
    moods = mood_q.scalars().all()
    avg_mood = sum(m.mood for m in moods) / max(len(moods), 1) if moods else 0
    
    # Habits completion for the week
    habits_q = await db.execute(select(CustomHabitLog).filter(CustomHabitLog.date.in_(dates), CustomHabitLog.completed == True))
    habits_completed = len(habits_q.scalars().all())
    
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
