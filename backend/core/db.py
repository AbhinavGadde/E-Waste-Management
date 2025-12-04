from __future__ import annotations

from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

DB_PATH = Path("ewm.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"


class Base(DeclarativeBase):
    pass


engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Lazily import models to ensure metadata is complete
    from models import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _ensure_manager_column()
    _ensure_new_columns()
    # Ensure uploads directory exists
    Path("uploads").mkdir(parents=True, exist_ok=True)


def _ensure_new_columns() -> None:
    """Ensure new columns exist for backward compatibility"""
    with engine.connect() as conn:
        # Check and add user columns
        result = conn.execute(text("PRAGMA table_info(users)"))
        user_columns = [row[1] for row in result]
        if "level" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1"))
        if "total_co2_saved" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN total_co2_saved REAL DEFAULT 0.0"))
        if "total_items_recycled" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN total_items_recycled INTEGER DEFAULT 0"))
        if "badges" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN badges TEXT"))
        if "last_active" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_active DATETIME"))
        
        # Check and add report columns
        result = conn.execute(text("PRAGMA table_info(reports)"))
        report_columns = [row[1] for row in result]
        if "co2_saved" not in report_columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN co2_saved REAL DEFAULT 0.0"))
        if "points_awarded" not in report_columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN points_awarded INTEGER DEFAULT 0"))
        if "recycled_at" not in report_columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN recycled_at DATETIME"))
        
        # Check and add center columns
        result = conn.execute(text("PRAGMA table_info(recycler_centers)"))
        center_columns = [row[1] for row in result]
        if "total_recycled" not in center_columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN total_recycled INTEGER DEFAULT 0"))
        if "total_co2_saved" not in center_columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN total_co2_saved REAL DEFAULT 0.0"))
        if "rating" not in center_columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN rating REAL DEFAULT 0.0"))
        if "description" not in center_columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN description TEXT"))
        if "contact_info" not in center_columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN contact_info TEXT"))
        
        conn.commit()


def _ensure_manager_column() -> None:
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(recycler_centers)"))
        columns = [row[1] for row in result]
        if "manager_user_id" not in columns:
            conn.execute(text("ALTER TABLE recycler_centers ADD COLUMN manager_user_id INTEGER REFERENCES users(id)"))


