from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.database import get_db
from backend.models import Tablet, TabletLog
from backend.schemas import Tablet as TabletSchema, TabletCreate, TabletLog as TabletLogSchema, TabletLogCreate

router = APIRouter()

@router.get("/", response_model=dict)
async def get_tablets(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Tablet))
    tablets = query.scalars().all()
    return {"success": True, "data": [TabletSchema.model_validate(t) for t in tablets]}

@router.post("/", response_model=dict)
async def create_tablet(tablet: TabletCreate, db: AsyncSession = Depends(get_db)):
    new_tablet = Tablet(**tablet.model_dump())
    db.add(new_tablet)
    await db.commit()
    await db.refresh(new_tablet)
    return {"success": True, "data": TabletSchema.model_validate(new_tablet)}

@router.delete("/{tablet_id}")
async def delete_tablet(tablet_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Tablet).where(Tablet.id == tablet_id))
    await db.commit()
    return {"success": True, "data": None}

@router.get("/logs/{date_str}")
async def get_tablet_logs(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(TabletLog).filter(TabletLog.date == date_str))
    logs = query.scalars().all()
    return {"success": True, "data": [TabletLogSchema.model_validate(log) for log in logs]}

@router.post("/logs")
async def log_tablet(log: TabletLogCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(TabletLog).filter(TabletLog.date == log.date, TabletLog.tablet_id == log.tablet_id))
    existing_log = query.scalars().first()
    
    if existing_log:
        existing_log.status = log.status
    else:
        new_log = TabletLog(**log.model_dump())
        db.add(new_log)
    
    await db.commit()
    
    # Return updated logs for the day
    query = await db.execute(select(TabletLog).filter(TabletLog.date == log.date))
    logs = query.scalars().all()
    return {"success": True, "data": [TabletLogSchema.model_validate(l) for l in logs]}
