from fastapi import APIRouter, Depends
from backend.schemas import UserInDB
from backend.auth import get_current_user

router = APIRouter()

@router.get("/today")
async def get_insight_today(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "data": None}
