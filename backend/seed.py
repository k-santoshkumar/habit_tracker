import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

MONGODB_URL = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "health_tracker"

MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack', 'Post-Workout']

FOOD_DATABASE = [
    {"category": "Breakfast", "name": "Oatmeal", "protein": 6},
    {"category": "Breakfast", "name": "Eggs & Toast", "protein": 18},
    {"category": "Breakfast", "name": "Pancakes", "protein": 8},
    {"category": "Breakfast", "name": "Greek Yogurt Bowl", "protein": 15},
    {"category": "Breakfast", "name": "Avocado Toast", "protein": 7},
    {"category": "Breakfast", "name": "Smoothie Bowl", "protein": 12},
    {"category": "Breakfast", "name": "Cereal & Milk", "protein": 8},
    {"category": "Breakfast", "name": "Fruit Bowl", "protein": 2},
    {"category": "Breakfast", "name": "Peanut Butter Toast", "protein": 10},
    {"category": "Breakfast", "name": "Idli Sambar", "protein": 6},
    {"category": "Breakfast", "name": "Poha", "protein": 4},
    {"category": "Breakfast", "name": "Paratha & Curd", "protein": 6},
    {"category": "Breakfast", "name": "Upma", "protein": 5},
    {"category": "Breakfast", "name": "Dosa & Chutney", "protein": 4},
    
    {"category": "Lunch", "name": "Chicken Breast & Rice", "protein": 40},
    {"category": "Lunch", "name": "Grilled Fish & Salad", "protein": 35},
    {"category": "Lunch", "name": "Lentil Stew (Dal)", "protein": 18},
    {"category": "Lunch", "name": "Paneer Curry & Roti", "protein": 22},
    {"category": "Lunch", "name": "Turkey Sandwich", "protein": 28},
    {"category": "Lunch", "name": "Veggie Wrap", "protein": 12},
    {"category": "Lunch", "name": "Quinoa Bowl", "protein": 14},
    {"category": "Lunch", "name": "Pasta Primavera", "protein": 15},
    {"category": "Lunch", "name": "Burrito Bowl", "protein": 30},
    {"category": "Lunch", "name": "Rajma Rice", "protein": 15},
    {"category": "Lunch", "name": "Chole & Rice", "protein": 14},
    {"category": "Lunch", "name": "Dal & Rice", "protein": 12},
    {"category": "Lunch", "name": "Chicken Biryani", "protein": 20},
    {"category": "Lunch", "name": "Tofu Stir-fry & Rice", "protein": 20},

    {"category": "Dinner", "name": "Grilled Salmon", "protein": 38},
    {"category": "Dinner", "name": "Steak & Potatoes", "protein": 42},
    {"category": "Dinner", "name": "Chicken Tikka", "protein": 35},
    {"category": "Dinner", "name": "Fish & Veggies", "protein": 30},
    {"category": "Dinner", "name": "Tofu Stir-fry", "protein": 20},
    {"category": "Dinner", "name": "Pasta Bolognese", "protein": 15},
    {"category": "Dinner", "name": "Soup & Bread", "protein": 10},
    {"category": "Dinner", "name": "Palak Paneer & Naan", "protein": 18},
    {"category": "Dinner", "name": "Egg Curry & Rice", "protein": 16},
    {"category": "Dinner", "name": "Grilled Chicken Salad", "protein": 32},
    {"category": "Dinner", "name": "Shrimp Stir-fry", "protein": 28},
    {"category": "Dinner", "name": "Daal Makhani & Roti", "protein": 14},

    {"category": "Morning Snack", "name": "Protein Bar", "protein": 20},
    {"category": "Morning Snack", "name": "Almonds (30g)", "protein": 6},
    {"category": "Morning Snack", "name": "Apple & Peanut Butter", "protein": 7},
    {"category": "Morning Snack", "name": "Boiled Eggs (2)", "protein": 12},
    {"category": "Morning Snack", "name": "Trail Mix", "protein": 8},
    {"category": "Morning Snack", "name": "Banana", "protein": 1},
    {"category": "Morning Snack", "name": "Cheese & Crackers", "protein": 10},

    {"category": "Afternoon Snack", "name": "Greek Yogurt", "protein": 15},
    {"category": "Afternoon Snack", "name": "Hummus & Veggies", "protein": 6},
    {"category": "Afternoon Snack", "name": "Protein Shake", "protein": 25},
    {"category": "Afternoon Snack", "name": "Mixed Nuts", "protein": 7},
    {"category": "Afternoon Snack", "name": "Fruit Salad", "protein": 2},
    {"category": "Afternoon Snack", "name": "Makhana (Fox Nuts)", "protein": 4},
    {"category": "Afternoon Snack", "name": "Roasted Chana", "protein": 10},

    {"category": "Post-Workout", "name": "Whey Protein Shake", "protein": 30},
    {"category": "Post-Workout", "name": "Chicken Wrap", "protein": 28},
    {"category": "Post-Workout", "name": "Eggs & Bread", "protein": 18},
    {"category": "Post-Workout", "name": "Banana & Whey Shake", "protein": 27},
    {"category": "Post-Workout", "name": "BCAA Drink", "protein": 0},
    {"category": "Post-Workout", "name": "Paneer Tikka", "protein": 22},
]

