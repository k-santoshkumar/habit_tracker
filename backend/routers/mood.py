from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import MoodEntry

router = APIRouter()

@router.get("/entries")
async def get_mood_entries(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MoodEntry).order_by(MoodEntry.date.desc()).limit(30))
    entries = query.scalars().all()
    return {"success": True, "data": [
        {"id": e.id, "date": e.date, "mood": e.mood, "energy": e.energy,
         "stress": e.stress, "notes": e.notes}
        for e in entries
    ]}

@router.get("/entries/{date_str}")
async def get_mood_entry(date_str: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MoodEntry).filter(MoodEntry.date == date_str))
    entry = query.scalars().first()
    if not entry:
        return {"success": True, "data": None}
    return {"success": True, "data": {
        "id": entry.id, "date": entry.date, "mood": entry.mood,
        "energy": entry.energy, "stress": entry.stress, "notes": entry.notes
    }}

@router.post("/entries")
async def save_mood_entry(data: dict, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(MoodEntry).filter(MoodEntry.date == data["date"]))
    existing = query.scalars().first()
    if existing:
        existing.mood = data.get("mood", 3)
        existing.energy = data.get("energy", 3)
        existing.stress = data.get("stress", 3)
        existing.notes = data.get("notes")
    else:
        new_entry = MoodEntry(
            date=data["date"], mood=data.get("mood", 3),
            energy=data.get("energy", 3), stress=data.get("stress", 3),
            notes=data.get("notes")
        )
        db.add(new_entry)
    await db.commit()
    return {"success": True}
