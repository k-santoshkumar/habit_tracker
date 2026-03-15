from fastapi import APIRouter

router = APIRouter()

@router.get("/{date_str}")
async def get_reflections(date_str: str):
    return {"success": True, "data": None}
