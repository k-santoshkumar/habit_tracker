from fastapi import APIRouter
from backend.database import db
from backend.schemas import SleepLog as SleepLogSchema, SleepLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

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
