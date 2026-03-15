from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import MoodEntry as MoodEntrySchema, MoodEntryCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/options")
async def get_mood_options():
    opts = await db.mood_options.find_one()
    if opts:
        opts.pop("_id", None)
    return {"success": True, "data": opts}

@router.get("/entries")
async def get_moods(current_user: UserInDB = Depends(get_current_user)):
    moods = await db.mood_entries.find({"user_email": current_user.email}).sort("date", -1).to_list(length=100)
    return {"success": True, "data": [MoodEntrySchema(**fix_id(m)) for m in moods]}

@router.get("/entries/{date_str}")
async def get_mood_entry(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    mood = await db.mood_entries.find_one({"date": date_str, "user_email": current_user.email})
    return {"success": True, "data": MoodEntrySchema(**fix_id(mood)) if mood else None}

@router.post("/entries")
async def log_mood(mood: MoodEntryCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": mood.date, "user_email": current_user.email}
    data = mood.model_dump()
    data["user_email"] = current_user.email
    await db.mood_entries.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
