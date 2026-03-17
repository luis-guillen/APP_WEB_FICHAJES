# Manual de Uso - Time Flow

**Time Flow** es una plataforma integral de control horario y gestión de proyectos diseñada específicamente para entornos industriales. Este documento explica cómo utilizar la aplicación tanto desde la perspectiva del Administrador como del Usuario (Empleado).

---

## 1. Acceso al Sistema

La pantalla de inicio de sesión cuenta con dos pestañas principales:

*   **Empleado:** Introduce tu nombre completo (exactamente como fue registrado) y tu contraseña personal.
*   **Administrador:** Acceso mediante la contraseña de gestión (por defecto: `admin123`).

> [!IMPORTANT]
> El nombre de usuario distingue entre mayúsculas y minúsculas. Debe coincidir exactamente con el nombre introducido por el administrador.

---

## 2. Guía para el Administrador

El administrador tiene control total sobre la configuración del sistema y la supervisión de datos.

### 📊 Panel de Control (Dashboard)
Muestra una visión global del estado de la empresa:
*   **Métricas en tiempo real:** Horas totales acumuladas, horas extra, número de empleados activos y proyectos en curso.
*   **Gráficos comparativos:** Visualización de la carga de trabajo por proyecto y por empleado para identificar cuellos de botella.

### 👥 Gestión de Usuarios
Permite dar de alta y baja al personal técnico. Al crear un usuario, es crítico asignar el **Rol** correcto:
1.  **Proyectistas Mecánicos:** Acceso a tareas de diseño 3D/2D y gestión mecánica.
2.  **Proyectistas Eléctricos:** Acceso a diseño eléctrico y gestión eléctrica.
3.  **Programadores:** Acceso a programación de PLC, Robots y puestas en marcha.
4.  **Montadores:** Acceso a tareas de taller y montaje en planta cliente.

### 📁 Gestión de Proyectos
Los proyectos se clasifican en tres tipos:
*   **Estándar:** Proyectos normales de ejecución.
*   **Preparación de Oferta:** Proyectos específicos para licitaciones (asignan automáticamente la tarea de estudio).
*   **No Productivo (Código 000):** Para formación, reuniones o mantenimiento interno.

> [!TIP]
> Puedes asignar usuarios específicos a cada proyecto. Solo los usuarios asignados verán el proyecto en su lista de registro (excepto los "No Productivos", que son visibles para todos).

### 📈 Informes y Exportación
*   **Tabla de Informes:** Vista detallada de cada entrada de tiempo con filtros por fecha y empleado.
*   **Exportar a Excel:** Descarga un archivo CSV compatible con Excel/Sheets que cumple con el formato oficial para auditorías y control de costes.

---

## 3. Guía para el Usuario (Empleado)

La interfaz de usuario está optimizada para ser rápida y sencilla, permitiendo el registro de horas en pocos segundos desde el móvil o el ordenador.

### ⏱️ Registro de Horas (Flujo de 7 Pasos)
El sistema guía al empleado a través de un asistente:
1.  **Seleccionar Proyecto:** Elige el proyecto en el que has trabajado.
2.  **Seleccionar Rol:** Confirma tu función en ese momento (esto filtra las tareas que verás a continuación).
3.  **Seleccionar Fecha:** Por defecto es el día actual.
4.  **¿Festivo?:** Marca esta opción si corresponde a un día no laborable trabajado.
5.  **Seleccionar Tarea:** Escoge la actividad específica realizada.
6.  **Horas Trabajadas:** Introduce la duración (ej: 8 o 4.5).
7.  **Horas Extra:** Registra el tiempo adicional si aplica.

### 🏗️ Trabajos en Planta Cliente (Tareas 4XX)
Si seleccionas una tarea que comienza por **4**, el sistema solicitará datos adicionales obligatorios para la gestión de dietas y desplazamientos:
*   **Vehículo:** Personal o de Empresa.
*   **Dieta:** Indica si has realizado gasto de comida.
*   **Origen del desplazamiento:** Cálculo de distancia desde tu domicilio o desde el taller.

### 💼 Mis Proyectos e Historial
*   **Mis Proyectos:** Consulta la ubicación y detalles de los proyectos donde estás asignado.
*   **Historial:** Revisa y verifica tus fichajes pasados para asegurar que no falta ningún registro.
*   **Estadísticas:** Gráficos personales que muestran cómo distribuyes tu tiempo entre diferentes proyectos y tareas.

---

## 4. Catálogo de Tareas (Referencia Rápida)

| Código | Categoría | Ejemplo de Tareas | Roles Sugeridos |
| :--- | :--- | :--- | :--- |
| **11X** | Oficina Mecánica | Diseño 3D, 2D, Gestión | Proyectistas Mecánicos |
| **12X** | Oficina Eléctrica | Diseño Eléctrico, Programación PLC | Proyectistas Eléctricos, Programadores |
| **2XX** | Materiales | Compra de comerciales y materia prima | Todos |
| **3XX** | Taller | Fabricación, Metrología, Montaje | Montadores |
| **4XX** | Planta Cliente | Instalación, Puesta en marcha en cliente | Montadores, Programadores |

---
*Manual generado el 06/03/2026 para la plataforma Time Flow.*
