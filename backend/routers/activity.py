from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import ActivityType as ActivityTypeSchema, ActivityTypeCreate, ActivityLog as ActivityLogSchema, ActivityLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/suggestions")
async def get_suggestions():
    s_list = await db.activity_suggestions.find().to_list(length=100)
    return {"success": True, "data": [s["name"] for s in s_list]}

@router.get("/types")
async def get_activity_types(current_user: UserInDB = Depends(get_current_user)):
    types = await db.activity_types.find({"user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [ActivityTypeSchema(**fix_id(t)) for t in types]}

@router.post("/types")
async def create_activity_type(activity_type: ActivityTypeCreate, current_user: UserInDB = Depends(get_current_user)):
    data = activity_type.model_dump()
    data["user_email"] = current_user.email
    res = await db.activity_types.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": ActivityTypeSchema(**data)}

@router.get("/logs/{date_str}")
async def get_activity_logs(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    logs = await db.activity_logs.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [ActivityLogSchema(**fix_id(l)) for l in logs]}

@router.post("/logs")
async def log_activity(log: ActivityLogCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": log.date, "activity_type_id": log.activity_type_id, "user_email": current_user.email}
    data = log.model_dump()
    data["user_email"] = current_user.email
    await db.activity_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}

@router.delete("/types/{type_id}")
async def delete_activity_type(type_id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        await db.activity_logs.delete_many({"activity_type_id": type_id, "user_email": current_user.email})
        await db.activity_types.delete_one({"_id": ObjectId(type_id), "user_email": current_user.email})
        return {"success": True, "data": None}
    except Exception as e:
        return {"success": False, "error": str(e)}
