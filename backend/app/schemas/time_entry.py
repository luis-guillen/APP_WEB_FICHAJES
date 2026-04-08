from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class TimeEntryCreate(BaseModel):
    project_id: str
    task_id: str
    date: date
    is_holiday: Optional[bool] = False
    hours: float
    overtime_hours: Optional[float] = 0.0
    
    vehicle_type: Optional[str] = None
    meals: Optional[bool] = None
    distance_origin: Optional[str] = None
    trip_type: Optional[str] = None # "to", "from", "round"
    travel_time: Optional[float] = 0.0  # Admin-managed travel time (hours)
    user_id: Optional[str] = None  # Admin can specify user_id

class TimeEntryResponse(TimeEntryCreate):
    id: str
    user_id: str
    model_config = ConfigDict(from_attributes=True)
