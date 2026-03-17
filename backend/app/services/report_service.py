import csv
from io import StringIO
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.user import User
from app.models.task import Task
from app.schemas.report import (
    ProjectReportResponse,
    UserReportResponse,
    TaskReportResponse,
    DailyReportResponse
)

def apply_filters(query, start_date: Optional[date] = None, end_date: Optional[date] = None, 
                  project_id: Optional[str] = None, user_id: Optional[str] = None, task_code: Optional[str] = None):
    """Aplica de manera programática los filtros comunes a las consultas de TimeEntry."""
    if start_date:
        query = query.filter(TimeEntry.date >= start_date)
    if end_date:
        query = query.filter(TimeEntry.date <= end_date)
    if project_id:
        query = query.filter(TimeEntry.project_id == project_id)
    if user_id:
        query = query.filter(TimeEntry.user_id == user_id)
    if task_code:
        query = query.outerjoin(Task, TimeEntry.task_id == Task.id).filter(Task.code == task_code)
    return query

def get_hours_by_project(db: Session, **filters) -> List[ProjectReportResponse]:
    query = db.query(
        func.strftime('%Y-%m', TimeEntry.date).label("year_month"),
        Project.id.label("project_id"),
        Project.name.label("project_name"),
        func.sum(func.coalesce(TimeEntry.hours, 0)).label("total_hours"),
        func.sum(func.coalesce(TimeEntry.overtime_hours, 0)).label("total_overtime")
    ).outerjoin(Project, TimeEntry.project_id == Project.id)
    
    query = apply_filters(query, **filters)
    
    result = query.group_by(
        func.strftime('%Y-%m', TimeEntry.date), Project.id, Project.name
    ).order_by(func.strftime('%Y-%m', TimeEntry.date).desc()).all()
    return result

def get_hours_by_user(db: Session, **filters) -> List[UserReportResponse]:
    query = db.query(
        func.strftime('%Y-%m', TimeEntry.date).label("year_month"),
        User.id.label("user_id"),
        User.employee_code.label("employee_code"),
        User.name.label("name"),
        func.sum(func.coalesce(TimeEntry.hours, 0)).label("total_hours"),
        func.sum(func.coalesce(TimeEntry.overtime_hours, 0)).label("total_overtime")
    ).outerjoin(User, TimeEntry.user_id == User.id)
    
    query = apply_filters(query, **filters)
    result = query.group_by(
        func.strftime('%Y-%m', TimeEntry.date), User.id, User.employee_code, User.name
    ).order_by(func.strftime('%Y-%m', TimeEntry.date).desc()).all()
    return result

def get_hours_by_task(db: Session, **filters) -> List[TaskReportResponse]:
    query = db.query(
        func.strftime('%Y-%m', TimeEntry.date).label("year_month"),
        Task.code.label("task_code"),
        Task.name.label("task_name"),
        func.sum(func.coalesce(TimeEntry.hours, 0)).label("total_hours")
    ).outerjoin(Task, TimeEntry.task_id == Task.id)
    
    query = apply_filters(query, **filters)
    result = query.group_by(
        func.strftime('%Y-%m', TimeEntry.date), Task.code, Task.name
    ).order_by(func.strftime('%Y-%m', TimeEntry.date).desc()).all()
    return result

def get_hours_by_day(db: Session, **filters) -> List[DailyReportResponse]:
    query = db.query(
        TimeEntry.date.label("date"),
        (func.sum(func.coalesce(TimeEntry.hours, 0)) + func.sum(func.coalesce(TimeEntry.overtime_hours, 0))).label("total_hours")
    ).select_from(TimeEntry)
    
    query = apply_filters(query, **filters)
    result = query.group_by(TimeEntry.date).order_by(TimeEntry.date).all()
    return result

