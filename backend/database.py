from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# db path
db_url = "sqlite:///./garden.db"

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
