from fastapi import APIRouter, Depends
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database.session import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.schemas.report import (
    ProjectReportResponse,
    UserReportResponse,
    TaskReportResponse,
    DailyReportResponse,
    AnalyticsSummaryResponse
)
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Devuelve un resumen completo para las 10 gráficas del dashboard."""
    return report_service.get_analytics_summary(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )

@router.get("/projects", response_model=List[ProjectReportResponse])
def get_project_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Devuelve el total de horas agrupadas por proyecto."""
    return report_service.get_hours_by_project(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )

@router.get("/users", response_model=List[UserReportResponse])
def get_user_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Devuelve el total de horas agrupadas por usuario (empleado)."""
    return report_service.get_hours_by_user(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )

@router.get("/tasks", response_model=List[TaskReportResponse])
def get_task_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Devuelve el total de horas agrupadas por código de tarea."""
    return report_service.get_hours_by_task(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )

@router.get("/daily", response_model=List[DailyReportResponse])
def get_daily_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Devuelve el total de horas agrupadas por día (chronological)."""
    return report_service.get_hours_by_day(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )

@router.get("/export")
def export_xlsx_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    project_id: Optional[str] = None,
    user_id: Optional[str] = None,
    task_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Exporta todo el registro filtrado en formato Excel nativo (.xlsx).
    """
    xlsx_content = report_service.generate_xlsx_export(
        db, start_date=start_date, end_date=end_date,
        project_id=project_id, user_id=user_id, task_code=task_code
    )
    
    timestamp = date.today().isoformat()
    filename = f"timeflow_export_{timestamp}.xlsx"
    
    # Returning it as a StreamingResponse guarantees the bytes flow to the client perfectly formatted.
    from io import BytesIO
    return StreamingResponse(
        iter([xlsx_content]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
