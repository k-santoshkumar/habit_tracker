from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import Tablet as TabletSchema, TabletCreate, TabletLog as TabletLogSchema, TabletLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/timings")
async def get_timings():
    try:
        t_list = await db.tablet_timings.find().to_list(length=100)
        return {"success": True, "data": [t["name"] for t in t_list]}
    except Exception as e:
        print(f"Error in get_timings: {e}")
        return {"success": False, "error": str(e)}

@router.get("/")
async def get_tablets(current_user: UserInDB = Depends(get_current_user)):
    try:
        tablets = await db.tablets.find({"user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [TabletSchema(**fix_id(t)) for t in tablets]}
    except Exception as e:
        print(f"Error in get_tablets: {e}")
        return {"success": False, "error": str(e)}

@router.post("/")
async def create_tablet(tablet: TabletCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        data = tablet.model_dump()
        data["user_email"] = current_user.email
        result = await db.tablets.insert_one(data)
        data["id"] = str(result.inserted_id)
        return {"success": True, "data": TabletSchema(**data)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("/{tablet_id}")
async def delete_tablet(tablet_id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        await db.tablets.delete_one({"_id": ObjectId(tablet_id), "user_email": current_user.email})
        return {"success": True, "data": None}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/logs/{date_str}")
async def get_tablet_logs(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        logs = await db.tablet_logs.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [TabletLogSchema(**fix_id(log)) for log in logs]}
    except Exception as e:
        print(f"Error in get_tablet_logs: {e}")
        return {"success": False, "error": str(e)}

@router.post("/logs")
async def log_tablet(log: TabletLogCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        filter_query = {"date": log.date, "tablet_id": log.tablet_id, "user_email": current_user.email}
        data = log.model_dump()
        data["user_email"] = current_user.email
        await db.tablet_logs.update_one(filter_query, {"$set": data}, upsert=True)
        
        # Return updated logs for the day
        logs = await db.tablet_logs.find({"date": log.date, "user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [TabletLogSchema(**fix_id(l)) for l in logs]}
    except Exception as e:
        print(f"Error in log_tablet: {e}")
        return {"success": False, "error": str(e)}
