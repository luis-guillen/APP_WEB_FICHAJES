from sqlalchemy import Table, Column, String, ForeignKey
from . import Base

project_user_table = Table(
    "project_users",
    Base.metadata,
    Column("project_id", String(36), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)
