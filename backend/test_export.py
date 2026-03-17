import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.services.report_service import generate_xlsx_export

db = SessionLocal()
try:
    data = generate_xlsx_export(db)
    print(f"Export successful. Length: {len(data)} bytes")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
