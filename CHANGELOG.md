# Changelog

All notable changes to Mindgarden are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-10-20

The first full season of the garden.

### Added — The Greenhouse (wellbeing)
- Daily mood log (1–10 botanical scale) with a short journal line; one entry per day.
- Mood score on individual notes, picked in the editor drawer.
- 14-day mood strip on the garden overview.
- Daily rituals: habit tracker with one-tap check-ins, 7-day dots, and forgiving streaks.
- Greenhouse dashboard: monthly SVG mood chart with average line, summary cards, most-used tags ranking.
- Care heatmap: 12-week GitHub-style calendar colored by daily care intensity, with a click-through day detail.

### Added — The Garden
- Paginated feed API with infinite scroll in the overview.
- Feed sorting (recently tended, newly planted, title, brightest mood) and date-range windows.
- Multi-word search across titles, content, and tag names.
- Garden days: pin any note to a past calendar date.
- Skeleton loading states for the feed and the greenhouse.
- Five-step onboarding tour covering views, the command palette, the greenhouse, and themes.

### Added — Foundations
- User accounts: JWT registration/login, bcrypt hashing, per-gardener data scoping (API-ready; login UI arrives next season).
- Night garden dark theme with persistent toggle, no-flash bootstrap, and settings screen with gardener name.
- Light/dark glass design token system (`.glass-panel`, `.glass-card`, `.glass-chip`, `.glass-inset`, `.glass-drawer`).
- In-memory TTL cache for hot reads, ETag revalidation for stats, eager-loaded relations, and hot-path indexes.
- Accessible focus rings, aria labels, and `prefers-reduced-motion` support.
- pytest suite covering auth, notes, feed, moods, habits, stats, and ETag flows.

### Fixed
- N+1 queries on note links and habit logs.
- Tag cache staleness when the last tagged note is deleted (orphan tags retire and the cache follows).
- Theme flash on first paint for returning visitors.

## [0.1.0] — 2026-08-10

Initial planting: notes with growth stages, tags, bidirectional links, glass cards, kanban and graph views, command palette, mermaid rendering, activity calendar, and the onboarding tour.
