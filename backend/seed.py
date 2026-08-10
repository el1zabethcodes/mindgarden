from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models
import crud
import schemas

def seed_db():
    print("initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # clear existing data
        db.query(models.note_tags).delete()
        db.query(models.note_links).delete()
        db.query(models.Note).delete()
        db.query(models.Tag).delete()
        db.commit()
        
        print("seeding tags...")
        tags = [
            ("backend", "sage"),
            ("frontend", "mint"),
            ("database", "slate"),
            ("architecture", "lavender_cool"),
            ("caching", "peach"),
            ("microservices", "rose")
        ]
        for name, col in tags:
            tag = models.Tag(id=crud.slugify(name), name=name, color=col)
            db.add(tag)
        db.commit()
        
        print("seeding technical notes...")
        
        n1 = crud.create_note(db, schemas.NoteCreate(
            title="Async Event Loop & FastAPI Architecture",
            content="""FastAPI is built on Starlette and uses Python's `asyncio` event loop. It enables highly concurrent I/O-bound systems by suspending coroutines during operations like fetching data or querying databases.

### Concurrency Example
```python
import asyncio
from fastapi import FastAPI

app = FastAPI()

@app.get("/compute")
async def handle_request():
    # non-blocking wait suspends this coroutine
    await asyncio.sleep(0.05)
    return {"status": "completed"}
```

Avoid running CPU-bound operations in the main event loop, as they will block all other concurrent requests.""",
            status="evergreen",
            mood_color="sage",
            is_favorite=True,
            tags=["backend", "architecture"]
        ))

        n2 = crud.create_note(db, schemas.NoteCreate(
            title="Postgres Connection Pooling & Indexes",
            content="""Connection pooling reuse existing DB sockets rather than establishing new handshakes for each transaction. In FastAPI apps, SQLAlchemy's `QueuePool` is the default.

### Indexes & Pool Configuration
```sql
-- create a composite index for fast compound queries
CREATE INDEX idx_notes_status_updated ON notes (status, updated_at DESC);
```

```python
from sqlalchemy import create_engine

# configured for low latency pooled connections
engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=20,
    max_overflow=10,
    pool_timeout=30
)
```""",
            status="growing",
            mood_color="slate",
            tags=["database", "backend"]
        ))

        n3 = crud.create_note(db, schemas.NoteCreate(
            title="Event-Driven Microservices with RabbitMQ",
            content="""Event-driven architectures decouple services by communicating asynchronously via message brokers. RabbitMQ uses exchanges and bindings to route events.

### RabbitMQ Publisher
```python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# declare exchange and publish task message
channel.exchange_declare(exchange='events', exchange_type='topic')
channel.basic_publish(
    exchange='events',
    routing_key='note.created',
    body='{"id": "note-123", "action": "plant"}'
)
connection.close()
```""",
            status="growing",
            mood_color="rose",
            tags=["microservices", "architecture"]
        ))

        n4 = crud.create_note(db, schemas.NoteCreate(
            title="Redis Cache Strategies & Invalidation",
            content="""Caching increases database read performance. Common strategies are Cache-Aside (Lazy Loading) and Write-Through caching.

### Cache-Aside Implementation
```python
import json
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

def get_note_data(note_id: str):
    # check cache first
    cached = r.get(f"note:{note_id}")
    if cached:
        return json.loads(cached)
    
    # fallback to database
    db_data = fetch_from_db(note_id)
    r.setex(f"note:{note_id}", 3600, json.dumps(db_data))
    return db_data
```""",
            status="evergreen",
            mood_color="peach",
            tags=["caching", "backend"]
        ))

        n5 = crud.create_note(db, schemas.NoteCreate(
            title="React 19 Server Components & Hydration",
            content="""React 19 splits components into Server (RSC) and Client Components. RSCs render exclusively on the server, saving bundle size.

### Server & Client Split
```typescript
// server component
import { getDbNotes } from "./api";
import NoteCardList from "./NoteCardList"; // client component

export default async function Page() {
  const notes = await getDbNotes();
  return <NoteCardList initialNotes={notes} />;
}
```

Client components must include the `"use client"` directive at the very top of the file.""",
            status="evergreen",
            mood_color="mint",
            is_favorite=True,
            tags=["frontend"]
        ))

        n6 = crud.create_note(db, schemas.NoteCreate(
            title="Next.js 15 App Router Best Practices",
            content="""Next.js 15 leverages React 19's Server Components model. Data fetching should be co-located inside the layout/pages using async Server Components.

### Caching and Revalidation
```typescript
// cache fetch response for 60 seconds
const response = await fetch("https://api.garden.com/notes", {
  next: { revalidate: 60 }
});
```

Using dynamic functions (like `cookies()` or `headers()`) forces the route into dynamic rendering.""",
            status="growing",
            mood_color="slate",
            tags=["frontend", "architecture"]
        ))

        n7 = crud.create_note(db, schemas.NoteCreate(
            title="State Machines in Complex UI Workflows",
            content="""State machines prevent impossible UI states (e.g. loading and error showing at the same time).

### Simple State Reducer
```typescript
type UIState = "idle" | "loading" | "success" | "error";
type UIAction = { type: "FETCH" } | { type: "RESOLVE" } | { type: "REJECT" };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (state) {
    case "idle":
      if (action.type === "FETCH") return "loading";
      return state;
    case "loading":
      if (action.type === "RESOLVE") return "success";
      if (action.type === "REJECT") return "error";
      return state;
    default:
      return state;
  }
}
```""",
            status="seed",
            mood_color="lavender_cool",
            tags=["frontend"]
        ))

        n8 = crud.create_note(db, schemas.NoteCreate(
            title="SQL Indexes Deep Dive",
            content="""Indexes improve query performance but add overhead to inserts and updates. 

### Index Types
- **B-Tree**: default index type, fits range queries.
- **Hash**: fast for exact matches (`=`).
- **GIN**: perfect for array columns or full-text search.

```sql
-- GIN index for text search
CREATE INDEX idx_notes_search ON notes USING gin(to_tsvector('english', content));
```""",
            status="seed",
            mood_color="slate",
            tags=["database"]
        ))

        n9 = crud.create_note(db, schemas.NoteCreate(
            title="Tailwind CSS v4 Engineering Architecture",
            content="""Tailwind CSS v4 uses a new compiler engine built in Rust. It compiles CSS variables dynamically in the browser, simplifying configurations.

Instead of `tailwind.config.js`, configurations are styled with direct CSS `@theme` rules.""",
            status="seed",
            mood_color="sage",
            tags=["frontend", "design"]
        ))

        n10 = crud.create_note(db, schemas.NoteCreate(
            title="Docker Container Multi-Stage Builds",
            content="""Multi-stage builds reduce docker image size by discarding build tools in the final runner stage.

### Dockerfile
```dockerfile
# stage 1: builder
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# stage 2: runner
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```""",
            status="evergreen",
            mood_color="slate",
            tags=["architecture"]
        ))

        print("linking technical note connections...")
        # n1 (FastAPI) links to n2 (Postgres) and n4 (Redis)
        crud.set_note_links(db, n1.id, [n2.id, n4.id])
        # n2 (Postgres) links to n1 (FastAPI)
        crud.set_note_links(db, n2.id, [n1.id])
        # n3 (RabbitMQ) links to n4 (Redis)
        crud.set_note_links(db, n3.id, [n4.id])
        # n4 (Redis) links to n1 (FastAPI) and n3 (RabbitMQ)
        crud.set_note_links(db, n4.id, [n1.id, n3.id])
        # n5 (React 19) links to n6 (Next.js) and n7 (State Machines)
        crud.set_note_links(db, n5.id, [n6.id, n7.id])
        # n6 (Next.js) links to n5 (React 19)
        crud.set_note_links(db, n6.id, [n5.id])
        # n7 (State Machines) links to n5 (React 19)
        crud.set_note_links(db, n7.id, [n5.id])
        
        # Note: n8 (SQL Indexes), n9 (Tailwind), n10 (Docker) remain orphans (0 connections) to test the orphan filter!
        
        print("database seeded successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
