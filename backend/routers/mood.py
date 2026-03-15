from fastapi import APIRouter
from backend.database import db
from backend.schemas import MoodEntry as MoodEntrySchema, MoodEntryCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/")
async def get_moods():
    moods = await db.mood_entries.find().sort("date", -1).to_list(length=100)
    return {"success": True, "data": [MoodEntrySchema(**fix_id(m)) for m in moods]}

@router.post("/")
async def log_mood(mood: MoodEntryCreate):
    filter_query = {"date": mood.date}
    data = mood.model_dump()
    await db.mood_entries.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
