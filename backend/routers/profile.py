from fastapi import APIRouter
from backend.database import db
from backend.schemas import Profile as ProfileSchema, ProfileCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/")
async def get_profile():
    profile = await db.profiles.find_one()
    if not profile:
        return {"success": True, "data": None}
    return {"success": True, "data": ProfileSchema(**fix_id(profile))}

@router.post("/")
async def update_profile(profile: ProfileCreate):
    data = profile.model_dump()
    existing = await db.profiles.find_one()
    if existing:
        await db.profiles.update_one({"_id": existing["_id"]}, {"$set": data})
        data["id"] = str(existing["_id"])
    else:
        result = await db.profiles.insert_one(data)
        data["id"] = str(result.inserted_id)
    return {"success": True, "data": ProfileSchema(**data)}
