# Scripts de utilidad del backend

Carpeta de scripts auxiliares para desarrollo, mantenimiento y depuración.
**Estos scripts no forman parte del código de producción.**

## Estructura

### `seeds/`
Scripts para poblar la base de datos con datos de demostración o reales.

| Script | Descripción |
|--------|-------------|
| `seed_demo.py` | Genera datos de demostración genéricos |
| `seed_mango.py` | Importa datos reales del proyecto MANGO |
| `seed_project2_march.py` | Importa datos del Proyecto 2 de marzo |

**Uso:**
```bash
cd backend
python scripts/seeds/seed_demo.py
```

---

### `debug/`
Scripts de depuración e inspección del sistema. Solo para uso en desarrollo.

| Script | Descripción |
|--------|-------------|
| `debug_reports.py` | Depura la generación de informes |
| `inspect_db.py` | Inspecciona el estado de la base de datos |
| `repro_test.py` | Reproduce escenarios problemáticos |
| `test_export.py` | Prueba la lógica de exportación |
| `test_export_length.py` | Verifica el tamaño de los exports |
| `test_jose_jwt.py` | Prueba la librería JWT jose |

---

### `migrations/`
Scripts manuales de migración de datos (complementarios a Alembic).

| Script | Descripción |
|--------|-------------|
| `migrate_catalog.py` | Migración del catálogo de proyectos/tareas |
| `migrate_soft_delete.py` | Migración para añadir campos de soft-delete |

> Para migraciones estándar de esquema, usar Alembic: `alembic upgrade head`
