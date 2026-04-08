from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class ProjectUserAssignment(BaseModel):
    user_id: str
    role: str

class ProjectBase(BaseModel):
    name: str
    code: str
    location: Optional[str] = None
    distance_from_workshop: float = 0.0
    travel_time: Optional[int] = 0           # minutos de ida (el servicio lo multiplicará x2)
    start_date: date
    type: str

class ProjectCreate(ProjectBase):
    # En la creación esperamos una lista de dicts
    assigned_users: List[ProjectUserAssignment] = []

class ProjectResponse(ProjectBase):
    id: str
    is_active: bool
    # Modificamos la respuesta para mostrar usuarios con sus roles
    assigned_users: List[ProjectUserAssignment] = []
    
    model_config = ConfigDict(from_attributes=True)
