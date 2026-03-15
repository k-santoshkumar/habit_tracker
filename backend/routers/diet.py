from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.database import get_db
from backend.models import MealSlot, MealLog, WaterLog
from backend.schemas import MealSlot as MealSlotSchema, MealSlotCreate, MealLog as MealLogSchema, MealLogCreate, WaterLog as WaterLogSchema, WaterLogCreate

router = APIRouter()

@router.get("/slots")
async def get_meal_slots(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MealSlot))
    slots = query.scalars().all()
    return {"success": True, "data": [MealSlotSchema.model_validate(s) for s in slots]}

@router.post("/slots")
async def create_meal_slot(slot: MealSlotCreate, db: AsyncSession = Depends(get_db)):
    new_slot = MealSlot(**slot.model_dump())
    db.add(new_slot)
    await db.commit()
    await db.refresh(new_slot)
    return {"success": True, "data": MealSlotSchema.model_validate(new_slot)}

@router.get("/logs/{date_str}")
async def get_diet_logs(date_str: str, db: AsyncSession = Depends(get_db)):
    meal_query = await db.execute(select(MealLog).filter(MealLog.date == date_str))
    meals = meal_query.scalars().all()
    
    water_query = await db.execute(select(WaterLog).filter(WaterLog.date == date_str))
    water = water_query.scalars().first()
    
    return {
        "success": True, 
        "data": {
            "meals": [MealLogSchema.model_validate(m) for m in meals],
            "water": WaterLogSchema.model_validate(water) if water else None
        }
    }

@router.post("/logs/meal")
async def log_meal(log: MealLogCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MealLog).filter(MealLog.date == log.date, MealLog.meal_slot_id == log.meal_slot_id))
    existing = query.scalars().first()
    if existing:
        existing.checked = log.checked
        existing.proof_image = log.proof_image
    else:
        new_log = MealLog(**log.model_dump())
        db.add(new_log)
    await db.commit()
    return {"success": True, "data": None}

@router.post("/logs/water")
async def log_water(log: WaterLogCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(WaterLog).filter(WaterLog.date == log.date))
    existing = query.scalars().first()
    if existing:
        existing.amount_ml = log.amount_ml
    else:
        new_log = WaterLog(**log.model_dump())
        db.add(new_log)
    await db.commit()
    return {"success": True, "data": None}
