import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
import schemas

# helper to slugify tag names
def slugify(text: str) -> str:
    # lowercase, replace spaces/special chars with hyphens
    s = text.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "-", s)
    return s.strip("-")

# helper to get a random mood color for tag
def get_tag_color(tag_name: str) -> str:
    colors = ["sage", "mint", "slate", "lavender_cool", "peach", "rose"]
    # consistent color choice based on hash of tag name
    idx = sum(ord(c) for c in tag_name) % len(colors)
    return colors[idx]

def get_tag_by_id(db: Session, tag_id: str):
    return db.query(models.Tag).filter(models.Tag.id == tag_id).first()

def get_or_create_tag(db: Session, tag_name: str) -> models.Tag:
    tag_id = slugify(tag_name)
    if not tag_id:
        tag_id = "general"
        tag_name = "general"
        
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        tag = models.Tag(id=tag_id, name=tag_name.strip(), color=get_tag_color(tag_id))
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag

def get_linked_note_ids(db: Session, note_id: str) -> List[str]:
    # find all links involving this note
    rows = db.query(models.note_links).filter(
        or_(models.note_links.c.source_id == note_id, models.note_links.c.target_id == note_id)
    ).all()
    
    linked_ids = []
    for r in rows:
        if r.source_id == note_id:
            linked_ids.append(r.target_id)
        else:
            linked_ids.append(r.source_id)
    return list(set(linked_ids))

def set_note_links(db: Session, note_id: str, linked_ids: List[str]):
    # delete old links involving this note
    db.execute(
        models.note_links.delete().where(
            or_(models.note_links.c.source_id == note_id, models.note_links.c.target_id == note_id)
        )
    )
    
    # insert new ones (bidirectional min/max helper)
    added = set()
    for l_id in linked_ids:
        if l_id == note_id:
            continue
        # verify the target note exists before linking
        target_exists = db.query(models.Note.id).filter(models.Note.id == l_id).first()
        if not target_exists:
            continue
            
        s = min(note_id, l_id)
        t = max(note_id, l_id)
        pair = (s, t)
        
        if pair not in added:
            db.execute(models.note_links.insert().values(source_id=s, target_id=t))
            added.add(pair)
    db.commit()

def get_notes(db: Session, search: Optional[str] = None, status: Optional[str] = None, tag: Optional[str] = None):
    query = db.query(models.Note)
    
    if status:
        query = query.filter(models.Note.status == status)
        
    if tag:
        tag_id = slugify(tag)
        query = query.filter(models.Note.tags.any(models.Tag.id == tag_id))
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Note.title.like(search_filter),
                models.Note.content.like(search_filter)
            )
        )
        
    # sort by last tended/updated_at descending
    return query.order_by(models.Note.updated_at.desc()).all()

def get_note(db: Session, note_id: str):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def create_note(db: Session, note_in: schemas.NoteCreate) -> models.Note:
    # create db note
    db_note = models.Note(
        title=note_in.title,
        content=note_in.content,
        status=note_in.status,
        mood_color=note_in.mood_color,
        is_favorite=note_in.is_favorite
    )
    
    # handle tags
    if note_in.tags:
        tags = [get_or_create_tag(db, t) for t in note_in.tags if t.strip()]
        db_note.tags = tags
        
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # handle links
    if note_in.linked_note_ids:
        set_note_links(db, db_note.id, note_in.linked_note_ids)
        
    return db_note

def update_note(db: Session, note_id: str, note_in: schemas.NoteUpdate) -> Optional[models.Note]:
    db_note = get_note(db, note_id)
    if not db_note:
        return None
        
    # update fields
    update_data = note_in.model_dump(exclude_unset=True)
    
    # handle tags separately
    if "tags" in update_data:
        tags_list = update_data.pop("tags")
        if tags_list is not None:
            db_note.tags = [get_or_create_tag(db, t) for t in tags_list if t.strip()]
            
    # handle links separately
    links_list = None
    if "linked_note_ids" in update_data:
        links_list = update_data.pop("linked_note_ids")
        
    for key, val in update_data.items():
        setattr(db_note, key, val)
        
    db.commit()
    db.refresh(db_note)
    
    if links_list is not None:
        set_note_links(db, db_note.id, links_list)
        
    return db_note

def delete_note(db: Session, note_id: str) -> bool:
    db_note = get_note(db, note_id)
    if not db_note:
        return False
        
    # cleanup links involving this note
    db.execute(
        models.note_links.delete().where(
            or_(models.note_links.c.source_id == note_id, models.note_links.c.target_id == note_id)
        )
    )
    
    db.delete(db_note)
    db.commit()
    return True

def get_tags(db: Session):
    return db.query(models.Tag).all()
