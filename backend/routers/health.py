from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import HealthMetric as HealthMetricSchema, HealthMetricCreate, MetricEntry as MetricEntrySchema, MetricEntryCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/presets")
async def get_presets():
    presets = await db.health_presets.find().to_list(length=100)
    return {"success": True, "data": [fix_id(p) for p in presets]}

@router.get("/metrics")
async def get_metrics(current_user: UserInDB = Depends(get_current_user)):
    metrics = await db.health_metrics.find({"user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [HealthMetricSchema(**fix_id(m)) for m in metrics]}

@router.post("/metrics")
async def create_metric(metric: HealthMetricCreate, current_user: UserInDB = Depends(get_current_user)):
    data = metric.model_dump()
    data["user_email"] = current_user.email
    result = await db.health_metrics.insert_one(data)
    data["id"] = str(result.inserted_id)
    return {"success": True, "data": HealthMetricSchema(**data)}

@router.get("/entries")
async def get_entries(current_user: UserInDB = Depends(get_current_user)):
    entries = await db.metric_entries.find({"user_email": current_user.email}).to_list(length=1000)
    return {"success": True, "data": [MetricEntrySchema(**fix_id(e)) for e in entries]}

@router.post("/entries")
async def log_entry(entry: MetricEntryCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": entry.date, "metric_id": entry.metric_id, "user_email": current_user.email}
    data = entry.model_dump()
    data["user_email"] = current_user.email
    await db.metric_entries.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
