from datetime import date as dt_date
from backend.database import db
import json

async def calculate_daily_score(date_str: str):
    categories = []

    # 1. Tablets
    tablets = await db.tablets.find().to_list(length=100)
    if tablets:
        tablet_count = len(tablets)
        critical_count = sum(1 for t in tablets if t.get("critical", False))
        normal_count = tablet_count - critical_count
        
        logs = await db.tablet_logs.find({"date": date_str}).to_list(length=100)
        log_map = {str(log["tablet_id"]): log["status"] for log in logs}
        
        critical_taken = sum(1 for t in tablets if t.get("critical") and log_map.get(str(t["_id"])) in ["Taken", "Taken late"])
        normal_taken = sum(1 for t in tablets if not t.get("critical") and log_map.get(str(t["_id"])) in ["Taken", "Taken late"])
        
        denominator = (critical_count * 2) + normal_count
        if denominator > 0:
            tablet_score = ((critical_taken * 2) + normal_taken) / denominator
            categories.append(('tablets', tablet_score))

    # 2. Meals
    total_meals = await db.meal_slots.count_documents({})
    if total_meals > 0:
        meals_done = await db.meal_logs.count_documents({"date": date_str, "checked": True})
        categories.append(('meals', meals_done / total_meals))

    # 3. Water
    profile = await db.profiles.find_one()
    if profile and profile.get("water_target_ml", 0) > 0:
        water_log = await db.water_logs.find_one({"date": date_str})
        water_ml = water_log["amount_ml"] if water_log else 0
        water_score = min(water_ml / profile["water_target_ml"], 1.0)
        categories.append(('water', water_score))

    # 4. Study
    active_topics_count = await db.study_topics.count_documents({"status": "In Progress"})
    habits_count = await db.study_habits.count_documents({})
    
    if active_topics_count or habits_count:
        done_habits = await db.study_habit_logs.count_documents({"date": date_str, "checked": True})
        total_possible = min(active_topics_count + habits_count, 5)
        if total_possible > 0:
            study_score = min(done_habits / total_possible, 1.0)
            categories.append(('study', study_score))

    # 5. Activity
    act_types_count = await db.activity_types.count_documents({})
    if act_types_count > 0:
        act_logs_count = await db.activity_logs.count_documents({"date": date_str, "done": True})
        categories.append(('activity', 1.0 if act_logs_count > 0 else 0.0))

    if not categories:
        return 0, {}

    weight_per_category = 100 / len(categories)
    total = sum(score * weight_per_category for _, score in categories)
    
    breakdown = {name: round(score * 100) for name, score in categories}
    return round(total), breakdown

async def update_daily_score(date_str: str):
    score_val, breakdown = await calculate_daily_score(date_str)
    
    filter_query = {"date": date_str}
    existing = await db.daily_scores.find_one(filter_query)
    
    if existing:
        if existing.get("frozen"):
            return existing["score"]
        await db.daily_scores.update_one(
            {"_id": existing["_id"]},
            {"$set": {"score": score_val, "breakdown": breakdown}}
        )
    else:
        await db.daily_scores.insert_one({
            "date": date_str,
            "score": score_val,
            "breakdown": breakdown,
            "frozen": False
        })
        
    return score_val
