from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.task import TaskResponse
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/", response_model=List[TaskResponse])
def get_all_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Catálogo de tareas general. Accesible por cualquier usuario autenticado.
    El componente frontend puede usar `.allowed_roles` para filtrar el select.
    """
    return task_service.list_tasks(db, skip=skip, limit=limit)
