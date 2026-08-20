from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator
import re

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    display_name: Optional[str] = ""

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-z0-9_-]{3,24}$", v):
            raise ValueError("username must be 3-24 characters: letters, digits, _ or -")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("email format is not valid")
        return v

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

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
    mood_score: Optional[int] = None  # 1 (wilting) to 10 (blooming)

    @field_validator("mood_score")
    @classmethod
    def check_mood_score(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not 1 <= v <= 10:
            raise ValueError("mood_score must be between 1 and 10")
        return v
    is_favorite: Optional[bool] = False

class NoteCreate(NoteBase):
    tags: Optional[List[str]] = []
    linked_note_ids: Optional[List[str]] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    mood_color: Optional[str] = None
    mood_score: Optional[int] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None
    linked_note_ids: Optional[List[str]] = None

    @field_validator("mood_score")
    @classmethod
    def check_mood_score(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not 1 <= v <= 10:
            raise ValueError("mood_score must be between 1 and 10")
        return v

class NoteOut(NoteBase):
    id: str
    created_at: datetime
    updated_at: datetime
    tags: List[TagBase] = []
    linked_note_ids: List[str] = []

    class Config:
        from_attributes = True