HEALTH_PRESETS = [
    {"name": "Weight", "unit": "kg", "min_range": 40.0, "max_range": 150.0},
    {"name": "Blood Pressure (Systolic)", "unit": "mmHg", "min_range": 90.0, "max_range": 140.0},
    {"name": "Blood Pressure (Diastolic)", "unit": "mmHg", "min_range": 60.0, "max_range": 90.0},
    {"name": "Heart Rate (Resting)", "unit": "bpm", "min_range": 50.0, "max_range": 100.0},
    {"name": "Blood Sugar (Fasting)", "unit": "mg/dL", "min_range": 70.0, "max_range": 110.0},
    {"name": "Blood Sugar (Post-meal)", "unit": "mg/dL", "min_range": 70.0, "max_range": 180.0},
    {"name": "HbA1c", "unit": "%", "min_range": 4.0, "max_range": 6.5},
    {"name": "Cholesterol (Total)", "unit": "mg/dL", "min_range": 100.0, "max_range": 200.0},
    {"name": "HDL Cholesterol", "unit": "mg/dL", "min_range": 40.0, "max_range": 80.0},
    {"name": "LDL Cholesterol", "unit": "mg/dL", "min_range": 50.0, "max_range": 130.0},
    {"name": "Triglycerides", "unit": "mg/dL", "min_range": 50.0, "max_range": 150.0},
    {"name": "BMI", "unit": "kg/m2", "min_range": 18.5, "max_range": 25.0},
    {"name": "Body Fat", "unit": "%", "min_range": 8.0, "max_range": 30.0},
    {"name": "Waist Circumference", "unit": "cm", "min_range": 60.0, "max_range": 100.0},
    {"name": "SpO2", "unit": "%", "min_range": 95.0, "max_range": 100.0},
    {"name": "Temperature", "unit": "F", "min_range": 97.0, "max_range": 99.5},
    {"name": "Creatinine", "unit": "mg/dL", "min_range": 0.6, "max_range": 1.2},
    {"name": "Hemoglobin", "unit": "g/dL", "min_range": 12.0, "max_range": 17.0},
    {"name": "Vitamin D", "unit": "ng/mL", "min_range": 30.0, "max_range": 80.0},
    {"name": "TSH", "unit": "mIU/L", "min_range": 0.4, "max_range": 4.0},
]

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
    
    print("Seeding meal categories...")
    await db.meal_categories.delete_many({})
    await db.meal_categories.insert_many([{"name": c} for c in MEAL_CATEGORIES])
    
    print("Seeding food database...")
    await db.food_items.delete_many({})
    await db.food_items.insert_many(FOOD_DATABASE)
    
    print("Seeding health presets...")
    await db.health_presets.delete_many({})
    await db.health_presets.insert_many(HEALTH_PRESETS)
    
    print("Seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
