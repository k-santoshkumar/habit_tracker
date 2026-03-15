from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.database import get_db
from backend.models import PomodoroSession

router = APIRouter()

@router.get("/sessions/{date_str}")
async def get_sessions(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(PomodoroSession).filter(PomodoroSession.date == date_str).order_by(PomodoroSession.created_at.desc()))
    sessions = query.scalars().all()
    return {"success": True, "data": [
        {"id": s.id, "date": s.date, "duration_min": s.duration_min,
         "break_min": s.break_min, "label": s.label, "completed": s.completed}
        for s in sessions
    ]}

@router.post("/sessions")
async def log_session(data: dict, db: AsyncSession = Depends(get_db)):
    session = PomodoroSession(
        date=data["date"], duration_min=data.get("duration_min", 25),
        break_min=data.get("break_min", 5), label=data.get("label"),
        completed=data.get("completed", True)
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"success": True, "data": {"id": session.id}}

@router.get("/stats")
async def get_pomodoro_stats(db: AsyncSession = Depends(get_db)):
    # Total sessions
    total_q = await db.execute(select(func.count(PomodoroSession.id)).filter(PomodoroSession.completed == True))
    total = total_q.scalar() or 0
    
    # Total minutes
    mins_q = await db.execute(select(func.sum(PomodoroSession.duration_min)).filter(PomodoroSession.completed == True))
    total_mins = mins_q.scalar() or 0
    
    # Today's sessions
    from datetime import date
    today = str(date.today())
    today_q = await db.execute(select(func.count(PomodoroSession.id)).filter(
        PomodoroSession.completed == True, PomodoroSession.date == today
    ))
    today_count = today_q.scalar() or 0
    
    return {"success": True, "data": {
        "total_sessions": total, "total_minutes": total_mins, "today_sessions": today_count
    }}
