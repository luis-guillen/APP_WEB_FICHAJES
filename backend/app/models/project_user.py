from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class ProjectUser(Base):
    __tablename__ = "project_users"
    
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(50), nullable=False) # El rol asignado para este proyecto particular

    # Relaciones para navegar desde project_users
    project = relationship("Project", back_populates="user_associations")
    user = relationship("User", back_populates="project_associations")

