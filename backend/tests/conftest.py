import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from sqlalchemy import TypeDecorator, String
import json

class ArrayAsJSON(TypeDecorator):
    impl = String
    cache_ok = True
    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None
    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

import sqlalchemy.dialects.postgresql
sqlalchemy.dialects.postgresql.ARRAY = lambda x: ArrayAsJSON()

from app.main import app
from app.database.session import get_db
from app.models import Base
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.auth.security import get_password_hash
from datetime import date

# Usamos SQLite en memoria para tests ultra rápidos
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """
    Crea una nueva sesión para cada test. Se puede usar un Rollback si queremos
    aislar tests en BD físicas, pero como es en memoria, podemos simplemente
    reusar o borrar. Para mayor seguridad de aislamiento, podemos limpiar tablas.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def seed_tasks(db_session):
    tasks = [
        Task(code="111", name="Gestión Técnica Mecánica", category="Mechanical Engineering", requires_extra_fields=False, allowed_roles=[]),
        Task(code="115", name="Estudio", category="Mechanical Engineering", requires_extra_fields=False, allowed_roles=[]),
        Task(code="400", name="Viaje", category="Client Plant Activities", requires_extra_fields=True, allowed_roles=[]),
    ]
    db_session.add_all(tasks)
    db_session.commit()
    return tasks

@pytest.fixture(scope="function")
def admin_user(db_session):
    user = User(
        employee_code="admin99",
        name="Admin Test",
        role="Proyectistas Mecánicos",
        password_hash=get_password_hash("admin123"),
        is_admin=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def normal_user(db_session):
    user = User(
        employee_code="user01",
        name="User Test",
        role="Assemblers",
        password_hash=get_password_hash("user123"),
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def admin_client(db_session, admin_user):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    response = c.post(
        "/auth/login",
        data={"username": admin_user.employee_code, "password": "admin123"}
    )
    token = response.json().get("access_token")
    c.headers.update({"Authorization": f"Bearer {token}"})
    return c

@pytest.fixture(scope="function")
def user_client(db_session, normal_user):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    response = c.post(
        "/auth/login",
        data={"username": normal_user.employee_code, "password": "user123"}
    )
    token = response.json().get("access_token")
    c.headers.update({"Authorization": f"Bearer {token}"})
    return c

@pytest.fixture(scope="function")
def seed_projects(db_session):
    projects = [
        Project(code="P-STD", name="Standard Project", distance_from_workshop=10.0, start_date=date(2025, 1, 1), type="standard", is_active=True),
        Project(code="P-OFF", name="Offer Project", distance_from_workshop=0.0, start_date=date(2025, 2, 1), type="offer", is_active=True),
        Project(code="000", name="Non Productive", distance_from_workshop=0.0, start_date=date(2025, 1, 1), type="non-productive", is_active=True),
    ]
    db_session.add_all(projects)
    db_session.commit()
    for p in projects:
        db_session.refresh(p)
    return projects