def generate_xlsx_export(db: Session, **filters) -> bytes:
    from io import BytesIO
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    
    # 1. Nueva consulta granular: agrupamos por Proyecto, Fecha, Usuario y Tarea
    query = db.query(
        Project.code.label("project_code"),
        Project.name.label("project_name"),
        Project.distance_from_workshop.label("project_distance"),
        TimeEntry.date.label("date"),
        TimeEntry.is_holiday.label("is_holiday"),
        User.employee_code.label("employee_code"),
        User.name.label("employee_name"),
        Task.code.label("task_code"),
        Task.name.label("task_name"),
        TimeEntry.vehicle_type.label("vehicle_type"),
        TimeEntry.meals.label("meals"),
        TimeEntry.distance_origin.label("distance_origin"),
        TimeEntry.trip_type.label("trip_type"),
        func.coalesce(func.sum(TimeEntry.hours + TimeEntry.overtime_hours), 0).label("total_hours"),
        func.coalesce(func.sum(TimeEntry.travel_time), 0).label("travel_time")
    ).join(Project, TimeEntry.project_id == Project.id)\
     .join(Task, TimeEntry.task_id == Task.id)\
     .join(User, TimeEntry.user_id == User.id)

    query = apply_filters(query, **filters)
    
    # Orden lógico: Proyecto -> Fecha -> Usuario -> Tarea
    entries = query.group_by(
        Project.code,
        Project.name,
        Project.distance_from_workshop,
        TimeEntry.date,
        TimeEntry.is_holiday,
        User.employee_code,
        User.name,
        Task.code,
        Task.name,
        TimeEntry.vehicle_type,
        TimeEntry.meals,
        TimeEntry.distance_origin,
        TimeEntry.trip_type
    ).order_by(Project.code, TimeEntry.date, User.employee_code, Task.code).all()

    # Reestructuramos los datos para enviarlos al generador de la hoja:
    projects_dict = {}
    for entry in entries:
        p_code = entry.project_code
        if p_code not in projects_dict:
            projects_dict[p_code] = {
                "code": p_code,
                "name": entry.project_name,
                "rows": []
            }
        
        projects_dict[p_code]["rows"].append({
            "date": entry.date,
            "is_holiday": entry.is_holiday,
            "emp_code": entry.employee_code,
            "emp_name": entry.employee_name,
            "task_code": entry.task_code,
            "task_name": entry.task_name,
            "hours": float(entry.total_hours),
            "travel_time": float(entry.travel_time or 0),
            "vehicle": entry.vehicle_type,
            "meals": entry.meals,
            "origin": entry.distance_origin,
            "trip_type": entry.trip_type,
            "project_distance": entry.project_distance
        })

    projects_list = list(projects_dict.values())
    return _build_openpyxl_wb(projects_list)

