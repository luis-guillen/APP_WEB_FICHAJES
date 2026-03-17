from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.user import User
from app.models.task import Task
from app.models import Base
from datetime import date
from sqlalchemy import select

engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)
db = TestingSessionLocal()

try:
    # Setup
    u = User(employee_code="u1", name="U1", role="r1", is_admin=False, password_hash="dummy")
    p = Project(id="p1", code="P1", name="P1", distance_from_workshop=0.0, start_date=date(2025,1,1), type="standard")
    t = Task(id="t1", code="T1", name="T1", category="c1")
    db.add_all([u, p, t])
    db.commit()

    # Log entry
    entry = TimeEntry(user_id=u.id, project_id=p.id, task_id=t.id, date=date(2025, 6, 1), hours=5.0, overtime_hours=1.0)
    db.add(entry)
    db.commit()

    # Query exactly like report_service
    # Style 1: join from Project
    q1 = db.query(Project.name, func.sum(TimeEntry.hours)).join(TimeEntry).group_by(Project.name).all()
    print(f"Join Style 1 (Project.join(TimeEntry)): {q1}")

    # Style 2: join from TimeEntry
    q2 = db.query(Project.name, func.sum(TimeEntry.hours)).select_from(TimeEntry).join(Project).group_by(Project.name).all()
    print(f"Join Style 2 (TimeEntry.join(Project)): {q2}")

    # Style 3: Implicit join (Where)
    q3 = db.query(Project.name, func.sum(TimeEntry.hours)).filter(TimeEntry.project_id == Project.id).group_by(Project.name).all()
    print(f"Join Style 3 (Implicit): {q3}")
    
    res = q.all()
    print(f"Query Result: {res}")
    
    # Check if entry exists
    print(f"Raw Entry Date: {db.query(TimeEntry.date).first()}")

finally:
    db.close()
