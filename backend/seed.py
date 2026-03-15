import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

MONGODB_URL = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "health_tracker"

# --- CATEGORIES & OPTIONS ---

MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack', 'Post-Workout']

GOAL_CATEGORIES = [
    {"name": 'Fitness', "color": '#0F6E56'},
    {"name": 'Health', "color": '#EF4444'},
    {"name": 'Study', "color": '#3B82F6'},
    {"name": 'Lifestyle', "color": '#D97706'},
    {"name": 'Finance', "color": '#8B5CF6'},
    {"name": 'General', "color": '#64748B'}
]

TABLET_TIMINGS = ["Morning", "Afternoon", "Evening", "Night"]

ACTIVITY_SUGGESTIONS = [
    "Weightlifting", "Running", "Cycling", "Swimming", "Yoga", 
    "Pilates", "HIIT", "Walking", "Hiking", "Rowing", "Stretching", 
    "Meditation", "Jump Rope", "Basketball", "Tennis", "Football", 
    "Dancing", "Martial Arts", "Climbing", "Boxing", "Gymnastics", 
    "Elliptical", "Stair Stepper", "Zumba", "Aerobics"
]

MOOD_OPTIONS = {
    "mood": ['', '😢', '😔', '😐', '😊', '🤩'],
    "energy": ['', '🪫', '🔋', '⚡', '💪', '🚀'],
    "stress": ['', '😌', '🙂', '😬', '😰', '🤯']
}

SLEEP_QUALITY_OPTIONS = [
    {"label": 'Awful', "emoji": '😴', "color": '#EF4444', "value": 1},
    {"label": 'Poor', "emoji": '😑', "color": '#F97316', "value": 2},
    {"label": 'Fair', "emoji": '😐', "color": '#EAB308', "value": 3},
    {"label": 'Good', "emoji": '😊', "color": '#22C55E', "value": 4},
    {"label": 'Excellent', "emoji": '🌟', "color": '#0F6E56', "value": 5}
]

HABIT_SUGGESTIONS = [
  'Read 30 minutes', 'Meditate', 'Journal', 'No Social Media', 'Cold Shower',
  'Wake before 7am', 'Stretch', 'Take a Walk', 'Drink Green Tea', 'Practice Gratitude',
  'No Junk Food', 'Learn Something New', 'Clean Desk', 'Call a Friend', 'Floss',
  'Limit Screen Time', 'Cook at Home', 'Sleep before 11pm', 'Drink Water First Thing', 'Exercise'
]

# --- STARTER DATA ---

FOOD_DATABASE = [
    {"category": "Breakfast", "name": "Oatmeal", "protein": 6},
    {"category": "Breakfast", "name": "Eggs & Toast", "protein": 18},
    {"category": "Lunch", "name": "Chicken Breast & Rice", "protein": 40},
    {"category": "Dinner", "name": "Grilled Salmon", "protein": 38},
    {"category": "Post-Workout", "name": "Whey Protein Shake", "protein": 30},
]

STARTER_TABLETS = [
    {"name": "Multivitamin", "dose": "1 tab", "frequency": "Daily", "timing": "Morning", "critical": True},
    {"name": "Omega 3", "dose": "1000mg", "frequency": "Daily", "timing": "Evening", "critical": False}
]

STARTER_ACTIVITY_TYPES = [
    {"name": "Weightlifting", "icon": "Dumbbell", "color_tag": "teal", "schedule_days": "all"},
    {"name": "Running", "icon": "HeartPulse", "color_tag": "blue", "schedule_days": "all"},
    {"name": "Yoga", "icon": "Zap", "color_tag": "amber", "schedule_days": "all"}
]

STARTER_HABITS = [
    {"name": "Read 10 pages", "icon": "Check", "color": "blue", "frequency": "daily"},
    {"name": "Drink 2L water", "icon": "Check", "color": "teal", "frequency": "daily"},
    {"name": "Meditate", "icon": "Check", "color": "amber", "frequency": "daily"}
]

HEALTH_PRESETS = [
    {"name": "Weight", "unit": "kg", "min_range": 40.0, "max_range": 150.0},
    {"name": "Blood Pressure (Systolic)", "unit": "mmHg", "min_range": 90.0, "max_range": 140.0},
    {"name": "Blood Pressure (Diastolic)", "unit": "mmHg", "min_range": 60.0, "max_range": 90.0},
    {"name": "Heart Rate", "unit": "bpm", "min_range": 50.0, "max_range": 100.0}
]

DEFAULT_PROFILE = {
    "name": "User",
    "dob": "1995-01-01",
    "weight_kg": 70.0,
    "height_cm": 175.0,
    "start_date": "2024-01-01",
    "protein_target_g": 100,
    "water_target_ml": 2500
}

async def seed():
    import certifi
    print(f"Connecting to MongoDB: {MONGODB_URL}")
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        await client.admin.command('ping')
        print("Connected successfully!")
    except Exception as e:
        print(f"ERROR: Could not connect to MongoDB: {e}")
        return

    db = client[DB_NAME]
    
    # 1. Seeding Categories & Options
    print("Seeding options and categories...")
    await db.meal_categories.delete_many({})
    await db.meal_categories.insert_many([{"name": c} for c in MEAL_CATEGORIES])
    
    await db.goal_categories.delete_many({})
    await db.goal_categories.insert_many(GOAL_CATEGORIES)
    
    await db.tablet_timings.delete_many({})
    await db.tablet_timings.insert_many([{"name": t} for t in TABLET_TIMINGS])
    
    await db.activity_suggestions.delete_many({})
    await db.activity_suggestions.insert_many([{"name": s} for s in ACTIVITY_SUGGESTIONS])

    await db.mood_options.delete_many({})
    await db.mood_options.insert_one(MOOD_OPTIONS)
    
    await db.sleep_quality_options.delete_many({})
    await db.sleep_quality_options.insert_many(SLEEP_QUALITY_OPTIONS)
    
    await db.habit_suggestions.delete_many({})
    await db.habit_suggestions.insert_many([{"name": s} for s in HABIT_SUGGESTIONS])

    # 2. Seeding Starter Content (Only if empty to avoid duplicates on every run)
    print("Seeding starter content...")
    
    if await db.food_items.count_documents({}) == 0:
        await db.food_items.insert_many(FOOD_DATABASE)
    
    if await db.tablets.count_documents({}) == 0:
        await db.tablets.insert_many(STARTER_TABLETS)
        
    if await db.activity_types.count_documents({}) == 0:
        await db.activity_types.insert_many(STARTER_ACTIVITY_TYPES)
        
    if await db.habits.count_documents({}) == 0:
        await db.habits.insert_many(STARTER_HABITS)
        
    if await db.health_presets.count_documents({}) == 0:
        await db.health_presets.insert_many(HEALTH_PRESETS)
        
    if await db.profiles.count_documents({}) == 0:
        await db.profiles.insert_one(DEFAULT_PROFILE)
    
    print("Seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
