from fastapi import APIRouter

router = APIRouter()

@router.get("/today")
async def get_insight_today():
    return {"success": True, "data": None}