def get_analytics_summary(db: Session, **filters) -> dict:
    # Fetch all relevant entries for the filtered period
    query = db.query(
        TimeEntry.date,
        User.name.label("user_name"),
        Task.name.label("task_name"),
        Task.category.label("task_category"),
        TimeEntry.hours,
        TimeEntry.overtime_hours,
        TimeEntry.vehicle_type,
        TimeEntry.distance_origin,
        TimeEntry.trip_type,
        TimeEntry.meals,
        Project.distance_from_workshop.label("project_distance"),
        Project.travel_time_to.label("proj_travel_time_to"),
        Project.travel_time_from.label("proj_travel_time_from")
    ).join(User, TimeEntry.user_id == User.id)\
     .join(Task, TimeEntry.task_id == Task.id)\
     .join(Project, TimeEntry.project_id == Project.id)

    query = apply_filters(query, **filters)
    entries = query.all()

    if not entries:
        return {
            "heatmap": [], "daily_categories": [], "user_totals": [], "task_totals": [],
            "daily_summary": [], "category_distribution": [], "logistics_km": [],
            "dietas_summary": [], "user_skills": [], "treemap_data": {"name": "root", "children": []},
            "travel_hours": [], "total_overtime": 0.0
        }

    # Data Structures for aggregation
    heatmap_data = {} # {user: {date: hours}}
    daily_cats = {}   # {date: {cat: hours}}
    user_hrs = {}     # {user: hours}
    task_hrs = {}     # {task: hours}
    daily_sum = {}    # {date: {hours: 0, count: 0}}
    cat_dist = {}     # {cat: hours}
    logistics = {}    # {user: {personal: 0, company: 0}}
    travel_by_user = {}  # {user: total_minutes}
    dietas = {}       # {user: {yes: 0, no: 0}}
    skills = {}       # {user: {cat: hours}}
    treemap_raw = {}  # {cat: {task: hours}}
    total_ovt = 0.0

    for e in entries:
        d_str = e.date.isoformat()
        u = e.user_name
        t = e.task_name
        c = e.task_category
        h = float(e.hours)  # Only normal hours in analytics (no overtime)
        ovt = float(e.overtime_hours or 0)
        total_ovt += ovt
        
        # 1. Heatmap
        if u not in heatmap_data: heatmap_data[u] = {}
        heatmap_data[u][d_str] = heatmap_data[u].get(d_str, 0) + h

        # 2. Daily Categories
        if d_str not in daily_cats: daily_cats[d_str] = {}
        daily_cats[d_str][c] = daily_cats[d_str].get(c, 0) + h

        # 3. User Totals
        user_hrs[u] = user_hrs.get(u, 0) + h

        # 4. Task Totals
        task_hrs[t] = task_hrs.get(t, 0) + h

        # 5. Daily Summary
        if d_str not in daily_sum: daily_sum[d_str] = {"hours": 0, "count": 0}
        daily_sum[d_str]["hours"] += h
        daily_sum[d_str]["count"] += 1

        # 6. Category Dist
        cat_dist[c] = cat_dist.get(c, 0) + h

        # 7. Logistics KM
        if u not in logistics: logistics[u] = {"personal": 0, "company": 0}
        if e.vehicle_type in ("personal", "particular"):
            mult = 2.0 if e.trip_type == "round" else 1.0
            logistics[u]["personal"] += float(e.project_distance or 0) * mult
        elif e.vehicle_type in ("company", "empresa"):
             # Even if company car doesn't add "reimbursement" KM, we record it for usage tracking
             mult = 2.0 if e.trip_type == "round" else 1.0
             logistics[u]["company"] += float(e.project_distance or 0) * mult

        # 8. Travel time (minutos → acumulado por usuario)
        if e.vehicle_type:
            mins = 0
            tt_to = int(e.proj_travel_time_to or 0)
            tt_from = int(e.proj_travel_time_from or 0)
            if e.trip_type == "round":
                mins = tt_to + tt_from
            elif e.trip_type == "to":
                mins = tt_to
            elif e.trip_type == "from":
                mins = tt_from
            travel_by_user[u] = travel_by_user.get(u, 0) + mins

        # 9. Dietas
        if u not in dietas: dietas[u] = {"yes": 0, "no": 0}
        if e.meals is True: dietas[u]["yes"] += 1
        elif e.meals is False: dietas[u]["no"] += 1

        # 10. Skills (Radar)
        if u not in skills: skills[u] = {}
        skills[u][c] = skills[u].get(c, 0) + h

        # 11. Treemap
        if c not in treemap_raw: treemap_raw[c] = {}
        treemap_raw[c][t] = treemap_raw[c].get(t, 0) + h

    # Formatting for Recharts
    formatted_heatmap = [{"user": u, "data": [{"date": d, "hours": hrs} for d, hrs in d_map.items()]} for u, d_map in heatmap_data.items()]
    formatted_daily_cats = [{"date": d, **cats} for d, cats in daily_cats.items()]
    formatted_user_totals = sorted([{"name": u, "hours": hrs} for u, hrs in user_hrs.items()], key=lambda x: x["hours"], reverse=True)
    formatted_task_totals = sorted([{"name": t, "hours": hrs} for t, hrs in task_hrs.items()], key=lambda x: x["hours"], reverse=True)[:10]
    formatted_daily_summary = [{"date": d, "hours": v["hours"], "count": v["count"]} for d, v in daily_sum.items()]
    formatted_cat_dist = [{"name": c, "value": h} for c, h in cat_dist.items()]
    formatted_logistics = [{"name": u, "personal_km": v["personal"], "company_km": v["company"]} for u, v in logistics.items()]
    formatted_travel_hours = sorted(
        [{"name": u, "travel_hours": round(m / 60, 2)} for u, m in travel_by_user.items() if m > 0],
        key=lambda x: x["travel_hours"]
    )
    formatted_dietas = [{"name": u, "yes": v["yes"], "no": v["no"]} for u, v in dietas.items()]
    formatted_skills = []
    for u, cats in skills.items():
        for c, h in cats.items():
            formatted_skills.append({"employee": u, "category": c, "hours": h})
    
    treemap_data = {
        "name": "root",
        "children": [
            {"name": c, "children": [{"name": t, "value": h} for t, h in tasks.items()]}
            for c, tasks in treemap_raw.items()
        ]
    }

    return {
        "heatmap": formatted_heatmap,
        "daily_categories": formatted_daily_cats,
        "user_totals": formatted_user_totals,
        "task_totals": formatted_task_totals,
        "daily_summary": formatted_daily_summary,
        "category_distribution": formatted_cat_dist,
        "logistics_km": formatted_logistics,
        "travel_hours": formatted_travel_hours,
        "dietas_summary": formatted_dietas,
        "user_skills": formatted_skills,
        "treemap_data": treemap_data,
        "total_overtime": total_ovt
    }


