from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.user import User
from datetime import date
import sys

db = SessionLocal()
try:
    print(f"Total TimeEntries in DB: {db.query(TimeEntry).count()}")
    
    # Try a simple join
    res = db.query(TimeEntry, Project.code).join(Project).limit(5).all()
    print(f"Sample joined entries: {len(res)}")
    for e, code in res:
        print(f"Entry ID: {e.id}, Date: {e.date}, Project: {code}, Hours: {e.hours}")

    # Try the grouping logic
    report = db.query(
        func.strftime('%Y-%m', TimeEntry.date).label("year_month"),
        func.sum(TimeEntry.hours + TimeEntry.overtime_hours)
    ).group_by(func.strftime('%Y-%m', TimeEntry.date)).all()
    print(f"Grouping results: {report}")

finally:
    db.close()
