# Memoria Técnica: TimeFlow (Sistema de Gestión de Tiempos)

## 1. Introducción y Objetivos
**TimeFlow** es una aplicación web integral diseñada para la imputación, seguimiento y análisis de horas de trabajo del personal de una empresa. Su objetivo principal es ofrecer una plataforma centralizada y eficiente donde los empleados puedan registrar las horas (normales y extras) dedicadas a diferentes proyectos y tareas, mientras que los administradores disponen de herramientas avanzadas para la gestión de usuarios, proyectos, análisis de datos (dashboards) y exportación de informes para integración con sistemas externos (como ERPs o nóminas).

## 2. Arquitectura del Sistema
El sistema sigue una arquitectura moderna **Cliente-Servidor (Frontend-Backend)**, comunicándose a través de una **API RESTFul** usando notación JSON. Esta separación (Decoupling) permite que la interfaz de usuario evolucione de manera independiente a la lógica de negocio y la persistencia de datos, posibilitando a futuro la creación de aplicaciones móviles nativas que consuman los mismos endpoints.

### 2.1 Backend (Servidor)
El núcleo lógico de la aplicación está construido con **Python 3** y el framework **FastAPI**.
*   **Gestión de Rutas y Controladores:** Se definen endpoints claros y documentados automáticamente mediante OpenAPI/Swagger.
*   **Validación de Datos:** Uso exhaustivo de **Pydantic** para definir esquemas y asegurar que los datos de entrada y salida cumplen los tipos y formatos correctos matemáticamente.
*   **ORM y Base de Datos:** **SQLAlchemy** se encarga de abstraer la base de datos subyacente (por defecto SQLite/PostgreSQL), mapeando tablas relacionales a objetos Python. La trazabilidad de migraciones se puede gestionar con `Alembic`.
*   **Seguridad:** Implementación de autenticación mediante Tokens **JWT (JSON Web Tokens)**, uniendo las contraseñas hasheadas en base de datos mediante librerías como `passlib` o `bcrypt`.

### 2.2 Frontend (Cliente)
La interfaz visual es una **Single Page Application (SPA)** construida con **React.js** y **TypeScript**.
*   **Empaquetador:** **Vite** proporciona un entorno de desarrollo ultrarrápido y realiza el build optimizado para producción.
*   **Estilos y Componentes:** Empleo de **Tailwind CSS** para utilidades atómicas y la biblioteca de componentes **Shadcn UI** (incluyendo Radix Primitives), lo cual garantiza componentes accesibles, modulares y de diseño atractivo.
*   **Gestión de Estado de Servidor:** Manejo de caché y sincronización asíncrona mediante **TanStack Query (React Query)**, reduciendo la recarga e incrementando el rendimiento percibido del sistema.
*   **Análisis Visual:** Gráficos estadísticos generados del lado del cliente utilizando **Recharts**.

## 3. Modelo de Datos Relacional
La base de datos relacional sostiene 4 entidades fundamentales:

1.  **Users (Usuarios):**
    *   Gestiona credenciales, correos electrónicos, estado de activación, nombres y código interno de empleado (`employee_code`).
    *   Establece el Nivel de Acceso mediante roles (ej. `USER` y `ADMIN`).
2.  **Projects (Proyectos):**
    *   Definidos por un Código exclusivo (ej. `PRJ-001`), un Nombre descriptivo y un estado de vigencia (Activo/Inactivo) para no entorpecer visuales anteriores.
3.  **Tasks (Tareas/Artículos):**
    *   Catálogo unificado de actividades que realiza la empresa.
    *   Contiene categoría, código de actividad (`code`) y nombre (`name`). Ejemplo: `111 - Gestión Técnica Mecánica`.
4.  **Time_entries (Entradas de Tiempo):**
    *   Es el corazón de la aplicación. Relaciona 1 Usuario, 1 Proyecto y 1 Tarea en una Fecha específica, registrando el número de `horas normales` y `horas extra`.

## 4. Estructura de Módulos y Funcionalidades

### 4.1 Módulo de Autenticación
*   **Login:** Punto de entrada seguro. El backend valida el email y contraseña contra la BD, devolviendo un esquema de Access Token (JWT).
*   **Autorización:** Todas las peticiones posteriores inyectan este JWT en la cabecera HTTP `Authorization: Bearer <token>`. El servidor decodifica y evalúa si el token no expira y si el `role` inyectado en el payload tiene niveles de permiso para la ruta (Dependencias de FastAPI `get_current_active_user`, `get_current_admin_user`).

### 4.2 Módulo del Empleado (Usuario Final)
*   **Dashboard Personal:** Visualización de sus imputaciones del día, de la semana y balance frente a las horas debidas.
*   **Imputación Continua:** Formulario rápido o de tabla para registrar horas escogiendo fecha, proyecto de la lista de proyectos activos, y la tarea desempeñada. Interfaz construida para ser "frictionless" (rápida carga del parte diario).

### 4.3 Módulo de Administración Integral
Accesible únicamente por roles `ADMIN`:
*   **Gestión del Setup empresarial:** Rutas CRUD completas (Crear, Leer, Modificar y Desactivar) para Empleados, Proyectos y el Catálogo de Tareas.
*   **Dashboard Estratégico:** Un panel analítico (`AdminDashboard.tsx`) con un motor de filtrado dependiente de cascada dinámica (Proyecto → Años Activos → Meses Activos) que evita las solicitudes vacías (zero-results query).
    *   Calcula de manera agregada (`func.sum` en BD) los volúmenes totales de horas ordinarias y extras.
    *   Sirve las métricas separándolas en visualizaciones de gráficos de barras para evaluar el peso de empleados en un proyecto.
*   **Motor de Informes y Exportación:** Vista dedicada para auditar cada movimiento línea por línea (`ReportsPage.tsx`).
    *   Implementa una lógica agresiva y estandarizada de contabilidad exportando el formato `.CSV / Excel`. La serialización agrupa datos por Proyecto y por Tarea específica devolviendo la suma total calculada desde la BD, adaptando los encabezados estrictamente a las exigencias operativas heredadas (`Cód. Empleado = num. de Tarea, Nombre, etc.`). Esta adaptación evita que los técnicos intermedios de administración tengan que procesar las hojas de cálculo manualmente.

## 5. Decisiones de Diseño y Buenas Prácticas
*   **Soft-Deletes (Bajas Lógicas):** Los proyectos, usuarios y tareas no se eliminan físicamente (Drop ROW), sino que se marcan como inactivos (propiedad `is_active=False`) para garantizar la total integridad referencial de los históricos de cobro y horas.
*   **TypeScript Estricto:** Previene todo un rango de vulnerabilidades e `undefined errors` definiendo en tiempo de desarrollo las Interfaces y Types (ej. `IUser`, `ITimeEntry`), logrando paridad entre los modelos Pydantic del backend y las definiciones visuales.
*   **Filtros de Consultas en Backend:** Para las áreas estadísticas pesadas, se evita enviar el volcado masivo por la red al cliente; en su lugar, se delega en la base de datos el cálculo (`GROUP BY`, `SUM()`), devolviendo únicamente los resúmenes financieros necesarios para popular tablas y exportaciones.
