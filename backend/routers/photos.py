from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.database import get_db
from backend.models import PhotoEntry

router = APIRouter()

@router.get("/")
async def get_photos(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(PhotoEntry).order_by(PhotoEntry.date.desc(), PhotoEntry.created_at.desc()))
    photos = query.scalars().all()
    return {"success": True, "data": [
        {"id": p.id, "date": p.date, "image_data": p.image_data, 
         "caption": p.caption, "created_at": p.created_at.isoformat()}
        for p in photos
    ]}

@router.post("/")
async def save_photo(data: dict, db: AsyncSession = Depends(get_db)):
    if "date" not in data or "image_data" not in data:
        raise HTTPException(status_code=400, detail="Missing date or image_data")
        
    new_photo = PhotoEntry(
        date=data["date"],
        image_data=data["image_data"],
        caption=data.get("caption", "")
    )
    db.add(new_photo)
    await db.commit()
    await db.refresh(new_photo)
    
    return {"success": True, "data": {
        "id": new_photo.id, "date": new_photo.date, 
        "image_data": new_photo.image_data, "caption": new_photo.caption
    }}

@router.delete("/{photo_id}")
async def delete_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(PhotoEntry).filter(PhotoEntry.id == photo_id))
    photo = query.scalars().first()
    if photo:
        await db.delete(photo)
        await db.commit()
    return {"success": True}
