from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import PomodoroSession as PomodoroSessionSchema, PomodoroSessionCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/sessions")
async def get_sessions(current_user: UserInDB = Depends(get_current_user)):
    sessions = await db.pomodoro_sessions.find({"user_email": current_user.email}).sort("created_at", -1).to_list(length=100)
    return {"success": True, "data": [PomodoroSessionSchema(**fix_id(s)) for s in sessions]}

@router.post("/sessions")
async def create_session(session: PomodoroSessionCreate, current_user: UserInDB = Depends(get_current_user)):
    data = session.model_dump()
    data["user_email"] = current_user.email
    res = await db.pomodoro_sessions.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": PomodoroSessionSchema(**data)}
