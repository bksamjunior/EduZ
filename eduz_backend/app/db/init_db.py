# eduz-backend/app/db/init_db.py

from app.models import Base
from app.core.database import engine

def init_db():
    print("[INFO] Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("[INFO] Done.")
    
if __name__ == "__main__":
    init_db()
