from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProfileBase(BaseModel):
    name: str = ""
    dob: str = ""
    weight_kg: float = 0.0
    height_cm: float = 0.0
    condition_notes: Optional[str] = None
    start_date: str = ""
    push_notifications_enabled: bool = False
    morning_summary_time: str = "08:00"
    bedtime_prompt_time: str = "20:00"
    protein_target_g: int = 100
    water_target_ml: int = 2500
    dietary_flags: Optional[str] = None
    hard_rules: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class TabletBase(BaseModel):
    name: str
    dose: str
    frequency: str
    timing: str
    critical: bool = False
    reminder_time: Optional[str] = None

class TabletCreate(TabletBase):
    pass

class Tablet(TabletCreate):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class TabletLogBase(BaseModel):
    date: str
    tablet_id: str
    status: str

class TabletLogCreate(TabletLogBase):
    pass

class TabletLog(TabletLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class MealSlotBase(BaseModel):
    name: str
    time: str
    description: Optional[str] = None
    protein_estimate: int = 0

class MealSlotCreate(MealSlotBase):
    pass

class MealSlot(MealSlotBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class MealLogBase(BaseModel):
    date: str
    meal_slot_id: str
    checked: bool
    proof_image: Optional[str] = None

class MealLogCreate(MealLogBase):
    pass

class MealLog(MealLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class WaterLogBase(BaseModel):
    date: str
    amount_ml: int

class WaterLogCreate(WaterLogBase):
    pass

class WaterLog(WaterLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class StudyTrackBase(BaseModel):
    name: str
    color_tag: str
    resource_links: Optional[str] = None

class StudyTrackCreate(StudyTrackBase):
    pass

class StudyTrack(StudyTrackBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class StudyTopicBase(BaseModel):
    track_id: str
    name: str
    status: str = "In Progress"

class StudyTopicCreate(StudyTopicBase):
    pass

class StudyTopic(StudyTopicBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class StudyHabitBase(BaseModel):
    name: str

class StudyHabitCreate(StudyHabitBase):
    pass

class StudyHabit(StudyHabitBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class HabitLogBase(BaseModel):
    date: str
    habit_id: str
    completed: bool

class HabitLogCreate(HabitLogBase):
    pass

class HabitLog(HabitLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class ActivityTypeBase(BaseModel):
    name: str
    icon: str
    color_tag: str
    schedule_days: str

class ActivityTypeCreate(ActivityTypeBase):
    pass

class ActivityType(ActivityTypeBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    date: str
    activity_type_id: str
    done: bool
    duration_min: Optional[int] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None
    water_consumed_ml: int = 0

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class HealthMetricBase(BaseModel):
    name: str
    unit: str
    min_range: Optional[float] = None
    max_range: Optional[float] = None

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetric(HealthMetricBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class MetricEntryBase(BaseModel):
    date: str
    metric_id: str
    value: float
    notes: Optional[str] = None

class MetricEntryCreate(MetricEntryBase):
    pass

class MetricEntry(MetricEntryBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class ReflectionBase(BaseModel):
    date: str
    went_well: str
    improve: str

class ReflectionCreate(ReflectionBase):
    pass

class Reflection(ReflectionBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class MoodEntryBase(BaseModel):
    date: str
    mood: int = 3
    energy: int = 3
    stress: int = 3
    notes: Optional[str] = None

class MoodEntryCreate(MoodEntryBase):
    pass

class MoodEntry(MoodEntryBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class SleepLogBase(BaseModel):
    date: str
    sleep_time: str
    wake_time: str
    quality: int = 3
    duration_min: int = 0
    notes: Optional[str] = None

class SleepLogCreate(SleepLogBase):
    pass

class SleepLog(SleepLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class PomodoroSessionBase(BaseModel):
    date: str
    duration_min: int = 25
    break_min: int = 5
    label: Optional[str] = None
    completed: bool = False

class PomodoroSessionCreate(PomodoroSessionBase):
    pass

class PomodoroSession(PomodoroSessionBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PhotoLogBase(BaseModel):
    date: str
    image_data: str # base64
    caption: Optional[str] = None

class PhotoLogCreate(PhotoLogBase):
    pass

class PhotoLog(PhotoLogBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: str
    icon: str = "Check"
    color: str = "teal"
    frequency: str = "daily"
    target_days: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: Optional[str] = None
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserPublic(UserBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserPublic):
    hashed_password: str
    created_at: datetime = datetime.now()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UpdateUser(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class GoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_date: Optional[str] = None
    category: str = "General"
    milestones: List[str] = []
    status: str = "Active"

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: Optional[str] = None
    progress: int = 0
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
