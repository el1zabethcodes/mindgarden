# Mindgarden 🌱

Mindgarden is a calm, card-based personal knowledge base built to capture thoughts, links, and ideas over time — and to look after the gardener while it grows. It features a soft minimalist, cool-toned editorial design (Sage Green, Cool Mint, Slate, and Pearl Gray) with focus on layout animations, glassmorphic card surfaces, and bidirectional interlinking.

## Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Mermaid.js, Lucide React icons.
* **Backend**: FastAPI (Python 3.13+), SQLite database, SQLAlchemy ORM, Pydantic v2 schemas, PyJWT auth, bcrypt password hashing.
* **Orchestration**: `concurrently` package for single-command start.

---

## Features

### The Garden
1. **Garden Navigation & Stats**: Live counter showing notes count, seeds, growing, and evergreen note statistics.
2. **Growth Stages**:
   - 🌱 **Seed**: raw, unpolished ideas.
   - 🌿 **Growing**: expanding thoughts that are connecting.
   - 🌳 **Evergreen**: fully established notes.
3. **Responsive Grid**: Fluid glassmorphic note cards that scale smoothly on hover.
4. **Frosted Editor Drawer**: Slide-out editor from the right side. Includes auto-focus title, tabbed markdown editor/preview, mood color wheel, mood score picker, garden-day pinning, and tag creation chips.
5. **Bidirectional Internal Links**: Link notes together. Connected notes display as clickable chips at the bottom of the card, allowing you to traverse your web of thoughts instantly.
6. **Instant Search & Tag Filtering**: Instantly search by title/content, filter cards by growth stage or tags, and sort the feed (recently tended, newly planted, title, brightest mood).
7. **Interactive Connection Graph**: Interactive SVG force-directed connection graph showing note links in 2D space.
8. **Kanban Board**: Drag-and-drop board for managing notes' growth stage (Seed, Growing, Evergreen).
9. **Infinite Scroll Feed**: The main feed pages lazily from the paginated API as you scroll.
10. **Command Palette (Cmd+K / Ctrl+K)**: Search notes, filter tags, or run quick command actions (e.g. `/new`, `/graph`, `/kanban`, `/grid`).
11. **Developer Preset Filters**: Filter by Orphan Notes (0 links), Hub Notes (>2 links), or Code Snippets (contains ` ``` `).
12. **Mermaid.js Diagram Rendering**: Renders flowcharts and architecture diagrams natively from markdown code blocks (` ```mermaid `) using custom garden theme variables.
13. **Split-Pane Editor & Outline**: Edit notes with a side-by-side split editor/preview and auto-generated Table of Contents links.
14. **Onboarding Tour**: A guided tour introducing the garden concept, views, and Command Palette shortcuts for first-time visitors.

### The Greenhouse (wellbeing)
15. **Mood Tracking**: A 1–10 botanical mood score on every note plus a separate daily mood log with a short journal line. The overview shows a 14-day mood strip.
16. **Daily Rituals**: Gentle habit tracker with one-tap check-ins, 7-day mini history dots, and streak counting that forgives the rest of the day.
17. **Greenhouse Dashboard**: Monthly SVG mood chart with average line, activity summary cards (notes planted, days tended, habits growing, longest streak), and a ranking of your most-used tags.
18. **Care Heatmap**: GitHub-style 12-week calendar colored by daily care intensity. Click any day for a popover with that day's notes, mood, and rituals.
19. **Garden Days**: Pin any note to a past calendar date to backfill older thoughts.

### Foundations
20. **Accounts (rolling out)**: JWT registration/login with bcrypt hashing and per-gardener data scoping. The UI login screen arrives in a future season; the API is ready.
21. **Day & Night**: A soft "night garden" dark theme (the glass stays glass), persisted per visitor with no flash on load, plus a settings screen with gardener name.
22. **Calm Engineering**: Paginated feed API, eager-loaded relations, hot-path indexes, TTL response cache, and a pytest suite covering auth, notes, moods, habits, and stats.
23. **Accessibility**: Visible keyboard focus rings, aria labels on icon actions, and full `prefers-reduced-motion` support.

---

## Setup & Running Locally

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)

### Quick Start (Monorepo dev server)
You can launch both the frontend and backend simultaneously using a single command:

1. Install project dependencies:
   ```bash
   npm install && cd frontend && npm install
   ```
2. Create the backend virtual environment (if not present) and install requirements:
   ```bash
   python -m venv backend/.venv
   backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
   ```
3. Seed the database with initial sample thoughts:
   ```bash
   backend/.venv/Scripts/python backend/seed.py
   ```
4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be accessible at:
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Optional environment

* `DEMO_PASSWORD` — password for the seeded demo gardener account (a random unguessable one is generated when unset).
* `SECRET_KEY` — JWT signing secret for anything beyond local runs.

### Tests

```bash
cd backend && .venv/Scripts/python -m pytest tests -q
```
