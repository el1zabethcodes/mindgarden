import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# resolve db path relative to this file
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "garden.db")
db_url = f"sqlite:///{db_path}"

# connect_args needed for sqlite thread safety
engine = create_engine(
    db_url, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# get db session context
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
