from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import MealSlot as MealSlotSchema, MealSlotCreate, MealLog as MealLogSchema, MealLogCreate, WaterLog as WaterLogSchema, WaterLogCreate
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/categories")
async def get_categories():
    cats = await db.meal_categories.find().to_list(length=100)
    return {"success": True, "data": [c["name"] for c in cats]}

@router.get("/food-items")
async def get_food_items():
    items = await db.food_items.find().to_list(length=1000)
    return {"success": True, "data": [fix_id(i) for i in items]}

@router.get("/slots")
async def get_meal_slots():
    slots = await db.meal_slots.find().to_list(length=100)
    return {"success": True, "data": [MealSlotSchema(**fix_id(s)) for s in slots]}

@router.post("/slots")
async def create_meal_slot(slot: MealSlotCreate):
    new_slot_data = slot.model_dump()
    result = await db.meal_slots.insert_one(new_slot_data)
    new_slot_data["id"] = str(result.inserted_id)
    return {"success": True, "data": MealSlotSchema(**new_slot_data)}

@router.get("/logs/{date_str}")
async def get_diet_logs(date_str: str):
    meals = await db.meal_logs.find({"date": date_str}).to_list(length=100)
    water = await db.water_logs.find_one({"date": date_str})
    
    return {
        "success": True, 
        "data": {
            "meals": [MealLogSchema(**fix_id(m)) for m in meals],
            "water": WaterLogSchema(**fix_id(water)) if water else None
        }
    }

@router.post("/logs/meal")
async def log_meal(log: MealLogCreate):
    filter_query = {"date": log.date, "meal_slot_id": log.meal_slot_id}
    update_data = log.model_dump()
    
    await db.meal_logs.update_one(
        filter_query,
        {"$set": update_data},
        upsert=True
    )
    return {"success": True, "data": None}

@router.post("/logs/water")
async def log_water(log: WaterLogCreate):
    filter_query = {"date": log.date}
    update_data = log.model_dump()
    
    await db.water_logs.update_one(
        filter_query,
        {"$set": update_data},
        upsert=True
    )
    return {"success": True, "data": None}
