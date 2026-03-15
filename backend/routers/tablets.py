from fastapi import APIRouter
from backend.database import db
from backend.schemas import Tablet as TabletSchema, TabletCreate, TabletLog as TabletLogSchema, TabletLogCreate
from bson import ObjectId

router = APIRouter()

def fix_id(obj):
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
    return obj

@router.get("/")
async def get_tablets():
    tablets = await db.tablets.find().to_list(length=100)
    return {"success": True, "data": [TabletSchema(**fix_id(t)) for t in tablets]}

@router.post("/")
async def create_tablet(tablet: TabletCreate):
    data = tablet.model_dump()
    result = await db.tablets.insert_one(data)
    data["id"] = str(result.inserted_id)
    return {"success": True, "data": TabletSchema(**data)}

@router.delete("/{tablet_id}")
async def delete_tablet(tablet_id: str):
    await db.tablets.delete_one({"_id": ObjectId(tablet_id)})
    return {"success": True, "data": None}

@router.get("/logs/{date_str}")
async def get_tablet_logs(date_str: str):
    logs = await db.tablet_logs.find({"date": date_str}).to_list(length=100)
    return {"success": True, "data": [TabletLogSchema(**fix_id(log)) for log in logs]}

@router.post("/logs")
async def log_tablet(log: TabletLogCreate):
    filter_query = {"date": log.date, "tablet_id": log.tablet_id}
    data = log.model_dump()
    await db.tablet_logs.update_one(filter_query, {"$set": data}, upsert=True)
    
    # Return updated logs for the day
    logs = await db.tablet_logs.find({"date": log.date}).to_list(length=100)
    return {"success": True, "data": [TabletLogSchema(**fix_id(l)) for l in logs]}
