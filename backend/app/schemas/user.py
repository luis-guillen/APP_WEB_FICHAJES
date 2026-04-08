from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    employee_code: str
    name: str
    home_location: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str
    is_admin: Optional[bool] = False

class UserResponse(UserBase):
    id: str
    is_admin: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
