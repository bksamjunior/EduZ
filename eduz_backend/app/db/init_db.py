# eduz-backend/app/db/init_db.py

import os
import sys

# When executed directly from inside the `app/` folder, ensure the package parent is on sys.path
if __name__ == "__main__":
    parent = os.path.dirname(os.getcwd())
    if parent not in sys.path:
        sys.path.insert(0, parent)

from app.models import Base
from app.core.database import engine

def init_db():
    print("[INFO] Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("[INFO] Done.")
    
if __name__ == "__main__":
    init_db()
