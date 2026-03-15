from fastapi import APIRouter, Depends
from backend.database import db
from backend.scoring import update_daily_score, calculate_daily_score
from backend.schemas import UserInDB
from backend.auth import get_current_user

router = APIRouter()

@router.get("/score/{date_str}")
async def get_score(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    score_val, breakdown = await calculate_daily_score(date_str, current_user.email)
    return {"success": True, "data": {"score": score_val, "breakdown": breakdown}}

@router.get("/streaks")
async def get_streaks(current_user: UserInDB = Depends(get_current_user)):
    # Placeholder for now, can be implemented with Mongo logic filtering by user_email
    default_streaks = [
         { "category": 'Overall', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Tablets', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Diet', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Study', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Activity', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] }
    ]
    return {"success": True, "data": default_streaks}

@router.get("/heatmap")
async def get_heatmap(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "data": [0] * 84}
