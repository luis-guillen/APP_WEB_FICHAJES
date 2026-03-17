from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import date

from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.task import Task
from app.schemas.time_entry import TimeEntryCreate

def get_entry_by_id(db: Session, entry_id: str) -> TimeEntry | None:
    return db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()

def get_all_time_entries(db: Session, skip: int = 0, limit: int = 100) -> List[TimeEntry]:
    return db.query(TimeEntry).order_by(TimeEntry.created_at.desc()).offset(skip).limit(limit).all()

def get_user_time_entries(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.user_id == user_id).order_by(TimeEntry.created_at.desc()).offset(skip).limit(limit).all()

def get_project_time_entries(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.project_id == project_id).offset(skip).limit(limit).all()

def create_time_entry(db: Session, entry_in: TimeEntryCreate, user_id: str, is_admin: bool = False) -> TimeEntry:
    # 1. Validar que la fecha no sea futura
    if entry_in.date > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register hours for a future date"
        )
    
    # 1b. Restricción de día actual para NO-ADMINS
    if not is_admin and entry_in.date != date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employees can only register hours for the current day. Please contact an admin for past entries."
        )
        
    # 2. Validar rangos de horas
    if entry_in.hours <= 0 or entry_in.hours > 24:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hours must be > 0 and <= 24"
        )
        
    if entry_in.overtime_hours < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Overtime hours must be >= 0"
        )

    # 2. Determinar el user_id final (admin puede sobreescribir)
    target_user_id = user_id
    if is_admin and entry_in.user_id:
        target_user_id = entry_in.user_id

    # 3. Validar existencia de Proyecto y pertenencia
    project = db.query(Project).filter(Project.id == entry_in.project_id).first()
    if not project:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Si NO es non-productive, exigimos asignación para el usuario DESTINO
    if project.type != "non-productive":
        is_assigned = any(u.id == target_user_id for u in project.users)
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User {target_user_id} is not assigned to project {project.code}"
            )

    # 4. Validar Tarea
    task = db.query(Task).filter(Task.id == entry_in.task_id).first()
    if not task:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Validar lógica de Proyectos Oferta ('offer' -> task 115)
    if project.type == "offer" and task.code != "115":
        raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="Offer projects only admit task '115'"
         )

    # 5. Validar tareas de cliente 4XX (requires_extra_fields)
    if getattr(task, "requires_extra_fields", False):
        if entry_in.vehicle_type is None or entry_in.meals is None or entry_in.distance_origin is None:
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail="Tasks requiring extra fields must include vehicle_type, meals, and distance_origin"
             )

    # Nota adiccional: Se asume que el user respeta las allowed_roles,
    # aunque esto cruce db.query(User) si hace falta una comprobación estricta server-side.

    # 6. Auto-split: máximo 8h normales, el exceso pasa a overtime
    MAX_NORMAL = 8.0
    final_hours = float(entry_in.hours)
    final_overtime = float(entry_in.overtime_hours or 0)
    if final_hours > MAX_NORMAL:
        auto_overtime = final_hours - MAX_NORMAL
        final_hours = MAX_NORMAL
        final_overtime += auto_overtime

    # 6. Auto-split: ya realizado arriba

    # 7. Crear finalmente
    db_entry = TimeEntry(
        user_id=target_user_id,
        project_id=entry_in.project_id,
        task_id=entry_in.task_id,
        date=entry_in.date,
        is_holiday=entry_in.is_holiday,
        hours=final_hours,
        overtime_hours=final_overtime,
        vehicle_type=entry_in.vehicle_type if (is_admin or getattr(task, "requires_extra_fields", False)) else None,
        meals=entry_in.meals if (is_admin or getattr(task, "requires_extra_fields", False)) else None,
        distance_origin=entry_in.distance_origin if (is_admin or getattr(task, "requires_extra_fields", False)) else None,
        trip_type=entry_in.trip_type if (is_admin or getattr(task, "requires_extra_fields", False)) else None,
        travel_time=entry_in.travel_time or 0.0,
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def delete_entry(db: Session, entry_id: str):
    entry = get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found")
        
    db.delete(entry)
    db.commit()
    return True

def update_entry(db: Session, entry_id: str, entry_in: TimeEntryCreate) -> TimeEntry:
    db_entry = get_entry_by_id(db, entry_id)
    if not db_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found")

    # Re-apply auto-split logic for consistency
    MAX_NORMAL = 8.0
    final_hours = float(entry_in.hours)
    final_overtime = float(entry_in.overtime_hours or 0)
    if final_hours > MAX_NORMAL:
        auto_overtime = final_hours - MAX_NORMAL
        final_hours = MAX_NORMAL
        final_overtime += auto_overtime

    db_entry.project_id = entry_in.project_id
    db_entry.task_id = entry_in.task_id
    db_entry.date = entry_in.date
    db_entry.is_holiday = entry_in.is_holiday
    db_entry.hours = final_hours
    db_entry.overtime_hours = final_overtime
    db_entry.vehicle_type = entry_in.vehicle_type
    db_entry.meals = entry_in.meals
    db_entry.distance_origin = entry_in.distance_origin
    db_entry.trip_type = entry_in.trip_type
    db_entry.travel_time = entry_in.travel_time or 0.0

    db.commit()
    db.refresh(db_entry)
    return db_entry
