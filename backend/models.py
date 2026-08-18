from datetime import datetime
import uuid
from sqlalchemy import Table, Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, default="")
    # bcrypt digest, never the raw password
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    notes = relationship("Note", back_populates="owner")

# association table for notes and tags
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", String, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# association table for bidirectional note links
note_links = Table(
    "note_links",
    Base.metadata,
    Column("source_id", String, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("target_id", String, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
)

class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(String, default="")
    status = Column(String, default="seed")  # "seed" | "growing" | "evergreen"
    mood_color = Column(String, default="slate")
    is_favorite = Column(Boolean, default=False)
    # nullable until every note belongs to a registered gardener
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    owner = relationship("User", back_populates="notes")
    
    # bidirectional note links
    # we represent links as entries in note_links.
    # to find links, we will fetch matching rows in helper methods or relationships.
    links = relationship(
        "Note",
        secondary=note_links,
        primaryjoin=id == note_links.c.source_id,
        secondaryjoin=id == note_links.c.target_id,
        backref="linked_to"
    )

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True) # slugified/normalized name
    name = Column(String, nullable=False, unique=True)
    color = Column(String, default="slate")

    notes = relationship("Note", secondary=note_tags, back_populates="tags")
