from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import SleepLog

router = APIRouter()

@router.get("/logs")
async def get_sleep_logs(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(SleepLog).order_by(SleepLog.date.desc()).limit(30))
    logs = query.scalars().all()
    return {"success": True, "data": [
        {"id": l.id, "date": l.date, "sleep_time": l.sleep_time, "wake_time": l.wake_time,
         "quality": l.quality, "duration_min": l.duration_min, "notes": l.notes}
        for l in logs
    ]}

@router.get("/logs/{date_str}")
async def get_sleep_log(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(SleepLog).filter(SleepLog.date == date_str))
    log = query.scalars().first()
    if not log:
        return {"success": True, "data": None}
    return {"success": True, "data": {
        "id": log.id, "date": log.date, "sleep_time": log.sleep_time,
        "wake_time": log.wake_time, "quality": log.quality,
        "duration_min": log.duration_min, "notes": log.notes
    }}

@router.post("/logs")
async def save_sleep_log(data: dict, db: AsyncSession = Depends(get_db)):
    # Calculate duration
    try:
        sh, sm = map(int, data["sleep_time"].split(":"))
        wh, wm = map(int, data["wake_time"].split(":"))
        sleep_mins = sh * 60 + sm
        wake_mins = wh * 60 + wm
        if wake_mins < sleep_mins:
            duration = (1440 - sleep_mins) + wake_mins
        else:
            duration = wake_mins - sleep_mins
    except:
        duration = 0

    query = await db.execute(select(SleepLog).filter(SleepLog.date == data["date"]))
    existing = query.scalars().first()
    if existing:
        existing.sleep_time = data["sleep_time"]
        existing.wake_time = data["wake_time"]
        existing.quality = data.get("quality", 3)
        existing.duration_min = duration
        existing.notes = data.get("notes")
    else:
        new_log = SleepLog(
            date=data["date"], sleep_time=data["sleep_time"],
            wake_time=data["wake_time"], quality=data.get("quality", 3),
            duration_min=duration, notes=data.get("notes")
        )
        db.add(new_log)
    await db.commit()
    return {"success": True, "data": {"duration_min": duration}}
