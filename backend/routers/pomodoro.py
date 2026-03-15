from fastapi import APIRouter
from backend.database import db
from backend.schemas import PomodoroSession as PomodoroSessionSchema, PomodoroSessionCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/sessions")
async def get_sessions():
    sessions = await db.pomodoro_sessions.find().sort("created_at", -1).to_list(length=100)
    return {"success": True, "data": [PomodoroSessionSchema(**fix_id(s)) for s in sessions]}

@router.post("/sessions")
async def create_session(session: PomodoroSessionCreate):
    data = session.model_dump()
    data["created_at"] = data.get("created_at") or None # MongoDB will handle if null or use datetime.now() if we set it in logic
    res = await db.pomodoro_sessions.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": PomodoroSessionSchema(**data)}
