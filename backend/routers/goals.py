from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Goal, GoalMilestone

router = APIRouter()

@router.get("/")
async def get_goals(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Goal).order_by(Goal.created_at.desc()))
    goals = query.scalars().all()
    result = []
    for g in goals:
        mq = await db.execute(select(GoalMilestone).filter(GoalMilestone.goal_id == g.id))
        milestones = mq.scalars().all()
        result.append({
            "id": g.id, "title": g.title, "description": g.description,
            "category": g.category, "target_value": g.target_value,
            "current_value": g.current_value, "unit": g.unit,
            "deadline": g.deadline, "status": g.status,
            "milestones": [{"id": m.id, "title": m.title, "completed": m.completed, "completed_date": m.completed_date} for m in milestones]
        })
    return {"success": True, "data": result}

@router.post("/")
async def create_goal(data: dict, db: AsyncSession = Depends(get_db)):
    goal = Goal(
        title=data["title"], description=data.get("description"),
        category=data.get("category", "General"),
        target_value=data.get("target_value"), unit=data.get("unit"),
        deadline=data.get("deadline"), status="Active"
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return {"success": True, "data": {"id": goal.id, "title": goal.title}}

@router.put("/{goal_id}/progress")
async def update_goal_progress(goal_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Goal).filter(Goal.id == goal_id))
    goal = query.scalars().first()
    if goal:
        goal.current_value = data.get("current_value", goal.current_value)
        if goal.target_value and goal.current_value >= goal.target_value:
            goal.status = "Completed"
        await db.commit()
    return {"success": True}

@router.put("/{goal_id}/status")
async def update_goal_status(goal_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(Goal).filter(Goal.id == goal_id))
    goal = query.scalars().first()
    if goal:
        goal.status = data.get("status", goal.status)
        await db.commit()
    return {"success": True}

@router.post("/{goal_id}/milestones")
async def add_milestone(goal_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    ms = GoalMilestone(goal_id=goal_id, title=data["title"])
    db.add(ms)
    await db.commit()
    await db.refresh(ms)
    return {"success": True, "data": {"id": ms.id, "title": ms.title}}

@router.put("/milestones/{ms_id}/toggle")
async def toggle_milestone(ms_id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(GoalMilestone).filter(GoalMilestone.id == ms_id))
    ms = query.scalars().first()
    if ms:
        ms.completed = not ms.completed
        from datetime import date
        ms.completed_date = str(date.today()) if ms.completed else None
        await db.commit()
    return {"success": True}

@router.delete("/{goal_id}")
async def delete_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    # Delete milestones first
    mq = await db.execute(select(GoalMilestone).filter(GoalMilestone.goal_id == goal_id))
    for m in mq.scalars().all():
        await db.delete(m)
    query = await db.execute(select(Goal).filter(Goal.id == goal_id))
    goal = query.scalars().first()
    if goal:
        await db.delete(goal)
    await db.commit()
    return {"success": True}
