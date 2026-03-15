from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Profile as ProfileModel
from backend.schemas import Profile, ProfileCreate

router = APIRouter()

@router.get("/", response_model=dict)
async def get_profile(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(ProfileModel).limit(1))
    profile = query.scalars().first()
    if profile:
        return {"success": True, "data": Profile.model_validate(profile)}
    return {"success": True, "data": None}

@router.post("/", response_model=dict)
async def create_or_update_profile(profile_data: ProfileCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(ProfileModel).limit(1))
    profile = query.scalars().first()
    
    if profile:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)
    else:
        profile = ProfileModel(**profile_data.model_dump())
        db.add(profile)
        
    await db.commit()
    await db.refresh(profile)
    return {"success": True, "data": Profile.model_validate(profile)}
