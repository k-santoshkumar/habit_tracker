from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import ActivityType, ActivityLog
from backend.schemas import ActivityTypeCreate, ActivityLogCreate

router = APIRouter()

@router.get("/types")
async def get_activity_types(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(ActivityType))
    types = query.scalars().all()
    return {"success": True, "data": [{"id": t.id, "name": t.name, "icon": t.icon, "color_tag": t.color_tag, "schedule_days": t.schedule_days} for t in types]}

@router.post("/types")
async def create_activity_type(atype: ActivityTypeCreate, db: AsyncSession = Depends(get_db)):
    new_type = ActivityType(**atype.model_dump())
    db.add(new_type)
    await db.commit()
    await db.refresh(new_type)
    return {"success": True, "data": {"id": new_type.id, "name": new_type.name, "icon": new_type.icon, "color_tag": new_type.color_tag, "schedule_days": new_type.schedule_days}}

@router.get("/logs/{date_str}")
async def get_activity_logs(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(ActivityLog).filter(ActivityLog.date == date_str))
    logs = query.scalars().all()
    return {"success": True, "data": [{"id": l.id, "activity_type_id": l.activity_type_id, "done": l.done, "duration_min": l.duration_min, "intensity": l.intensity, "notes": l.notes, "water_consumed_ml": l.water_consumed_ml} for l in logs]}

@router.post("/logs")
async def log_activity(log: ActivityLogCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(ActivityLog).filter(ActivityLog.date == log.date, ActivityLog.activity_type_id == log.activity_type_id))
    existing = query.scalars().first()
    if existing:
        for k, v in log.model_dump().items():
            setattr(existing, k, v)
    else:
        new_log = ActivityLog(**log.model_dump())
        db.add(new_log)
    await db.commit()
    return {"success": True, "data": None}
