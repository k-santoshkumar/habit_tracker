from sqlalchemy import Column, Integer, String, Boolean, Float, Text, Date, DateTime, ForeignKey, Enum, Time
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dob = Column(String) # YYYY-MM-DD
    weight_kg = Column(Float)
    height_cm = Column(Float)
    condition_notes = Column(Text, nullable=True)
    start_date = Column(String)
    push_notifications_enabled = Column(Boolean, default=False)
    morning_summary_time = Column(String, default="08:00")
    bedtime_prompt_time = Column(String, default="20:00")
    protein_target_g = Column(Integer, default=100)
    water_target_ml = Column(Integer, default=2500)
    dietary_flags = Column(String, nullable=True) # JSON array like '["Vegetarian", "No dairy"]'
    hard_rules = Column(Text, nullable=True)

class Tablet(Base):
    __tablename__ = "tablets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dose = Column(String)
    frequency = Column(String)
    timing = Column(String) # "Morning", "Afternoon", "Evening", "Night"
    critical = Column(Boolean, default=False)
    reminder_time = Column(String, nullable=True) # "08:00"

class TabletLog(Base):
    __tablename__ = "tablet_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    tablet_id = Column(Integer, ForeignKey("tablets.id"))
    status = Column(String) # "Taken", "Missed", "Taken late"
    
class MealSlot(Base):
    __tablename__ = "meal_slots"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    time = Column(String)
    description = Column(String, nullable=True)
    protein_estimate = Column(Integer, default=0)

class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    meal_slot_id = Column(Integer, ForeignKey("meal_slots.id"))
    checked = Column(Boolean, default=False)
    proof_image = Column(Text, nullable=True)

class WaterLog(Base):
    __tablename__ = "water_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True, unique=True)
    amount_ml = Column(Integer, default=0)

class StudyTrack(Base):
    __tablename__ = "study_tracks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    color_tag = Column(String)
    resource_links = Column(Text, nullable=True)

class StudyTopic(Base):
    __tablename__ = "study_topics"
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("study_tracks.id"))
    name = Column(String)
    status = Column(String, default="In Progress")

class StudyHabit(Base):
    __tablename__ = "study_habits"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class HabitLog(Base):
    __tablename__ = "habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    habit_id = Column(Integer, ForeignKey("study_habits.id"))
    checked = Column(Boolean, default=False)

class ActivityType(Base):
    __tablename__ = "activity_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    icon = Column(String)
    color_tag = Column(String)
    schedule_days = Column(String)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    activity_type_id = Column(Integer, ForeignKey("activity_types.id"))
    done = Column(Boolean, default=False)
    duration_min = Column(Integer, nullable=True)
    intensity = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    water_consumed_ml = Column(Integer, default=0)

class HealthMetric(Base):
    __tablename__ = "health_metrics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    unit = Column(String)
    min_range = Column(Float, nullable=True)
    max_range = Column(Float, nullable=True)

class MetricEntry(Base):
    __tablename__ = "metric_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    metric_id = Column(Integer, ForeignKey("health_metrics.id"))
    value = Column(Float)
    notes = Column(Text, nullable=True)

class DailyScore(Base):
    __tablename__ = "daily_scores"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True)
    score = Column(Integer, default=0)
    breakdown_json = Column(Text, default="{}")
    frozen = Column(Integer, default=0)

class Streak(Base):
    __tablename__ = "streaks"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True)
    current_count = Column(Integer, default=0)
    longest_count = Column(Integer, default=0)
    last_updated = Column(String)

class Reflection(Base):
    __tablename__ = "reflections"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True)
    went_well = Column(Text)
    improve = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.now)

class Insight(Base):
    __tablename__ = "insights"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    insight_type = Column(String)
    insight_text = Column(String)
    acted_on = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.now)

class PersonalBest(Base):
    __tablename__ = "personal_bests"
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, unique=True)
    best_value = Column(Integer, default=0)
    achieved_date = Column(String)

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(Text)
    p256dh = Column(Text)
    auth = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.now)

class WeeklyChallenge(Base):
    __tablename__ = "weekly_challenges"
    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(String, unique=True)
    challenge_type = Column(String)
    target_value = Column(Integer)
    current_value = Column(Integer, default=0)
    completed = Column(Integer, default=0)

class SleepLog(Base):
    __tablename__ = "sleep_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True)
    sleep_time = Column(String)  # "23:30"
    wake_time = Column(String)   # "07:00"
    quality = Column(Integer, default=3)  # 1-5
    duration_min = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

class MoodEntry(Base):
    __tablename__ = "mood_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True)
    mood = Column(Integer, default=3)  # 1-5 (awful to great)
    energy = Column(Integer, default=3)  # 1-5
    stress = Column(Integer, default=3)  # 1-5
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

class CustomHabit(Base):
    __tablename__ = "custom_habits"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    icon = Column(String, default="Check")
    color = Column(String, default="teal")
    frequency = Column(String, default="daily")  # daily, weekdays, custom
    target_days = Column(String, nullable=True)   # "Mon,Tue,Wed" etc.
    created_at = Column(DateTime, default=datetime.datetime.now)

class CustomHabitLog(Base):
    __tablename__ = "custom_habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    habit_id = Column(Integer, ForeignKey("custom_habits.id"))
    completed = Column(Boolean, default=False)

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    category = Column(String, default="General")  # Fitness, Health, Study, Lifestyle
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0)
    unit = Column(String, nullable=True)
    deadline = Column(String, nullable=True)  # YYYY-MM-DD
    status = Column(String, default="Active")  # Active, Completed, Paused
    created_at = Column(DateTime, default=datetime.datetime.now)

class GoalMilestone(Base):
    __tablename__ = "goal_milestones"
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"))
    title = Column(String)
    completed = Column(Boolean, default=False)
    completed_date = Column(String, nullable=True)

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    duration_min = Column(Integer, default=25)
    break_min = Column(Integer, default=5)
    label = Column(String, nullable=True)  # What you studied/worked on
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.now)

class PhotoEntry(Base):
    __tablename__ = "photo_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    image_data = Column(Text)  # Base64 encoded image or path
    caption = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
