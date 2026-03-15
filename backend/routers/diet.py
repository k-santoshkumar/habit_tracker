from fastapi import APIRouter, Depends
from backend.database import db
from backend.schemas import MealSlot as MealSlotSchema, MealSlotCreate, MealLog as MealLogSchema, MealLogCreate, WaterLog as WaterLogSchema, WaterLogCreate, UserInDB
from backend.auth import get_current_user
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

@router.get("/categories")
async def get_categories():
    try:
        cats = await db.meal_categories.find().to_list(length=100)
        return {"success": True, "data": [c["name"] for c in cats]}
    except Exception as e:
        print(f"Error in get_categories: {e}")
        return {"success": False, "error": str(e)}

@router.get("/food-items")
async def get_food_items():
    try:
        items = await db.food_items.find().to_list(length=1000)
        return {"success": True, "data": [fix_id(i) for i in items]}
    except Exception as e:
        print(f"Error in get_food_items: {e}")
        return {"success": False, "error": str(e)}

@router.get("/slots")
async def get_meal_slots(current_user: UserInDB = Depends(get_current_user)):
    try:
        slots = await db.meal_slots.find({"user_email": current_user.email}).to_list(length=100)
        return {"success": True, "data": [MealSlotSchema(**fix_id(s)) for s in slots]}
    except Exception as e:
        print(f"Error in get_meal_slots: {e}")
        return {"success": False, "error": str(e)}

@router.post("/slots")
async def create_meal_slot(slot: MealSlotCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        new_slot_data = slot.model_dump()
        new_slot_data["user_email"] = current_user.email
        result = await db.meal_slots.insert_one(new_slot_data)
        new_slot_data["id"] = str(result.inserted_id)
        return {"success": True, "data": MealSlotSchema(**new_slot_data)}
    except Exception as e:
        print(f"Error in create_meal_slot: {e}")
        return {"success": False, "error": str(e)}

@router.get("/logs/{date_str}")
async def get_diet_logs(date_str: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        meals = await db.meal_logs.find({"date": date_str, "user_email": current_user.email}).to_list(length=100)
        water = await db.water_logs.find_one({"date": date_str, "user_email": current_user.email})
        
        return {
            "success": True, 
            "data": {
                "meals": [MealLogSchema(**fix_id(m)) for m in meals],
                "water": WaterLogSchema(**fix_id(water)) if water else None
            }
        }
    except Exception as e:
        print(f"Error in get_diet_logs: {e}")
        return {"success": False, "error": str(e)}

@router.post("/logs/meal")
async def log_meal(log: MealLogCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        filter_query = {"date": log.date, "meal_slot_id": log.meal_slot_id, "user_email": current_user.email}
        update_data = log.model_dump()
        update_data["user_email"] = current_user.email
        
        await db.meal_logs.update_one(
            filter_query,
            {"$set": update_data},
            upsert=True
        )
        return {"success": True, "data": None}
    except Exception as e:
        print(f"Error in log_meal: {e}")
        return {"success": False, "error": str(e)}

@router.post("/logs/water")
async def log_water(log: WaterLogCreate, current_user: UserInDB = Depends(get_current_user)):
    try:
        filter_query = {"date": log.date, "user_email": current_user.email}
        update_data = log.model_dump()
        update_data["user_email"] = current_user.email
        
        await db.water_logs.update_one(
            filter_query,
            {"$set": update_data},
            upsert=True
        )
        return {"success": True, "data": None}
    except Exception as e:
        print(f"Error in log_water: {e}")
        return {"success": False, "error": str(e)}

@router.delete("/slots/{slot_id}")
async def delete_meal_slot(slot_id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        await db.meal_logs.delete_many({"meal_slot_id": slot_id, "user_email": current_user.email})
        await db.meal_slots.delete_one({"_id": ObjectId(slot_id), "user_email": current_user.email})
        return {"success": True, "data": None}
    except Exception as e:
        return {"success": False, "error": str(e)}
