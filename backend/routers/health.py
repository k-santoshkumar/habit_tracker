from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import HealthMetric, MetricEntry
from backend.schemas import HealthMetricCreate, MetricEntryCreate

router = APIRouter()

@router.get("/metrics")
async def get_health_metrics(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(HealthMetric))
    metrics = query.scalars().all()
    return {"success": True, "data": [{"id": m.id, "name": m.name, "unit": m.unit, "min_range": m.min_range, "max_range": m.max_range} for m in metrics]}

@router.post("/metrics")
async def create_health_metric(metric: HealthMetricCreate, db: AsyncSession = Depends(get_db)):
    new_m = HealthMetric(**metric.model_dump())
    db.add(new_m)
    await db.commit()
    await db.refresh(new_m)
    return {"success": True, "data": {"id": new_m.id, "name": new_m.name, "unit": new_m.unit}}

@router.get("/entries/{metric_id}")
async def get_metric_entries(metric_id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MetricEntry).filter(MetricEntry.metric_id == metric_id).order_by(MetricEntry.date.desc()).limit(30))
    entries = query.scalars().all()
    return {"success": True, "data": [{"id": e.id, "date": e.date, "value": e.value, "notes": e.notes} for e in entries]}

@router.post("/entries")
async def add_metric_entry(entry: MetricEntryCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MetricEntry).filter(MetricEntry.date == entry.date, MetricEntry.metric_id == entry.metric_id))
    existing = query.scalars().first()
    if existing:
        existing.value = entry.value
        existing.notes = entry.notes
    else:
        new_entry = MetricEntry(**entry.model_dump())
        db.add(new_entry)
    await db.commit()
    return {"success": True, "data": None}
