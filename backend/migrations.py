from sqlalchemy import inspect, text
from database import engine

def apply_lightweight_migrations(target_engine=None) -> None:
    """keep older garden.db files compatible without a full alembic setup.

    create_all only adds missing tables, never columns, so columns introduced
    after the first release are altered in place here. identifiers cannot be
    bound as sql parameters, so every statement below is a fixed literal that
    runs only when the inspected schema is missing that exact column.
    """
    eng = target_engine or engine
    inspector = inspect(eng)

    if not inspector.has_table("notes"):
        return

    columns = {c["name"] for c in inspector.get_columns("notes")}

    with eng.begin() as conn:
        if "user_id" not in columns:
            conn.execute(text(
                "ALTER TABLE notes ADD COLUMN user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE"
            ))
        if "mood_score" not in columns:
            conn.execute(text(
                "ALTER TABLE notes ADD COLUMN mood_score INTEGER"
            ))
