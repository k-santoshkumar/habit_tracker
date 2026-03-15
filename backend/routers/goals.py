from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import UserInDB
from backend.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/categories")
async def get_categories():
    cats = await db.goal_categories.find().to_list(length=100)
    return {"success": True, "data": [fix_id(c) for c in cats]}

@router.get("/")
async def get_goals(current_user: UserInDB = Depends(get_current_user)):
    goals = await db.goals.find({"user_email": current_user.email}).sort("created_at", -1).to_list(length=100)
    result = []
    for g in goals:
        g_id = str(g["id"] if "id" in g else g["_id"])
        milestones = await db.goal_milestones.find({"goal_id": g_id, "user_email": current_user.email}).to_list(length=100)
        g_data = fix_id(g)
        g_data["milestones"] = [fix_id(m) for m in milestones]
        result.append(g_data)
    return {"success": True, "data": result}

@router.post("/")
async def create_goal(data: dict, current_user: UserInDB = Depends(get_current_user)):
    goal_data = {
        "title": data["title"],
        "description": data.get("description"),
        "category": data.get("category", "General"),
        "target_value": data.get("target_value"),
        "unit": data.get("unit"),
        "deadline": data.get("deadline"),
        "status": "Active",
        "current_value": 0,
        "created_at": datetime.now(),
        "user_email": current_user.email
    }
    result = await db.goals.insert_one(goal_data)
    goal_data["id"] = str(result.inserted_id)
    return {"success": True, "data": goal_data}

@router.put("/{goal_id}/progress")
async def update_goal_progress(goal_id: str, data: dict, current_user: UserInDB = Depends(get_current_user)):
    await db.goals.update_one(
        {"_id": ObjectId(goal_id), "user_email": current_user.email},
        {"$set": {"current_value": data.get("current_value", 0)}}
    )
    # Check if completed
    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "user_email": current_user.email})
    if goal and goal.get("target_value") and goal["current_value"] >= goal["target_value"]:
        await db.goals.update_one({"_id": ObjectId(goal_id)}, {"$set": {"status": "Completed"}})
    return {"success": True}

@router.put("/{goal_id}/status")
async def update_goal_status(goal_id: str, data: dict, current_user: UserInDB = Depends(get_current_user)):
    await db.goals.update_one(
        {"_id": ObjectId(goal_id), "user_email": current_user.email},
        {"$set": {"status": data.get("status", "Active")}}
    )
    return {"success": True}

@router.post("/{goal_id}/milestones")
async def add_milestone(goal_id: str, data: dict, current_user: UserInDB = Depends(get_current_user)):
    # Verify goal belongs to user
    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "user_email": current_user.email})
    if not goal:
        return {"success": False, "error": "Goal not found"}

    ms_data = {
        "goal_id": goal_id,
        "title": data["title"],
        "completed": False,
        "completed_date": None,
        "user_email": current_user.email
    }
    result = await db.goal_milestones.insert_one(ms_data)
    ms_data["id"] = str(result.inserted_id)
    return {"success": True, "data": ms_data}

@router.put("/milestones/{ms_id}/toggle")
async def toggle_milestone(ms_id: str, current_user: UserInDB = Depends(get_current_user)):
    ms = await db.goal_milestones.find_one({"_id": ObjectId(ms_id), "user_email": current_user.email})
    if ms:
        new_completed = not ms["completed"]
        from datetime import date
        completed_date = str(date.today()) if new_completed else None
        await db.goal_milestones.update_one(
            {"_id": ObjectId(ms_id)},
            {"$set": {"completed": new_completed, "completed_date": completed_date}}
        )
    return {"success": True}

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, current_user: UserInDB = Depends(get_current_user)):
    await db.goal_milestones.delete_many({"goal_id": goal_id, "user_email": current_user.email})
    await db.goals.delete_one({"_id": ObjectId(goal_id), "user_email": current_user.email})
    return {"success": True}
