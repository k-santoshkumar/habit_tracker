import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

import certifi

MONGODB_URL = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "health_tracker"

client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
db = client[DB_NAME]

async def get_db():
    return db

# Helper to get specific collections
def get_collection(name: str):
    return db[name]
