from datetime import date as dt_date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import DailyScore, Tablet, TabletLog, MealSlot, MealLog, WaterLog, StudyTopic, StudyHabit, HabitLog, ActivityLog

async def calculate_daily_score(date_str: str, db: AsyncSession):
    categories = []

    # 1. Tablets
    query_tablets = await db.execute(select(Tablet))
    tablets = query_tablets.scalars().all()
    if tablets:
        tablet_count = len(tablets)
        critical_count = sum(1 for t in tablets if t.critical)
        normal_count = tablet_count - critical_count
        
        query_logs = await db.execute(select(TabletLog).filter(TabletLog.date == date_str))
        logs = query_logs.scalars().all()
        log_map = {log.tablet_id: log.status for log in logs}
        
        critical_taken = sum(1 for t in tablets if t.critical and log_map.get(t.id) in ["Taken", "Taken late"])
        normal_taken = sum(1 for t in tablets if not t.critical and log_map.get(t.id) in ["Taken", "Taken late"])
        
        denominator = (critical_count * 2) + normal_count
        if denominator > 0:
            tablet_score = ((critical_taken * 2) + normal_taken) / denominator
            categories.append(('tablets', tablet_score))

    # 2. Meals
    query_meals = await db.execute(select(MealSlot))
    meals = query_meals.scalars().all()
    if meals:
        total_meals = len(meals)
        query_meal_logs = await db.execute(select(MealLog).filter(MealLog.date == date_str, MealLog.checked == True))
        meals_done = len(query_meal_logs.scalars().all())
        categories.append(('meals', meals_done / total_meals))

    # 3. Water
    from backend.models import Profile
    profile_query = await db.execute(select(Profile).limit(1))
    profile = profile_query.scalars().first()
    if profile and profile.water_target_ml > 0:
        query_water = await db.execute(select(WaterLog).filter(WaterLog.date == date_str))
        water_log = query_water.scalars().first()
        water_ml = water_log.amount_ml if water_log else 0
        water_score = min(water_ml / profile.water_target_ml, 1.0)
        categories.append(('water', water_score))

    # 4. Study
    query_topics = await db.execute(select(StudyTopic).filter(StudyTopic.status == "In Progress"))
    active_topics = query_topics.scalars().all()
    query_habits = await db.execute(select(StudyHabit))
    habits = query_habits.scalars().all()
    
    if active_topics or habits:
        # Assuming topics marked "Done" today aren't simply "In Progress", we may need a better way to track topics done today. 
        # For simplicity, let's just use HabitLogs and an assumption or a general score modifier
        query_habit_logs = await db.execute(select(HabitLog).filter(HabitLog.date == date_str, HabitLog.checked == True))
        done_habits = len(query_habit_logs.scalars().all())
        total_possible = min(len(active_topics) + len(habits), 5)
        if total_possible > 0:
            study_score = min(done_habits / total_possible, 1.0)
            categories.append(('study', study_score))

    # 5. Activity
    from backend.models import ActivityType
    query_act_types = await db.execute(select(ActivityType))
    act_types = query_act_types.scalars().all()
    if act_types:
        query_act_logs = await db.execute(select(ActivityLog).filter(ActivityLog.date == date_str, ActivityLog.done == True))
        act_logs = query_act_logs.scalars().all()
        categories.append(('activity', 1.0 if act_logs else 0.0))

    if not categories:
        return 0, {}

    weight_per_category = 100 / len(categories)
    total = sum(score * weight_per_category for _, score in categories)
    
    breakdown = {name: round(score * 100) for name, score in categories}
    return round(total), breakdown

async def update_daily_score(date_str: str, db: AsyncSession):
    score_val, breakdown = await calculate_daily_score(date_str, db)
    
    query = await db.execute(select(DailyScore).filter(DailyScore.date == date_str))
    ds = query.scalars().first()
    
    import json
    if ds:
        if ds.frozen:
            return ds.score
        ds.score = score_val
        ds.breakdown_json = json.dumps(breakdown)
    else:
        ds = DailyScore(date=date_str, score=score_val, breakdown_json=json.dumps(breakdown))
        db.add(ds)
        
    await db.commit()
    
    # Also recalculate personal bests and streaks here?
    return score_val
