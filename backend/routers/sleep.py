from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import SleepLog as SleepLogSchema, SleepLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/options")
async def get_sleep_options():
    opts = await db.sleep_quality_options.find().to_list(length=10)
    return {"success": True, "data": [fix_id(o) for o in opts]}

@router.get("/history")
async def get_sleep_history(current_user: UserInDB = Depends(get_current_user)):
    logs = await db.sleep_logs.find({"user_email": current_user.email}).sort("date", -1).to_list(length=100)
    return {"success": True, "data": [SleepLogSchema(**fix_id(l)) for l in logs]}

@router.get("/{date_str}")
async def get_sleep(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    log = await db.sleep_logs.find_one({"date": date_str, "user_email": current_user.email})
    if not log:
        return {"success": True, "data": None}
    return {"success": True, "data": SleepLogSchema(**fix_id(log))}

@router.post("/")
async def log_sleep(log: SleepLogCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": log.date, "user_email": current_user.email}
    data = log.model_dump()
    data["user_email"] = current_user.email
    await db.sleep_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
