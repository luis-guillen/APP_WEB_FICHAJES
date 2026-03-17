# Time Flow - Backend

Backend de Control Horario creado con FastAPI, PostgreSQL y SQLAlchemy.

## 🚀 Requisitos

- Python 3.12+
- PostgreSQL (Base de datos)

## 🛠️ Configuración Local

1. **Crear base de datos PostgreSQL**  
   Crea una base de datos local llamada `timeflow`. (Opcionalmente, puedes usar DBeaver o pgAdmin).

2. **Entorno Virtual e Instalación**  
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Variables de Entorno**  
   Hay un archivo llamdo `.env.example`. Cópialo a `.env` y configura el `DATABASE_URL` para que coincida con tus credenciales de PostgreSQL.
   ```bash
   cp .env.example .env
   # Edita el DATABASE_URL si es necesario
   ```

## 🗄️ Migraciones de Base de Datos (Alembic)

Para sincronizar la base de datos con los modelos, ejecuta:
```bash
alembic upgrade head
```

## ▶️ Ejecutar el Servidor

```bash
uvicorn app.main:app --reload
```
El servidor estará accesible en: `http://127.0.0.1:8000`

## 📚 Documentación Interactiva (Swagger)
Accede a la interfaz Swagger UI en: `http://127.0.0.1:8000/docs`

## 🔐 Pruebas y Uso (Fase 4 - Auth & Users)

1. **Crear el primer administrador (Vía Base de datos directa o API en Dev)**  
   Dado que actualmente `POST /users` requiere permisos de admin (`require_admin`), el primer administrador debe crearse directamente en la tabla `users` mediante SQL, o temporalmente remover el `Depends(require_admin)` de `POST /users` para crear el usuario "semilla".

   *Semilla en SQL:*
   ```sql
   INSERT INTO users (id, employee_code, name, role, password_hash, is_admin)
   VALUES ('uuid-aqui', 'admin', 'Administrador', 'Admin', '$2b$12$R.P9T23XjU0kE1i51X2vIe0mK1mPOr0XpU49mBx1tA3SXZmG1M1Lq', true);
   ```
   *(La password del hash superior equivale a "admin123").*

2. **Login (Obtener JWT)**  
   Usa el endpoint `POST /auth/login` introduciendo `employee_code` y `password` en Content-Type `application/x-www-form-urlencoded` (Swagger Login Authorize). Obtendrás un token Bearer.

3. **Gestión de Usuarios**  
   Habiendo obtenido el Token, adjúntalo al Header y ya puedes consumir `GET /users`, `POST /users` y `DELETE /users/{id}` (Swagger lo hace automáticamente al logarte en la página de docs).
