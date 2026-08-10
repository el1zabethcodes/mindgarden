# Mindgarden 🌱

Mindgarden is a calm, card-based personal knowledge base built to capture thoughts, links, and ideas over time. It features a soft minimalist, cool-toned editorial design (Sage Green, Cool Mint, Slate, and Pearl Gray) with focus on layout animations, glassmorphic card surfaces, and bidirectional interlinking.

## Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Mermaid.js, Lucide React icons.
* **Backend**: FastAPI (Python 3.13+), SQLite database, SQLAlchemy ORM, Pydantic v2 schemas.
* **Orchestration**: `concurrently` package for single-command start.

---

## Features

1. **Garden Navigation & Stats**: Live counter showing notes count, seeds, growing, and evergreen note statistics.
2. **Growth Stages**:
   - 🌱 **Seed**: raw, unpolished ideas.
   - 🌿 **Growing**: expanding thoughts that are connecting.
   - 🌳 **Evergreen**: fully established notes.
3. **Responsive Grid**: Fluid glassmorphic note cards that scale smoothly on hover.
4. **Frosted Editor Drawer**: Slide-out editor from the right side. Includes auto-focus title, tabbed markdown editor/preview, mood color wheel, and tag creation chips.
5. **Bidirectional Internal Links**: Link notes together. Connected notes display as clickable chips at the bottom of the card, allowing you to traverse your web of thoughts instantly.
6. **Instant Search & Tag Filtering**: Instantly search by title/content and filter cards by growth stage or tags.
7. **Interactive Connection Graph**: Interactive SVG force-directed connection graph showing note links in 2D space.
8. **Kanban Board**: Drag-and-drop board for managing notes' growth stage (Seed, Growing, Evergreen).
9. **Activity Calendar**: GitHub-style contribution calendar displaying note updates over the last 84 days.
10. **Command Palette (Cmd+K / Ctrl+K)**: Search notes, filter tags, or run quick command actions (e.g. `/new`, `/graph`, `/kanban`, `/grid`).
11. **Developer Preset Filters**: Filter by Orphan Notes (0 links), Hub Notes (>2 links), or Code Snippets (contains ` ``` `).
12. **Link Preview Popovers**: Hover over connection chips to instantly view a popover showing the note's title and excerpt.
13. **Backlink Auto-suggestions**: Scans draft content for references to other note titles and provides a 1-click button to connect them.
14. **Mermaid.js Diagram Rendering**: Renders flowcharts and architecture diagrams natively from markdown code blocks (` ```mermaid `) using custom garden theme variables.
15. **Split-Pane Editor & Outline**: Edit notes with a side-by-side split editor/preview and auto-generated Table of Contents links.
16. **Onboarding Tour**: A 3-step tour introducing the garden concept, views, and Command Palette shortcuts for first-time visitors.

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
2. Seed the database with initial sample thoughts:
   ```bash
   backend/.venv/Scripts/python backend/seed.py
   ```
3. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be accessible at:
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
