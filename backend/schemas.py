from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProfileBase(BaseModel):
    name: str
    dob: str
    weight_kg: float
    height_cm: float
    condition_notes: Optional[str] = None
    start_date: str
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
    id: int
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
    id: int
    
    class Config:
        from_attributes = True

class TabletLogBase(BaseModel):
    date: str
    tablet_id: int
    status: str

class TabletLogCreate(TabletLogBase):
    pass

class TabletLog(TabletLogBase):
    id: int
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
    id: int
    class Config:
        from_attributes = True

class MealLogBase(BaseModel):
    date: str
    meal_slot_id: int
    checked: bool
    proof_image: Optional[str] = None

class MealLogCreate(MealLogBase):
    pass

class MealLog(MealLogBase):
    id: int
    class Config:
        from_attributes = True

class WaterLogBase(BaseModel):
    date: str
    amount_ml: int

class WaterLogCreate(WaterLogBase):
    pass

class WaterLog(WaterLogBase):
    id: int
    class Config:
        from_attributes = True

class StudyTrackBase(BaseModel):
    name: str
    color_tag: str
    resource_links: Optional[str] = None

class StudyTrackCreate(StudyTrackBase):
    pass

class StudyTrack(StudyTrackBase):
    id: int
    class Config:
        from_attributes = True

class StudyTopicBase(BaseModel):
    track_id: int
    name: str
    status: str = "In Progress"

class StudyTopicCreate(StudyTopicBase):
    pass

class StudyTopic(StudyTopicBase):
    id: int
    class Config:
        from_attributes = True

class StudyHabitBase(BaseModel):
    name: str

class StudyHabitCreate(StudyHabitBase):
    pass

class StudyHabit(StudyHabitBase):
    id: int
    class Config:
        from_attributes = True

class HabitLogBase(BaseModel):
    date: str
    habit_id: int
    checked: bool

class HabitLogCreate(HabitLogBase):
    pass

class HabitLog(HabitLogBase):
    id: int
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
    id: int
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    date: str
    activity_type_id: int
    done: bool
    duration_min: Optional[int] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None
    water_consumed_ml: int = 0

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
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
    id: int
    class Config:
        from_attributes = True

class MetricEntryBase(BaseModel):
    date: str
    metric_id: int
    value: float
    notes: Optional[str] = None

class MetricEntryCreate(MetricEntryBase):
    pass

class MetricEntry(MetricEntryBase):
    id: int
    class Config:
        from_attributes = True

class ReflectionBase(BaseModel):
    date: str
    went_well: str
    improve: str

class ReflectionCreate(ReflectionBase):
    pass

class Reflection(ReflectionBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class InsightBase(BaseModel):
    date: str
    insight_type: str
    insight_text: str
    acted_on: int = 0

class Insight(InsightBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
