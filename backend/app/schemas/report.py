from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date

class ProjectReportResponse(BaseModel):
    year_month: str
    project_id: str
    project_name: str
    total_hours: float
    total_overtime: float
    model_config = ConfigDict(from_attributes=True)

class UserReportResponse(BaseModel):
    year_month: str
    user_id: str
    employee_code: str
    name: str
    total_hours: float
    total_overtime: float
    model_config = ConfigDict(from_attributes=True)

class TaskReportResponse(BaseModel):
    year_month: str
    task_code: str
    task_name: str
    total_hours: float
    model_config = ConfigDict(from_attributes=True)

class DailyReportResponse(BaseModel):
    date: date
    total_hours: float
    model_config = ConfigDict(from_attributes=True)
class AnalyticsSummaryResponse(BaseModel):
    # 1. Heatmap: Empleado -> Lista de {fecha, horas}
    heatmap: List[dict] 
    # 2. Daily Categories: Lista de {fecha, Oficina, Taller, Planta}
    daily_categories: List[dict]
    # 3. User Totals: Lista de {name, hours}
    user_totals: List[dict]
    # 4. Task Totals: Lista de {name, hours}
    task_totals: List[dict]
    # 5. Daily Summary: Lista de {date, hours, entries_count}
    daily_summary: List[dict]
    # 6. Category Distribution: Lista de {name, value}
    category_distribution: List[dict]
    # 7. Logistics (KM): Lista de {name, personal_km, company_km}
    logistics_km: List[dict]
    # 8. Dietas: Lista de {name, yes, no}
    dietas_summary: List[dict]
    # 9. Radar: Lista de {employee, category, hours}
    user_skills: List[dict]
    treemap_data: dict
    total_overtime: float

    model_config = ConfigDict(from_attributes=True)
