from fastapi import APIRouter
from backend.database import db
from backend.schemas import MoodEntry as MoodEntrySchema, MoodEntryCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/options")
async def get_mood_options():
    opts = await db.mood_options.find_one()
    if opts:
        opts.pop("_id", None)
    return {"success": True, "data": opts}

@router.get("/entries")
async def get_moods():
    moods = await db.mood_entries.find().sort("date", -1).to_list(length=100)
    return {"success": True, "data": [MoodEntrySchema(**fix_id(m)) for m in moods]}

@router.get("/entries/{date_str}")
async def get_mood_entry(date_str: str):
    mood = await db.mood_entries.find_one({"date": date_str})
    return {"success": True, "data": MoodEntrySchema(**fix_id(mood)) if mood else None}

@router.post("/entries")
async def log_mood(mood: MoodEntryCreate):
    filter_query = {"date": mood.date}
    data = mood.model_dump()
    await db.mood_entries.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
