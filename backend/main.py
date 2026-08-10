from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import engine, Base, get_db

# skip alembic, create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # create all database tables
    Base.metadata.create_all(bind=engine)
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

def make_note_response(db: Session, db_note: models.Note) -> schemas.NoteOut:
    linked_ids = crud.get_linked_note_ids(db, db_note.id)
    return schemas.NoteOut(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        status=db_note.status,
        mood_color=db_note.mood_color,
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
    db: Session = Depends(get_db)
):
    notes = crud.get_notes(db, search=search, status=status, tag=tag)
    return [make_note_response(db, n) for n in notes]

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
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = crud.create_note(db, note)
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
