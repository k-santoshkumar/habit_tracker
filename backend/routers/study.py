from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import StudyTrack, StudyTopic, StudyHabit, HabitLog
from backend.schemas import StudyTrackCreate, StudyTopicCreate, StudyHabitCreate, HabitLogCreate

router = APIRouter()

@router.get("/tracks")
async def get_study_tracks(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(StudyTrack))
    tracks = query.scalars().all()
    data = []
    for track in tracks:
        topics_query = await db.execute(select(StudyTopic).filter(StudyTopic.track_id == track.id))
        topics = topics_query.scalars().all()
        track_dict = {
            "id": track.id,
            "name": track.name,
            "color_tag": track.color_tag,
            "topics": [{"id": t.id, "name": t.name, "status": t.status} for t in topics]
        }
        data.append(track_dict)
    return {"success": True, "data": data}

@router.post("/tracks")
async def create_track(track: StudyTrackCreate, db: AsyncSession = Depends(get_db)):
    t = StudyTrack(**track.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return {"success": True, "data": {"id": t.id, "name": t.name, "color_tag": t.color_tag, "topics": []}}

@router.post("/topics")
async def create_topic(topic: StudyTopicCreate, db: AsyncSession = Depends(get_db)):
    t = StudyTopic(**topic.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return {"success": True, "data": {"id": t.id, "name": t.name, "status": t.status}}

@router.put("/topics/{topic_id}/status")
async def update_topic_status(topic_id: int, status: str, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(StudyTopic).filter(StudyTopic.id == topic_id))
    topic = query.scalars().first()
    if topic:
        topic.status = status
        await db.commit()
    return {"success": True, "data": None}
