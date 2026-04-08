from pydantic import BaseModel, ConfigDict
from typing import List

class TaskResponse(BaseModel):
    id: str
    code: str
    name: str
    category: str
    requires_extra_fields: bool
    allowed_roles: List[str]
    model_config = ConfigDict(from_attributes=True)
