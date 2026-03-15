from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import CustomHabit, CustomHabitLog

router = APIRouter()

@router.get("/")
async def get_habits(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(CustomHabit).order_by(CustomHabit.id))
    habits = query.scalars().all()
    return {"success": True, "data": [
        {"id": h.id, "name": h.name, "icon": h.icon, "color": h.color,
         "frequency": h.frequency, "target_days": h.target_days}
        for h in habits
    ]}

@router.post("/")
async def create_habit(data: dict, db: AsyncSession = Depends(get_db)):
    habit = CustomHabit(
        name=data["name"], icon=data.get("icon", "Check"),
        color=data.get("color", "teal"), frequency=data.get("frequency", "daily"),
        target_days=data.get("target_days")
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return {"success": True, "data": {
        "id": habit.id, "name": habit.name, "icon": habit.icon,
        "color": habit.color, "frequency": habit.frequency
    }}

@router.delete("/{habit_id}")
async def delete_habit(habit_id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(CustomHabit).filter(CustomHabit.id == habit_id))
    habit = query.scalars().first()
    if habit:
        await db.delete(habit)
        await db.commit()
    return {"success": True}

@router.get("/logs/{date_str}")
async def get_habit_logs(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(CustomHabitLog).filter(CustomHabitLog.date == date_str))
    logs = query.scalars().all()
    return {"success": True, "data": [
        {"id": l.id, "habit_id": l.habit_id, "completed": l.completed}
        for l in logs
    ]}

@router.post("/logs")
async def toggle_habit_log(data: dict, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(CustomHabitLog).filter(
        CustomHabitLog.date == data["date"],
        CustomHabitLog.habit_id == data["habit_id"]
    ))
    existing = query.scalars().first()
    if existing:
        existing.completed = data.get("completed", not existing.completed)
    else:
        new_log = CustomHabitLog(
            date=data["date"], habit_id=data["habit_id"],
            completed=data.get("completed", True)
        )
        db.add(new_log)
    await db.commit()
    return {"success": True}
