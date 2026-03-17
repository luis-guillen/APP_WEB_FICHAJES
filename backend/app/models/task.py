from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.orm import relationship
from . import Base, generate_uuid

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    requires_extra_fields = Column(Boolean, default=False)
    
    allowed_roles = Column(JSON, nullable=False, default=list)

    time_entries = relationship("TimeEntry", back_populates="task")
