from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator

class TagBase(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True

class TagCreate(BaseModel):
    name: str
    color: Optional[str] = "slate"

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        # trim and lowercase
        return v.strip().lower()

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = ""
    status: Optional[str] = "seed"  # "seed" | "growing" | "evergreen"
    mood_color: Optional[str] = "slate"
    is_favorite: Optional[bool] = False

class NoteCreate(NoteBase):
    tags: Optional[List[str]] = []
    linked_note_ids: Optional[List[str]] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    mood_color: Optional[str] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None
    linked_note_ids: Optional[List[str]] = None

class NoteOut(NoteBase):
    id: str
    created_at: datetime
    updated_at: datetime
    tags: List[TagBase] = []
    linked_note_ids: List[str] = []

    class Config:
        from_attributes = True
