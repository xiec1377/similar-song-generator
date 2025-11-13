from fastapi import FastAPI
from sqlalchemy import text
from app.db.database import engine

app = FastAPI()


@app.on_event("startup")
def test_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connected successfully")
    except Exception as e:
        print("❌ Database connection failed:", e)
