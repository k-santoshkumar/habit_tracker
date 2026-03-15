from fastapi import APIRouter
from backend.database import db
from backend.schemas import ActivityType as ActivityTypeSchema, ActivityTypeCreate, ActivityLog as ActivityLogSchema, ActivityLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/suggestions")
async def get_suggestions():
    s_list = await db.activity_suggestions.find().to_list(length=100)
    return {"success": True, "data": [s["name"] for s in s_list]}

@router.get("/types")
async def get_activity_types():
    types = await db.activity_types.find().to_list(length=100)
    return {"success": True, "data": [ActivityTypeSchema(**fix_id(t)) for t in types]}

@router.post("/types")
async def create_activity_type(activity_type: ActivityTypeCreate):
    data = activity_type.model_dump()
    res = await db.activity_types.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": ActivityTypeSchema(**data)}

@router.get("/logs/{date_str}")
async def get_activity_logs(date_str: str):
    logs = await db.activity_logs.find({"date": date_str}).to_list(length=100)
    return {"success": True, "data": [ActivityLogSchema(**fix_id(l)) for l in logs]}

@router.post("/logs")
async def log_activity(log: ActivityLogCreate):
    filter_query = {"date": log.date, "activity_type_id": log.activity_type_id}
    data = log.model_dump()
    await db.activity_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
