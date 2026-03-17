from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class ProjectBase(BaseModel):
    name: str
    code: str
    location: Optional[str] = None
    distance_from_workshop: float = 0.0
    travel_time_to: Optional[int] = 0    # minutos de ida
    travel_time_from: Optional[int] = 0  # minutos de vuelta
    start_date: date
    type: str

class ProjectCreate(ProjectBase):
    assigned_user_ids: List[str] = []

class ProjectResponse(ProjectBase):
    id: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
