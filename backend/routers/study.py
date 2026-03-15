from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import StudyTrack as StudyTrackSchema, StudyTrackCreate, StudyTopic as StudyTopicSchema, StudyTopicCreate, StudyHabit as StudyHabitSchema, StudyHabitCreate, HabitLog as HabitLogSchema, HabitLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/tracks")
async def get_tracks(current_user: UserInDB = Depends(get_current_user)):
    tracks = await db.study_tracks.find({"user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [StudyTrackSchema(**fix_id(t)) for t in tracks]}

@router.post("/tracks")
async def create_track(track: StudyTrackCreate, current_user: UserInDB = Depends(get_current_user)):
    data = track.model_dump()
    data["user_email"] = current_user.email
    res = await db.study_tracks.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": StudyTrackSchema(**data)}

@router.get("/topics/{track_id}")
async def get_topics(track_id: str, current_user: UserInDB = Depends(get_current_user)):
    # Verify track belongs to user
    track = await db.study_tracks.find_one({"_id": ObjectId(track_id), "user_email": current_user.email})
    if not track:
        return {"success": False, "error": "Track not found"}
    
    topics = await db.study_topics.find({"track_id": track_id, "user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [StudyTopicSchema(**fix_id(t)) for t in topics]}

@router.post("/topics")
async def create_topic(topic: StudyTopicCreate, current_user: UserInDB = Depends(get_current_user)):
    # Verify track belongs to user
    track = await db.study_tracks.find_one({"_id": ObjectId(topic.track_id), "user_email": current_user.email})
    if not track:
        return {"success": False, "error": "Track not found"}

    data = topic.model_dump()
    data["user_email"] = current_user.email
    res = await db.study_topics.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": StudyTopicSchema(**data)}

@router.get("/habits")
async def get_habits(current_user: UserInDB = Depends(get_current_user)):
    habits = await db.study_habits.find({"user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [StudyHabitSchema(**fix_id(h)) for h in habits]}

@router.post("/habits")
async def create_habit(habit: StudyHabitCreate, current_user: UserInDB = Depends(get_current_user)):
    data = habit.model_dump()
    data["user_email"] = current_user.email
    res = await db.study_habits.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": StudyHabitSchema(**data)}

@router.get("/habit-logs/{date_str}")
async def get_habit_logs(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    logs = await db.study_habit_logs.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [HabitLogSchema(**fix_id(l)) for l in logs]}

@router.post("/habit-logs")
async def log_habit(log: HabitLogCreate, current_user: UserInDB = Depends(get_current_user)):
    filter_query = {"date": log.date, "habit_id": log.habit_id, "user_email": current_user.email}
    data = log.model_dump()
    data["user_email"] = current_user.email
    await db.study_habit_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
