from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import Profile as ProfileSchema, ProfileCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/")
async def get_profile(current_user: UserInDB = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_email": current_user.email})
    if not profile:
        return {"success": True, "data": None}
    return {"success": True, "data": ProfileSchema(**fix_id(profile))}

@router.post("/")
async def update_profile(profile: ProfileCreate, current_user: UserInDB = Depends(get_current_user)):
    data = profile.model_dump()
    data["user_email"] = current_user.email
    
    await db.profiles.update_one(
        {"user_email": current_user.email},
        {"$set": data},
        upsert=True
    )
    
    # Fetch again to get the ID if needed by the frontend, although schemas might differ
    updated_profile = await db.profiles.find_one({"user_email": current_user.email})
    return {"success": True, "data": ProfileSchema(**fix_id(updated_profile))}
