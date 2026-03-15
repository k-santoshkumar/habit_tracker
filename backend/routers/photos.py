from fastapi import APIRouter
from backend.database import db
from backend.schemas import PhotoLog as PhotoLogSchema, PhotoLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/{date_str}")
async def get_photos(date_str: str):
    photos = await db.photos.find({"date": date_str}).to_list(length=100)
    return {"success": True, "data": [PhotoLogSchema(**fix_id(p)) for p in photos]}

@router.post("/")
async def upload_photo(photo: PhotoLogCreate):
    data = photo.model_dump()
    res = await db.photos.insert_one(data)
    data["id"] = str(res.inserted_id)
    return {"success": True, "data": PhotoLogSchema(**data)}

@router.delete("/{photo_id}")
async def delete_photo(photo_id: str):
    await db.photos.delete_one({"_id": ObjectId(photo_id)})
    return {"success": True, "data": None}
