from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.scoring import update_daily_score, calculate_daily_score

router = APIRouter()

@router.get("/score/{date_str}")
async def get_score(date_str: str, db: AsyncSession = Depends(get_db)):
    score_val, breakdown = await calculate_daily_score(date_str, db)
    return {"success": True, "data": {"score": score_val, "breakdown": breakdown}}

@router.get("/streaks")
async def get_streaks(db: AsyncSession = Depends(get_db)):
    # Standard 0-state streaks for an empty profile as requested
    default_streaks = [
         { "category": 'Overall', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Tablets', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Diet', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Study', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] },
         { "category": 'Activity', "current": 0, "longest": 0, "last7days": [False,False,False,False,False,False,False] }
    ]
    return {"success": True, "data": default_streaks}

@router.get("/heatmap")
async def get_heatmap(db: AsyncSession = Depends(get_db)):
    # 84 days of empty data
    return {"success": True, "data": [0] * 84}
