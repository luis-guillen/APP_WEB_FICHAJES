from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.security import get_password_hash

def get_user_by_employee_code(db: Session, employee_code: str) -> User | None:
    return db.query(User).filter(User.employee_code == employee_code).first()

def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> User:
    if get_user_by_employee_code(db, employee_code=user_in.employee_code):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee code already exists"
        )
    
    # Optional logic: force the role check
    allowed_roles = ["Proyectistas Mecánicos", "Proyectistas Eléctricos", "Programadores", "Montadores", "Management", "Admin"]
    if user_in.role not in allowed_roles:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role must be one of: {allowed_roles}"
        )

    db_user = User(
        employee_code=user_in.employee_code,
        name=user_in.name,
        home_location=user_in.home_location,
        role=user_in.role,
        is_admin=user_in.is_admin,
        password_hash=get_password_hash(user_in.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return True
