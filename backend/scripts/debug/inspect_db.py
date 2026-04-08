import os
import sys
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from decimal import Decimal

# Add current path to sys.path
sys.path.append(os.getcwd())

from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.user import User
from app.models.task import Task
from app.database.session import SessionLocal

db = SessionLocal()

def run_diagnostics():
    print("--- DIAGNOSTICS FOR timeflow.db ---")
    
    # 1. Count totals
    users_count = db.query(User).count()
    projects_count = db.query(Project).count()
    tasks_count = db.query(Task).count()
    entries_count = db.query(TimeEntry).count()
    
    print(f"Users: {users_count}")
    print(f"Projects: {projects_count}")
    print(f"Tasks: {tasks_count}")
    print(f"TimeEntries: {entries_count}")
    
    if entries_count > 0:
        print("\n--- SAMPLE ENTRIES ---")
        entries = db.query(TimeEntry).limit(5).all()
        for e in entries:
            print(f"ID={e.id} User={e.user_id} Proj={e.project_id} Date={e.date} Hrs={e.hours}")
            
        # 2. Test the specific problematic query
        print("\n--- TESTING PROJECT REPORT QUERY ---")
        try:
            query = db.query(
                func.strftime('%Y-%m', TimeEntry.date).label("year_month"),
                Project.id.label("project_id"),
                Project.name.label("project_name"),
                (func.sum(func.coalesce(TimeEntry.hours, 0)) + func.sum(func.coalesce(TimeEntry.overtime_hours, 0))).label("total_hours"),
                func.sum(func.coalesce(TimeEntry.overtime_hours, 0)).label("total_overtime")
            ).select_from(TimeEntry).join(Project, TimeEntry.project_id == Project.id)
            
            result = query.group_by(
                func.strftime('%Y-%m', TimeEntry.date), Project.id, Project.name
            ).all()
            
            print(f"Project Report Result Count: {len(result)}")
            for r in result:
                print(r)
        except Exception as e:
            print(f"ERROR in Project Report Query: {e}")

        # 3. Check for orphan entries
        orphan_projects = db.query(TimeEntry).filter(~TimeEntry.project_id.in_(db.query(Project.id))).count()
        orphan_tasks = db.query(TimeEntry).filter(~TimeEntry.task_id.in_(db.query(Task.id))).count()
        orphan_users = db.query(TimeEntry).filter(~TimeEntry.user_id.in_(db.query(User.id))).count()
        
        print(f"\nOrphan entries (Project mismatch): {orphan_projects}")
        print(f"Orphan entries (Task mismatch): {orphan_tasks}")
        print(f"Orphan entries (User mismatch): {orphan_users}")

    db.close()

if __name__ == "__main__":
    run_diagnostics()
