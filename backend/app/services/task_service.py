from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskResponse

def list_tasks(db: Session, skip: int = 0, limit: int = 100) -> list[Task]:
    return db.query(Task).offset(skip).limit(limit).all()

def seed_default_tasks(db: Session):
    if db.query(Task).first():
        return
        
    default_tasks = [
        {"code": "111", "name": "Technical mechanical management", "category": "Mechanical Engineering", "allowed_roles": ["Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "112", "name": "3D design", "category": "Mechanical Engineering", "allowed_roles": ["Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "113", "name": "2D design", "category": "Mechanical Engineering", "allowed_roles": ["Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "114", "name": "Mechanical documentation", "category": "Mechanical Engineering", "allowed_roles": ["Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "115", "name": "Offer study", "category": "Mechanical Engineering", "allowed_roles": ["Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "121", "name": "Technical electrical management", "category": "Electrical Engineering", "allowed_roles": ["Electrical Engineers"], "requires_extra_fields": False},
        {"code": "122", "name": "Electrical design", "category": "Electrical Engineering", "allowed_roles": ["Electrical Engineers"], "requires_extra_fields": False},
        {"code": "123", "name": "PLC programming offline", "category": "Programmers", "allowed_roles": ["Electrical Engineers", "Programmers"], "requires_extra_fields": False},
        {"code": "124", "name": "Robot programming offline", "category": "Programmers", "allowed_roles": ["Electrical Engineers", "Programmers"], "requires_extra_fields": False},
        {"code": "311", "name": "Manufacturing", "category": "Workshop", "allowed_roles": ["Assemblers"], "requires_extra_fields": False},
        {"code": "312", "name": "Metrology", "category": "Workshop", "allowed_roles": ["Assemblers", "Mechanical Engineers"], "requires_extra_fields": False},
        {"code": "313", "name": "Assembly and parts preparation", "category": "Workshop", "allowed_roles": ["Assemblers"], "requires_extra_fields": False},
        {"code": "321", "name": "Electrical cabinets and boxes", "category": "Workshop", "allowed_roles": ["Electrical Engineers", "Assemblers"], "requires_extra_fields": False},
        {"code": "322", "name": "Electrical assembly and installation", "category": "Workshop", "allowed_roles": ["Electrical Engineers", "Assemblers"], "requires_extra_fields": False},
        {"code": "411", "name": "Assembly and commissioning at client", "category": "Client", "allowed_roles": ["Mechanical Engineers", "Assemblers"], "requires_extra_fields": True},
        {"code": "421", "name": "Electrical installation at client", "category": "Client", "allowed_roles": ["Electrical Engineers", "Assemblers"], "requires_extra_fields": True},
        {"code": "422", "name": "Fluid installation at client", "category": "Client", "allowed_roles": ["Electrical Engineers", "Mechanical Engineers"], "requires_extra_fields": True},
        {"code": "431", "name": "PLC and software commissioning", "category": "Client", "allowed_roles": ["Electrical Engineers", "Programmers"], "requires_extra_fields": True},
        {"code": "432", "name": "Robot commissioning", "category": "Client", "allowed_roles": ["Electrical Engineers", "Programmers"], "requires_extra_fields": True},
        {"code": "433", "name": "Client training", "category": "Client", "allowed_roles": ["Mechanical Engineers", "Electrical Engineers", "Programmers"], "requires_extra_fields": True},
    ]
    
    for t in default_tasks:
        db_task = Task(**t)
        db.add(db_task)
    db.commit()
