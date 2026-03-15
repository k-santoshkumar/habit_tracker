from fastapi import APIRouter
from backend.database import db
from backend.schemas import SleepLog as SleepLogSchema, SleepLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/options")
async def get_sleep_options():
    opts = await db.sleep_quality_options.find().to_list(length=10)
    return {"success": True, "data": [fix_id(o) for o in opts]}

@router.get("/history")
async def get_sleep_history():
    logs = await db.sleep_logs.find().sort("date", -1).to_list(length=100)
    return {"success": True, "data": [SleepLogSchema(**fix_id(l)) for l in logs]}

@router.get("/{date_str}")
async def get_sleep(date_str: str):
    log = await db.sleep_logs.find_one({"date": date_str})
    if not log:
        return {"success": True, "data": None}
    return {"success": True, "data": SleepLogSchema(**fix_id(log))}

@router.post("/")
async def log_sleep(log: SleepLogCreate):
    filter_query = {"date": log.date}
    data = log.model_dump()
    await db.sleep_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
