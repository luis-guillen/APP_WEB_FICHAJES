from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class ProjectBase(BaseModel):
    name: str
    code: str
    location: Optional[str] = None
    distance_from_workshop: float = 0.0
    travel_time: Optional[int] = 0           # minutos de ida (el servicio lo multiplicará x2)
    start_date: date
    type: str

class ProjectCreate(ProjectBase):
    assigned_user_ids: List[str] = []

class ProjectResponse(ProjectBase):
    id: str
    is_active: bool
    assigned_user_ids: List[str] = []
    model_config = ConfigDict(from_attributes=True)
