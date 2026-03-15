from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import Reflection as ReflectionSchema, ReflectionCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/{date_str}")
async def get_reflection(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    ref = await db.reflections.find_one({"date": date_str, "user_email": current_user.email})
    if not ref:
        return {"success": True, "data": None}
    return {"success": True, "data": ReflectionSchema(**fix_id(ref))}

@router.post("/")
async def create_reflection(reflection: ReflectionCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": reflection.date, "user_email": current_user.email}
    data = reflection.model_dump()
    data["created_at"] = datetime.now()
    data["user_email"] = current_user.email
    await db.reflections.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
