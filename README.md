# Time Flow - Plataforma de Control Horario

Sistema integral de registro horario y gestión de proyectos, diseñado para empresas industriales. Separa flujos de trabajo en paneles de administración avanzados y experiencias móviles simplificadas para operarios, conectando la actividad del personal a proyectos, licitaciones e I+D con cálculos de rentabilidad automáticos.

## Stack Tecnológico

**Frontend (Cliente Web):**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI (Componentes Radix)
- React Router DOM
- TanStack Query (React Query)
- Vitest & Playwright (Testing)

**Backend (API Rest):**
- Python 3.12
- FastAPI
- SQLAlchemy (ORM)
- Alembic (Migraciones)
- PostgreSQL (Producción) / SQLite (Testing)
- Pydantic
- Pytest (Testing)

---

## 🚀 Despliegue Rápido (Entorno Demo)

Para ver la aplicación funcionando rápidamente sin configurar bases de datos externas, hemos suministrado un **Script de Auto-arranque** que levanta ambos servidores (Frontend y Backend en memoria) y los llena de datos de prueba.

### Requisitos Previos:
- Node.js y npm instalados.
- Python 3.10+ instalado.
- Dependencias de Python (`backend/venv` con `requirements.txt`).

### Ejecución:

Desde la raíz del proyecto, simplemente ejecuta:

```bash
./start_all.sh
```

El script se encargará de:
1. Crear una base de datos local SQLite.
2. Inyectar (sembrar) los usuarios demo, tareas, proyectos y fichajes horarios aleatorios para rellenar las métricas de los últimos 10 días.
3. Levantar la API FastAPI en `http://localhost:8000`.
4. Levantar la UI React en `http://localhost:8080`.

Para detener ambos servidores, simplemente pulsa `Ctrl + C` en esa misma terminal.

---

## 👥 Cuentas Demo Generadas

Una vez que arranques el script `./start_all.sh` y abras `http://localhost:8080`, puedes probar la aplicación usando los siguientes perfiles generados dinámicamente:

### 👑 Panel de Administración
*Control total sobre proyectos, creación de usuarios, reportes y exportación.*

| Usuario | Contraseña | Nombre       | Rol        |
|---------|------------|--------------|------------|
| `ADMIN` | `admin123` | Super Admin  | Management |

### 👷 Empleados Reales (seed_mango.py — proyecto MANGO / PRJ-002)
*Contraseña por defecto: `1234` para todos.*

| Usuario | Contraseña | Nombre           | Rol                      |
|---------|------------|------------------|--------------------------|
| `1001`  | `1234`     | Antonio Merino   | Proyectistas Mecánicos   |
| `1002`  | `1234`     | Gemma            | Proyectistas Eléctricos  |
| `1003`  | `1234`     | Antonio Silva    | Programadores            |
| `1004`  | `1234`     | Ernesto Soriano  | Proyectistas Mecánicos   |
| `1005`  | `1234`     | Kevin Soriano    | Proyectistas Eléctricos  |
| `1006`  | `1234`     | Pablo Cabaleiro  | Programadores            |
| `1007`  | `1234`     | CATHAYSA         | Montadores               |
| `1008`  | `1234`     | Arnau            | Montadores               |

### 👷 Perfiles de Empleado Demo (seed_demo.py)
*Panel simplificado para registrar horas. Las tareas mostradas dependen de los permisos de su Rol.*

| Usuario   | Contraseña | Nombre           | Rol                      |
|-----------|------------|------------------|--------------------------|
| `USER001` | `user001`  | Empleado Demo 1  | Proyectistas Mecánicos   |
| `USER002` | `user002`  | Empleado Demo 2  | Proyectistas Eléctricos  |
| `USER003` | `user003`  | Empleado Demo 3  | Programadores            |
| `USER004` | `user004`  | Empleado Demo 4  | Montadores               |

---

## 🛡️ Estructura del Proyecto

```text
time-flow-main/
├── backend/                  # Servidor API FastAPI
│   ├── app/                  # Código fuente Backend
│   │   ├── auth/             # Dependencias JWT, Hashing
│   │   ├── config/           # Variables de entorno
│   │   ├── database/         # Motor de DB Local/Prod
│   │   ├── models/           # Esquemas SQLAlchemy (DB)
│   │   ├── routers/          # Controladores Endpoints (/users, /auth, etc)
│   │   ├── schemas/          # Control de Vistas/DTO (Pydantic)
│   │   └── services/         # Lógica de Negocio, validaciones exclusivas
│   ├── tests/                # Suites de Pruebas Pytest (Aislamiento backend)
│   ├── alembic/              # Generador de migraciones ORM
│   ├── main.py               # Entrypoint Uvicorn
│   └── seed_demo.py          # Script de auto-generación poblacional
│
├── src/                      # Cliente SPA UI React
│   ├── components/           # Componentes de UI genéricos e interfaces web
│   ├── contexts/             # Aislamiento de Estado (SessionStorage/Auth)
│   ├── data/                 # Enums y Constantes nativos
│   ├── hooks/                # Custom hooks (e.g. validaciones móviles)
│   ├── pages/                # Vistas enrutadas (Admin Dashboard, Log Hours...)
│   ├── services/             # Wrapper API Fetch (Comunicación con Backend)
│   └── test/                 # Component Testing mediante Vitest / Testing Library
│
├── e2e/                      # Suites Playwright (Flujos Dorados Simulados End-To-End)
├── package.json
└── start_all.sh              # Macro-script de Demostración
```

---

## ✅ Quality Assurance y Testing

El proyecto ha superado una Fase de QA profunda mediante pruebas unitarias, de integración y End-to-End.

### Backend (Pytest)
```bash
cd backend && pytest tests/ -v
```
Comprueba el enrutado, los servicios internos, la autenticación JWT y decenas de Edge Cases en la base de datos (rechazos por falta de asignaciones, restricciones de límite de hora, fallos intencionales RBAC 403).

### Frontend Componentes (Vitest)
```bash
npm run test
```
Renderiza el Virtual DOM de React en JSDom comprobando que los validadores de formularios, las notificaciones Toast y las bifurcaciones lógicas de renderizado condicional operen a la perfección con librerías pesadas como Radix UI.

### Flujos Simulación E2E (Playwright)
```bash
npx playwright test
```
Dos workflows dorados de extremo a extremo automatizados visualmente:
- Secuencia *Admin*: Login administrativo > Crea Usuario > Crea Proyecto > Asigna Proyecto.
- Secuencia *User*: Login de operario > Atraviesa Wizard de Fichaje Dinámico > Recibe comprobante de registro horario.

---
## Licencia
Uso Privativo Comercial - Todos Los Derechos Reservados.
