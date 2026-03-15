from fastapi import APIRouter
from backend.database import db
from backend.schemas import Reflection as ReflectionSchema, ReflectionCreate
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/{date_str}")
async def get_reflection(date_str: str):
    ref = await db.reflections.find_one({"date": date_str})
    if not ref:
        return {"success": True, "data": None}
    return {"success": True, "data": ReflectionSchema(**fix_id(ref))}

@router.post("/")
async def create_reflection(reflection: ReflectionCreate):
    filter_query = {"date": reflection.date}
    data = reflection.model_dump()
    data["created_at"] = datetime.now()
    await db.reflections.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
