import os
import re
import secrets
from datetime import date, datetime, time, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_, func
import models
import schemas
import security
import cache

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

DEMO_USERNAME = "gardener"

def get_or_create_demo_user(db: Session) -> models.User:
    demo = get_user_by_username(db, DEMO_USERNAME)
    if not demo:
        # the demo password comes from the DEMO_PASSWORD env var; when unset
        # a random one is generated so nobody can log in by guessing
        demo_password = os.environ.get("DEMO_PASSWORD") or secrets.token_urlsafe(16)
        demo = models.User(
            username=DEMO_USERNAME,
            email="gardener@mindgarden.local",
            display_name="Demo Gardener",
            password_hash=security.hash_password(demo_password),
        )
        db.add(demo)
        db.commit()
        db.refresh(demo)
    return demo


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user_in.username,
        email=user_in.email,
        display_name=user_in.display_name or user_in.username,
        password_hash=security.hash_password(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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
        # a brand new tag changes the tag list served from cache
        cache.invalidate("tags:")
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

def get_linked_note_ids_map(db: Session, note_ids: List[str]) -> dict:
    """fetch links for a whole page of notes in one query.

    replaces the per-note lookup that made list endpoints query N+1 times.
    """
    if not note_ids:
        return {}

    rows = db.query(models.note_links).filter(
        or_(
            models.note_links.c.source_id.in_(note_ids),
            models.note_links.c.target_id.in_(note_ids),
        )
    ).all()

    links_map = {note_id: [] for note_id in note_ids}
    for r in rows:
        if r.source_id in links_map:
            links_map[r.source_id].append(r.target_id)
        if r.target_id in links_map:
            links_map[r.target_id].append(r.source_id)
    return links_map

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

def _apply_note_filters(query, search: Optional[str] = None, status: Optional[str] = None, tag: Optional[str] = None, user_id: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None):
    # shared filter chain for list and count queries so they never drift apart
    if user_id:
        query = query.filter(models.Note.user_id == user_id)

    if status:
        query = query.filter(models.Note.status == status)

    if tag:
        tag_id = slugify(tag)
        query = query.filter(models.Note.tags.any(models.Tag.id == tag_id))

    if search:
        # every word must match somewhere: title, content, or a tag name
        for word in re.split(r"\s+", search.strip()):
            if not word:
                continue
            pattern = f"%{word}%"
            query = query.filter(
                or_(
                    models.Note.title.like(pattern),
                    models.Note.content.like(pattern),
                    models.Note.tags.any(models.Tag.name.like(pattern)),
                )
            )

    # the "garden day" of a note: its pinned date, or the day it was planted
    garden_day = func.coalesce(models.Note.entry_date, func.date(models.Note.created_at))
    if date_from:
        query = query.filter(garden_day >= date_from)
    if date_to:
        query = query.filter(garden_day <= date_to)

    return query

NOTE_SORTS = {
    "updated": models.Note.updated_at.desc(),
    "created": models.Note.created_at.desc(),
    "title": models.Note.title.asc(),
    # brightest mood first, unmooded notes sink to the bottom
    "mood": models.Note.mood_score.desc().nullslast(),
}

def get_notes(db: Session, search: Optional[str] = None, status: Optional[str] = None, tag: Optional[str] = None, user_id: Optional[str] = None, limit: Optional[int] = None, offset: int = 0, sort: str = "updated", date_from: Optional[date] = None, date_to: Optional[date] = None):
    query = db.query(models.Note)
    query = _apply_note_filters(query, search=search, status=status, tag=tag, user_id=user_id, date_from=date_from, date_to=date_to)

    # tags load in one extra query instead of one per note
    query = query.options(selectinload(models.Note.tags))

    # unknown sort keys fall back to last-tended order
    query = query.order_by(NOTE_SORTS.get(sort, NOTE_SORTS["updated"]))

    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    return query.all()

def count_notes(db: Session, search: Optional[str] = None, status: Optional[str] = None, tag: Optional[str] = None, user_id: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None) -> int:
    query = db.query(models.Note.id)
    query = _apply_note_filters(query, search=search, status=status, tag=tag, user_id=user_id, date_from=date_from, date_to=date_to)
    return query.count()

def get_note(db: Session, note_id: str):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def create_note(db: Session, note_in: schemas.NoteCreate, owner: Optional[models.User] = None) -> models.Note:
    # create db note
    db_note = models.Note(
        title=note_in.title,
        content=note_in.content,
        status=note_in.status,
        mood_color=note_in.mood_color,
        mood_score=note_in.mood_score,
        entry_date=note_in.entry_date,
        is_favorite=note_in.is_favorite,
        user_id=owner.id if owner else None
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

def upsert_mood_entry(db: Session, user: models.User, entry_in: schemas.MoodEntryIn) -> models.MoodEntry:
    # one entry per gardener per day: same-day updates overwrite in place
    entry_date = entry_in.entry_date or date.today()
    entry = db.query(models.MoodEntry).filter(
        models.MoodEntry.user_id == user.id,
        models.MoodEntry.entry_date == entry_date,
    ).first()

    if entry:
        entry.score = entry_in.score
        entry.note = entry_in.note or ""
    else:
        entry = models.MoodEntry(
            user_id=user.id,
            score=entry_in.score,
            note=entry_in.note or "",
            entry_date=entry_date,
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry

def get_mood_entries(db: Session, user_id: str, days: int = 30) -> List[models.MoodEntry]:
    since = date.today() - timedelta(days=days)
    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.user_id == user_id, models.MoodEntry.entry_date >= since)
        .order_by(models.MoodEntry.entry_date.desc())
        .all()
    )

def get_habits(db: Session, user_id: str, include_archived: bool = False) -> List[models.Habit]:
    query = (
        db.query(models.Habit)
        # logs load in one extra query; streak math reads them for every habit
        .options(selectinload(models.Habit.logs))
        .filter(models.Habit.user_id == user_id)
    )
    if not include_archived:
        query = query.filter(models.Habit.is_archived == False)
    return query.order_by(models.Habit.created_at.asc()).all()

def get_habit(db: Session, habit_id: str) -> Optional[models.Habit]:
    return db.query(models.Habit).filter(models.Habit.id == habit_id).first()

def create_habit(db: Session, user: models.User, habit_in: schemas.HabitCreate) -> models.Habit:
    habit = models.Habit(
        user_id=user.id,
        name=habit_in.name,
        description=habit_in.description or "",
        icon=habit_in.icon or "seedling",
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

def update_habit(db: Session, habit_id: str, habit_in: schemas.HabitUpdate) -> Optional[models.Habit]:
    habit = get_habit(db, habit_id)
    if not habit:
        return None
    for key, val in habit_in.model_dump(exclude_unset=True).items():
        setattr(habit, key, val)
    db.commit()
    db.refresh(habit)
    return habit

def delete_habit(db: Session, habit_id: str) -> bool:
    habit = get_habit(db, habit_id)
    if not habit:
        return False
    db.delete(habit)  # logs cascade
    db.commit()
    return True

def check_in_habit(db: Session, habit: models.Habit, log_date: Optional[date] = None) -> models.HabitLog:
    # checking in twice on the same day is a no-op thanks to the unique pair
    log_date = log_date or date.today()
    log = db.query(models.HabitLog).filter(
        models.HabitLog.habit_id == habit.id,
        models.HabitLog.log_date == log_date,
    ).first()
    if not log:
        log = models.HabitLog(habit_id=habit.id, log_date=log_date)
        db.add(log)
        db.commit()
        db.refresh(log)
    return log

def calculate_streak(log_dates: set) -> int:
    """count consecutive check-in days ending today (or yesterday, so a
    streak survives until the gardener checks in again)."""
    today = date.today()
    cursor = today if today in log_dates else today - timedelta(days=1)
    streak = 0
    while cursor in log_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak

def build_habit_out(db: Session, habit: models.Habit) -> schemas.HabitOut:
    log_dates = {log.log_date for log in habit.logs}
    today = date.today()
    window = [today - timedelta(days=offset) for offset in range(29, -1, -1)]
    return schemas.HabitOut(
        id=habit.id,
        name=habit.name,
        description=habit.description,
        icon=habit.icon,
        is_archived=habit.is_archived,
        created_at=habit.created_at,
        current_streak=calculate_streak(log_dates),
        total_checkins=len(log_dates),
        recent_days=[d in log_dates for d in window],
    )

def get_stats(db: Session, user_id: str, days: int = 30) -> schemas.StatsOut:
    """aggregate greenhouse stats for the dashboard.

    a fresh check-in or note may take up to the cache ttl (60s) to show
    up here; the dashboard prefers calm numbers over live ones anyway.
    """
    since = date.today() - timedelta(days=days - 1)
    window = [since + timedelta(days=i) for i in range(days)]

    # mood per day
    mood_rows = (
        db.query(models.MoodEntry.entry_date, func.avg(models.MoodEntry.score))
        .filter(models.MoodEntry.user_id == user_id, models.MoodEntry.entry_date >= since)
        .group_by(models.MoodEntry.entry_date)
        .all()
    )
    mood_by_day = {row[0]: round(float(row[1]), 1) for row in mood_rows}

    # notes planted per day
    note_rows = (
        db.query(func.date(models.Note.created_at), func.count(models.Note.id))
        .filter(
            models.Note.user_id == user_id,
            models.Note.created_at >= datetime.combine(since, time.min),
        )
        .group_by(func.date(models.Note.created_at))
        .all()
    )
    notes_by_day = {row[0]: row[1] for row in note_rows}

    # habit check-ins per day
    checkin_rows = (
        db.query(models.HabitLog.log_date, func.count(models.HabitLog.id))
        .join(models.Habit, models.Habit.id == models.HabitLog.habit_id)
        .filter(models.Habit.user_id == user_id, models.HabitLog.log_date >= since)
        .group_by(models.HabitLog.log_date)
        .all()
    )
    checkins_by_day = {row[0]: row[1] for row in checkin_rows}

    # most used tags across this garden
    top_tag_rows = (
        db.query(
            models.Tag.id,
            models.Tag.name,
            models.Tag.color,
            func.count(models.note_tags.c.note_id).label("uses"),
        )
        .join(models.note_tags, models.note_tags.c.tag_id == models.Tag.id)
        .join(models.Note, models.Note.id == models.note_tags.c.note_id)
        .filter(models.Note.user_id == user_id)
        .group_by(models.Tag.id)
        .order_by(func.count(models.note_tags.c.note_id).desc())
        .limit(8)
        .all()
    )

    # totals
    total_notes = count_notes(db, user_id=user_id)
    habits = get_habits(db, user_id, include_archived=True)
    longest_streak = max((calculate_streak({log.log_date for log in h.logs}) for h in habits), default=0)
    avg_mood_row = (
        db.query(func.avg(models.MoodEntry.score))
        .filter(models.MoodEntry.user_id == user_id, models.MoodEntry.entry_date >= since)
        .scalar()
    )

    return schemas.StatsOut(
        days=days,
        mood=[
            schemas.MoodPoint(date=d, avg_score=mood_by_day.get(d)) for d in window
        ],
        top_tags=[
            schemas.TagStat(id=r[0], name=r[1], color=r[2], count=r[3])
            for r in top_tag_rows
        ],
        activity=[
            schemas.ActivityDay(
                date=d,
                notes=notes_by_day.get(d, 0),
                moods=1 if d in mood_by_day else 0,
                checkins=checkins_by_day.get(d, 0),
            )
            for d in window
        ],
        totals=schemas.StatsTotals(
            notes=total_notes,
            habits=len(habits),
            longest_streak=longest_streak,
            avg_mood=round(float(avg_mood_row), 1) if avg_mood_row is not None else None,
        ),
    )
