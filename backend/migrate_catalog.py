import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.task import Task
from app.models.user import User
from app.models.time_entry import TimeEntry

# The new task definitions from constants.ts directly translated
NEW_TASKS = [
    {"code": "111", "name": "Gestión Técnica Mecánica", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS MECÁNICOS"]},
    {"code": "112", "name": "Diseño 3D", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS MECÁNICOS"]},
    {"code": "113", "name": "Diseño 2D", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS MECÁNICOS"]},
    {"code": "114", "name": "Documentación Mecánica", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS MECÁNICOS"]},
    {"code": "115", "name": "Estudio ofertas", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS MECÁNICOS"]},

    {"code": "121", "name": "Gestión Técnica Eléctrica", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS ELECTRICOS"]},
    {"code": "122", "name": "Diseño Eléctrico", "category": "OFICINA TECNICA", "allowed_roles": ["PROYECTISTAS ELECTRICOS"]},

    {"code": "123", "name": "Programación PLC Off-line", "category": "OFICINA TECNICA", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "124", "name": "Programación Robot OffLine", "category": "OFICINA TECNICA", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "125", "name": "PeM PLC Newval", "category": "OFICINA TECNICA", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "126", "name": "PeM Robot Newval", "category": "OFICINA TECNICA", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "127", "name": "Doc. Eléctrica y Manuales", "category": "OFICINA TECNICA", "allowed_roles": ["PROGRAMADORES"]},

    {"code": "313", "name": "Montaje y PaP", "category": "TALLER NEWAL", "allowed_roles": ["MONTADORES"]},
    {"code": "321", "name": "Armarios y cajas", "category": "TALLER NEWAL", "allowed_roles": ["MONTADORES"]},
    {"code": "322", "name": "Montaje e inst. Electrica", "category": "TALLER NEWAL", "allowed_roles": ["MONTADORES"]},

    {"code": "411", "name": "Montaje y PeM Cliente", "category": "PLANTA CLIENTE", "allowed_roles": ["MONTADORES"]},
    {"code": "421", "name": "Montaje e Inst. Elec. PeM Cli", "category": "PLANTA CLIENTE", "allowed_roles": ["MONTADORES"]},
    {"code": "422", "name": "Montaje e Inst. Flu. PeM Client", "category": "PLANTA CLIENTE", "allowed_roles": ["MONTADORES"]},

    {"code": "431", "name": "PeM y Soft Cliente", "category": "PLANTA CLIENTE", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "432", "name": "PeM Robot Cliente", "category": "PLANTA CLIENTE", "allowed_roles": ["PROGRAMADORES"]},
    {"code": "433", "name": "Formación PeM Cliente", "category": "PLANTA CLIENTE", "allowed_roles": ["PROGRAMADORES"]},
]

NEW_CODES_LIST = [t["code"] for t in NEW_TASKS]

db = SessionLocal()
try:
    print("Beginning catalog migration...")
    
    # We must handle data integrity. If there are existing TimeEntries for tasks that are going to be deleted...
    # The clean way is to un-assign the task_id or map them, but SQLite FKs might throw. 
    # Since this is a hard structure overwrite request, we check if we can safely just delete `Task` records.
    # We keep tasks that already have entries if they share the same new code, otherwise we delete unused ones.
    
    existing_tasks = db.query(Task).all()
    
    codes_in_db = {t.code for t in existing_tasks}
    
    for old_task in existing_tasks:
        if old_task.code not in NEW_CODES_LIST:
            # Check if this task has time entries
            count = db.query(TimeEntry).filter(TimeEntry.task_id == old_task.id).count()
            if count == 0:
                print(f"Deleting unused legacy task: [{old_task.code}] {old_task.name}")
                db.delete(old_task)
            else:
                print(f"WARNING: Legacy task [{old_task.code}] {old_task.name} has {count} time entries attached. Cannot delete physical row to preserve hour records. Marking as category 'LEGACY'.")
                old_task.category = "LEGACY (INACTIVO)"
                old_task.allowed_roles = []
    
    db.commit()

    print("Inserting/Updating new matrix tasks...")
    for tdata in NEW_TASKS:
        existing = db.query(Task).filter(Task.code == tdata["code"]).first()
        if existing:
            existing.name = tdata["name"]
            existing.category = tdata["category"]
            existing.allowed_roles = tdata["allowed_roles"]
        else:
            new_t = Task(
                code=tdata["code"],
                name=tdata["name"],
                category=tdata["category"],
                allowed_roles=tdata["allowed_roles"]
            )
            db.add(new_t)
            
    db.commit()
    print("Task catalog rebuilt successfully.")
    
    print("Normalizing User Roles...")
    # Any user not in the new role list (e.g. they had "Proyectistas Mecánicos" instead of uppercase "PROYECTISTAS MECÁNICOS") gets updated
    ROLE_MAP = {
        "Proyectistas Mecánicos": "PROYECTISTAS MECÁNICOS",
        "Proyectistas Eléctricos": "PROYECTISTAS ELECTRICOS",
        "Programadores": "PROGRAMADORES",
        "Montadores": "MONTADORES",
    }
    users = db.query(User).filter(User.is_admin == False).all()
    for u in users:
        if u.role in ROLE_MAP:
            u.role = ROLE_MAP[u.role]
        elif u.role not in ROLE_MAP.values():
            print(f"WARNING: User '{u.name}' has unmapped role '{u.role}'. Resetting to 'MONTADORES' as safe fallback (must reassign via Admin).")
            u.role = "MONTADORES" 
            
    db.commit()
    print("Migration complete!")
except Exception as e:
    db.rollback()
    print("Error during migration:")
    import traceback
    traceback.print_exc()
finally:
    db.close()
