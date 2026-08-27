from contextlib import asynccontextmanager
from datetime import date
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from auth import router as auth_router, get_optional_user
from database import engine, Base, get_db
from migrations import apply_lightweight_migrations

# skip alembic, create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # create all database tables, then patch columns on older database files
    Base.metadata.create_all(bind=engine)
    apply_lightweight_migrations(engine)
    yield

app = FastAPI(
    title="Mindgarden API",
    description="Backend for the calm Mindgarden knowledge base",
    lifespan=lifespan
)

# setup cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

def make_note_response(db: Session, db_note: models.Note) -> schemas.NoteOut:
    linked_ids = crud.get_linked_note_ids(db, db_note.id)
    return schemas.NoteOut(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        status=db_note.status,
        mood_color=db_note.mood_color,
        mood_score=db_note.mood_score,
        is_favorite=db_note.is_favorite,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at,
        tags=[schemas.TagBase.model_validate(t) for t in db_note.tags],
        linked_note_ids=linked_ids
    )

@app.get("/api/notes", response_model=List[schemas.NoteOut])
def read_notes(
    search: Optional[str] = Query(None, description="search in title or content"),
    status: Optional[str] = Query(None, description="filter by status seed/growing/evergreen"),
    tag: Optional[str] = Query(None, description="filter by tag name"),
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    # token bearers only see their own garden; anonymous visitors keep the shared one
    notes = crud.get_notes(
        db,
        search=search,
        status=status,
        tag=tag,
        user_id=current_user.id if current_user else None,
    )
    return [make_note_response(db, n) for n in notes]

@app.get("/api/feed", response_model=schemas.NotesPage)
def read_feed(
    limit: int = Query(12, ge=1, le=100, description="page size"),
    offset: int = Query(0, ge=0, description="skip count"),
    search: Optional[str] = Query(None, description="search in title or content"),
    status: Optional[str] = Query(None, description="filter by status seed/growing/evergreen"),
    tag: Optional[str] = Query(None, description="filter by tag name"),
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    # paginated garden feed; /api/notes stays as the unpaginated legacy list
    user_id = current_user.id if current_user else None
    total = crud.count_notes(db, search=search, status=status, tag=tag, user_id=user_id)
    notes = crud.get_notes(db, search=search, status=status, tag=tag, user_id=user_id, limit=limit, offset=offset)
    return schemas.NotesPage(
        items=[make_note_response(db, n) for n in notes],
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )

@app.get("/api/notes/{note_id}", response_model=schemas.NoteOut)
def read_note(note_id: str, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return make_note_response(db, db_note)

@app.post("/api/notes", response_model=schemas.NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    note: schemas.NoteCreate,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    db_note = crud.create_note(db, note, owner=current_user)
    return make_note_response(db, db_note)

@app.put("/api/notes/{note_id}", response_model=schemas.NoteOut)
def update_note(note_id: str, note: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = crud.update_note(db, note_id, note)
    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return make_note_response(db, db_note)

@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: Session = Depends(get_db)):
    success = crud.delete_note(db, note_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return None

@app.get("/api/tags", response_model=List[schemas.TagBase])
def read_tags(db: Session = Depends(get_db)):
    tags = crud.get_tags(db)
    return [schemas.TagBase.model_validate(t) for t in tags]

@app.post("/api/mood", response_model=schemas.MoodEntryOut, status_code=status.HTTP_201_CREATED)
def log_mood(
    entry_in: schemas.MoodEntryIn,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    gardener = current_user or crud.get_or_create_demo_user(db)
    return crud.upsert_mood_entry(db, gardener, entry_in)

@app.get("/api/mood", response_model=List[schemas.MoodEntryOut])
def read_mood(
    days: int = Query(30, ge=1, le=365, description="how many days back to fetch"),
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    gardener = current_user or crud.get_or_create_demo_user(db)
    return crud.get_mood_entries(db, gardener.id, days=days)

@app.get("/api/habits", response_model=List[schemas.HabitOut])
def read_habits(
    include_archived: bool = Query(False, description="also show paused habits"),
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    gardener = current_user or crud.get_or_create_demo_user(db)
    habits = crud.get_habits(db, gardener.id, include_archived=include_archived)
    return [crud.build_habit_out(db, h) for h in habits]

@app.post("/api/habits", response_model=schemas.HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit_in: schemas.HabitCreate,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    gardener = current_user or crud.get_or_create_demo_user(db)
    habit = crud.create_habit(db, gardener, habit_in)
    return crud.build_habit_out(db, habit)

@app.put("/api/habits/{habit_id}", response_model=schemas.HabitOut)
def update_habit(
    habit_id: str,
    habit_in: schemas.HabitUpdate,
    db: Session = Depends(get_db)
):
    habit = crud.update_habit(db, habit_id, habit_in)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return crud.build_habit_out(db, habit)

@app.delete("/api/habits/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: str, db: Session = Depends(get_db)):
    success = crud.delete_habit(db, habit_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return None

@app.post("/api/habits/{habit_id}/check-in", response_model=schemas.HabitCheckinOut)
def check_in_habit(
    habit_id: str,
    day: Optional[str] = Query(None, description="YYYY-MM-DD, defaults to today"),
    db: Session = Depends(get_db)
):
    habit = crud.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    log_date = None
    if day:
        try:
            log_date = date.fromisoformat(day)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="day must be YYYY-MM-DD")

    log = crud.check_in_habit(db, habit, log_date)
    log_dates = {entry.log_date for entry in habit.logs}
    return schemas.HabitCheckinOut(
        habit_id=habit.id,
        log_date=log.log_date,
        current_streak=crud.calculate_streak(log_dates),
    )
