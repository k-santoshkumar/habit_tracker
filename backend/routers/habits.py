from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import Habit as HabitSchema, HabitCreate, HabitLog as HabitLogSchema, HabitLogCreate, UserInDB
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
    try:
        s_list = await db.habit_suggestions.find().to_list(length=100)
        return {"success": True, "data": [s["name"] for s in s_list]}
    except Exception as e:
        print(f"Error in get_suggestions: {e}")
        return {"success": False, "error": str(e)}

@router.get("/")
async def get_habits(current_user: UserInDB = Depends(get_current_user)):
    try:
        habits = await db.habits.find({"user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [HabitSchema(**fix_id(h)) for h in habits]}
    except Exception as e:
        print(f"Error in get_habits: {e}")
        return {"success": False, "error": str(e)}

@router.post("/")
async def create_habit(habit: HabitCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        data = habit.model_dump()
        data["user_email"] = current_user.email
        res = await db.habits.insert_one(data)
        data["id"] = str(res.inserted_id)
        return {"success": True, "data": HabitSchema(**data)}
    except Exception as e:
        print(f"Error in create_habit: {e}")
        return {"success": False, "error": str(e)}

@router.get("/logs/{date_str}")
async def get_habit_logs(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        logs = await db.habit_logs.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [HabitLogSchema(**fix_id(l)) for l in logs]}
    except Exception as e:
        print(f"Error in get_habit_logs: {e}")
        return {"success": False, "error": str(e)}

@router.post("/logs")
async def log_habit(log: HabitLogCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        filter_query = {"date": log.date, "habit_id": log.habit_id, "user_email": current_user.email}
        data = log.model_dump()
        data["user_email"] = current_user.email
        await db.habit_logs.update_one(filter_query, {"$set": data}, upsert=True)
        return {"success": True, "data": None}
    except Exception as e:
        print(f"Error in log_habit: {e}")
        return {"success": False, "error": str(e)}
