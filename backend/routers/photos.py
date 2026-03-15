from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import PhotoLog as PhotoLogSchema, PhotoLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/{date_str}")
async def get_photos(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    photos = await db.photos.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
    return {"success": True, "data": [PhotoLogSchema(**fix_id(p)) for p in photos]}

@router.post("/")
async def upload_photo(photo: PhotoLogCreate, current_user: UserInDB = Depends(get_current_user)):
    data = photo.model_dump()
    data["user_email"] = current_user.email
    res = await db.photos.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": PhotoLogSchema(**data)}

@router.delete("/{photo_id}")
async def delete_photo(photo_id: str, current_user: UserInDB = Depends(get_current_user)):
    await db.photos.delete_one({"_id": ObjectId(photo_id), "user_email": current_user.email})
    return {"success": True, "data": None}
