from fastapi import APIRouter
from backend.database import db
from backend.schemas import Habit as HabitSchema, HabitCreate, HabitLog as HabitLogSchema, HabitLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/suggestions")
async def get_suggestions():
    s_list = await db.habit_suggestions.find().to_list(length=100)
    return {"success": True, "data": [s["name"] for s in s_list]}

@router.get("/")
async def get_habits():
    habits = await db.habits.find().to_list(length=100)
    return {"success": True, "data": [HabitSchema(**fix_id(h)) for h in habits]}

@router.post("/")
async def create_habit(habit: HabitCreate):
    data = habit.model_dump()
    res = await db.habits.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": HabitSchema(**data)}

@router.get("/logs/{date_str}")
async def get_habit_logs(date_str: str):
    logs = await db.habit_logs.find({"date": date_str}).to_list(length=100)
    return {"success": True, "data": [HabitLogSchema(**fix_id(l)) for l in logs]}

@router.post("/logs")
async def log_habit(log: HabitLogCreate):
    filter_query = {"date": log.date, "habit_id": log.habit_id}
    data = log.model_dump()
    await db.habit_logs.update_one(filter_query, {"$set": data}, upsert=True)
    return {"success": True, "data": None}