def _build_openpyxl_wb(projects: list[dict]) -> bytes:
    from io import BytesIO
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Informe Horas"

    # ── Estilos ──
    header_font = Font(name="Arial", bold=True, size=10)
    header_fill = PatternFill("solid", fgColor="FFFF00")  # amarillo
    header_alignment = Alignment(horizontal="center", vertical="center")

    data_font = Font(name="Arial", size=10)
    data_alignment_left = Alignment(horizontal="left", vertical="center")
    data_alignment_center = Alignment(horizontal="center", vertical="center")
    data_alignment_right = Alignment(horizontal="right", vertical="center")

    thin_border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )

    # ── Anchos de columna ──
    col_widths = {
        "A": 12,   # Fecha
        "B": 10,   # Festivo
        "C": 14,   # Cód. empleado
        "D": 25,   # Nombre
        "E": 12,   # Cód. artículo
        "F": 25,   # Desc. artículo
        "G": 10,   # Horas
        "H": 12,   # Desplaz. (h)
        "I": 10,   # Precio
        "J": 15,   # Transporte
        "K": 15,   # Origen
        "L": 10,   # KMs
        "M": 10,   # Dieta
    }
    for col_letter, width in col_widths.items():
        ws.column_dimensions[col_letter].width = width

    HEADERS = ["Fecha", "Festivo", "Cód. empleado", "Nombre", "Cód. artículo", "Desc. artículo", 
               "Horas", "Desplaz. (h)", "Precio", "Transporte", "Origen", "KMs", "Dieta"]

    # Style for holiday rows
    holiday_fill = PatternFill("solid", fgColor="FFC7CE")  # light red

    current_row = 1

    for proj_idx, project in enumerate(projects):
        if proj_idx > 0:
            current_row += 1  # fila en blanco entre proyectos

        # Título del proyecto
        ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=len(HEADERS))
        title_cell = ws.cell(row=current_row, column=1)
        title_cell.value = f"Proyecto: {project['code']} - {project['name']}"
        title_cell.font = Font(name="Arial", bold=True, size=11, color="333333")
        title_cell.alignment = Alignment(horizontal="left", vertical="center")
        title_cell.fill = PatternFill("solid", fgColor="D9E1F2")  # azul claro
        for col in range(1, len(HEADERS) + 1):
            ws.cell(row=current_row, column=col).border = thin_border
        current_row += 1

        # ── Cabecera amarilla ──
        for col_idx, header in enumerate(HEADERS, start=1):
            cell = ws.cell(row=current_row, column=col_idx)
            cell.value = header
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            cell.border = thin_border
        current_row += 1

        # ── Filas de datos agrupados por día y trabajador ──
        first_data_row = current_row
        for row_info in project["rows"]:
            
            # Castings estéticos
            emp_code = str(row_info["emp_code"])
            task_code = str(row_info["task_code"])
            is_holiday = row_info.get("is_holiday", False)
            
            # Mapeo de términos para mejor lectura
            transporte = "Particular" if row_info["vehicle"] in ("personal", "particular") else ("Empresa" if row_info["vehicle"] in ("company", "empresa") else "-")
            
            tipo_trayecto = ""
            if row_info["trip_type"] == "to": tipo_trayecto = "(IDA)"
            elif row_info["trip_type"] == "from": tipo_trayecto = "(VUELTA)"
            elif row_info["trip_type"] == "round": tipo_trayecto = "(IDA+VTA)"
            
            origin_base = "NAVE" if row_info["origin"] == "workshop" else (str(row_info["origin"]) if row_info["origin"] else "-")
            origen = f"{origin_base} {tipo_trayecto}".strip()
            
            dieta = "SÍ" if row_info["meals"] else ("NO" if row_info["meals"] is False else "-")
            
            # Cálculo de KM: Solo si el coche es PARTICULAR
            kms = 0.0
            if row_info["vehicle"] in ("personal", "particular"):
                # Multiplicador: IDA=1, VUELTA=1, AMBOS=2
                multiplier = 2.0 if row_info["trip_type"] == "round" else 1.0
                dist_base = float(row_info["project_distance"] or 0.0)
                kms = dist_base * multiplier
            
            row_data = [
                row_info["date"].strftime("%d-%m-%Y"),                 # Fecha
                "SÍ" if is_holiday else "",                            # Festivo
                int(emp_code) if emp_code.isdigit() else emp_code,     # Cód. empleado
                row_info["emp_name"],                                  # Nombre operario
                int(task_code) if task_code.isdigit() else task_code,  # Cód. artículo (tarea)
                row_info["task_name"],                                 # Desc. artículo
                row_info["hours"],                                     # Horas
                row_info.get("travel_time", 0),                        # Desplaz. (h)
                0.00,                                                  # Precio (placeholder)
                transporte,                                            # Transporte
                origen,                                                # Origen
                kms,                                                   # KMs
                dieta,                                                 # Dieta
            ]

            for col_idx, value in enumerate(row_data, start=1):
                cell = ws.cell(row=current_row, column=col_idx)
                cell.value = value
                cell.font = data_font
                cell.border = thin_border

                # Apply holiday styling (light red background)
                if is_holiday:
                    cell.fill = holiday_fill

                if col_idx == 1:  # Fecha
                    cell.alignment = data_alignment_center
                elif col_idx == 2:  # Festivo
                    cell.alignment = data_alignment_center
                elif col_idx in (3, 5):  # códigos numéricos
                    cell.alignment = data_alignment_center
                elif col_idx in (4, 6, 10, 11, 13):  # textos y etiquetas
                    cell.alignment = data_alignment_left
                elif col_idx in (7, 8, 9, 12):  # Horas / Desplaz. / Precio / KMs
                    cell.alignment = data_alignment_right
                    cell.number_format = '#,##0.00'

            current_row += 1
            
        # Si no hubo filas de datos (muy raro), evitamos que la fórmula rompa
        if first_data_row == current_row:
            last_data_row = first_data_row
            ws.cell(row=first_data_row, column=1).value = "Sin registros"
            current_row += 1
        else:
            last_data_row = current_row - 1

        # ── Fila de TOTAL por proyecto ──
        total_font = Font(name="Arial", bold=True, size=10)
        total_fill = PatternFill("solid", fgColor="E2EFDA")  # verde claro

        ws.cell(row=current_row, column=1).value = ""
        ws.cell(row=current_row, column=1).border = thin_border
        ws.cell(row=current_row, column=1).fill = total_fill

        for col in range(2, 6):
            c = ws.cell(row=current_row, column=col)
            c.value = ""
            c.border = thin_border
            c.fill = total_fill

        ws.merge_cells(start_row=current_row, start_column=2, end_row=current_row, end_column=5)
        label_cell = ws.cell(row=current_row, column=2)
        label_cell.value = f"TOTAL {project['code']}"
        label_cell.font = total_font
        label_cell.alignment = Alignment(horizontal="right", vertical="center")
        label_cell.fill = total_fill

        # Fórmula SUM para Horas (col F)
        # Fórmula SUM para Horas (col G)
        sum_cell = ws.cell(row=current_row, column=7)
        sum_cell.value = f"=SUM(G{first_data_row}:G{last_data_row})"
        sum_cell.font = total_font
        sum_cell.alignment = data_alignment_right
        sum_cell.number_format = '#,##0.00'
        sum_cell.border = thin_border
        sum_cell.fill = total_fill

        # Fórmula SUM para Desplaz. (col H)
        travel_cell = ws.cell(row=current_row, column=8)
        travel_cell.value = f"=SUM(H{first_data_row}:H{last_data_row})"
        travel_cell.font = total_font
        travel_cell.alignment = data_alignment_right
        travel_cell.number_format = '#,##0.00'
        travel_cell.border = thin_border
        travel_cell.fill = total_fill

        # Fórmula SUM para Precio (col I)
        price_cell = ws.cell(row=current_row, column=9)
        price_cell.value = f"=SUM(I{first_data_row}:I{last_data_row})"
        price_cell.font = total_font
        price_cell.alignment = data_alignment_right
        price_cell.number_format = '#,##0.00'
        price_cell.border = thin_border
        price_cell.fill = total_fill
        
        # Columna de totales para KMs (col L)
        km_total_cell = ws.cell(row=current_row, column=12)
        km_total_cell.value = f"=SUM(L{first_data_row}:L{last_data_row})"
        km_total_cell.font = total_font
        km_total_cell.alignment = data_alignment_right
        km_total_cell.number_format = '#,##0.00'
        km_total_cell.border = thin_border
        km_total_cell.fill = total_fill

        current_row += 1

    # ── Configuración de impresión ──
    ws.sheet_properties.pageSetUpPr = None
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.print_options.horizontalCentered = True
    ws.oddHeader.center.text = "TimeFlow - Informe Diario de Horas por Proyecto"
    ws.oddFooter.right.text = "Página &P de &N"

    # Save to BytesIO stream
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()
