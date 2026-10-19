# Contributing to Mindgarden 🌱

Thank you for wanting to help the garden grow. This project is small on purpose and calm by design — contributions that keep it that way are the most welcome.

## Getting started

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install && cd frontend && npm install
   python -m venv backend/.venv
   backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
   ```
3. Seed a local database:
   ```bash
   backend/.venv/Scripts/python backend/seed.py
   ```
4. Run both servers with `npm run dev` (frontend on `:3000`, API on `:8000`).

## Before you open a pull request

- **Tests**: run the backend suite — `cd backend && .venv/Scripts/python -m pytest tests -q`. New endpoints need new tests.
- **Types**: `cd frontend && npx tsc --noEmit` must pass, and `npm run lint` should stay quiet.
- **Migrations**: if you add a column, extend `backend/migrations.py` so existing `garden.db` files keep working (the project deliberately skips alembic for now).

## Commit style

Conventional commits, lowercase and specific:

```
feat(mood): daily mood log with separate entries table
fix(ui): prevent theme flash with inline bootstrap script
perf(db): eager loading batched links and hot path indexes
```

## Design constraints

The garden has one strict rule: **soft and botanical, always**.

- Palette: sage, mint, slate, pearl — calm natural tones.
- Surfaces: glassmorphism (translucent layers, matte blur, gentle shadows, rounded corners).
- Banned: neon glow, cyberpunk, futuristic techno styling, aggressive saturated colors.
- Naming leans into the metaphor: seeds, tending, greenhouses, rituals, garden days.

If a change makes the interface louder rather than calmer, it probably does not belong here.

## Reporting issues

Please include steps to reproduce, what you expected, and what happened instead. Screenshots of the garden are always appreciated.
