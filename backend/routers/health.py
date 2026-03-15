from fastapi import APIRouter
from backend.database import db
from backend.schemas import HealthMetric as HealthMetricSchema, HealthMetricCreate, MetricEntry as MetricEntrySchema, MetricEntryCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/presets")
async def get_presets():
    presets = await db.health_presets.find().to_list(length=100)
    return {"success": True, "data": [fix_id(p) for p in presets]}

@router.get("/metrics")
async def get_metrics():
    metrics = await db.health_metrics.find().to_list(length=100)
    return {"success": True, "data": [HealthMetricSchema(**fix_id(m)) for m in metrics]}

@router.post("/metrics")
async def create_metric(metric: HealthMetricCreate):
    data = metric.model_dump()
    result = await db.health_metrics.insert_one(data)
    data["id"] = str(result.inserted_id)
    return {"success": True, "data": HealthMetricSchema(**data)}

@router.get("/entries")
async def get_entries():
    entries = await db.metric_entries.find().to_list(length=1000)
    return {"success": True, "data": [MetricEntrySchema(**fix_id(e)) for e in entries]}

@router.post("/entries")
async def log_entry(entry: MetricEntryCreate):
    # For simplicity, we filter by date and metric_id to update or insert
    filter_query = {"date": entry.date, "metric_id": entry.metric_id}
    data = entry.model_dump()
    await db.metric_entries.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
