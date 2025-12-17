# Rowans Events - Quick Start

## Development
```bash
npm run dev        # http://localhost:3001/
npm run db:studio  # Drizzle Studio for DB management
```

**Login:** pickled / pepper

## What is this?
Full-stack event schedule app with flexible time slots, cloud database, and PDF/JPG export.

## Key URLs (local)
- Public schedule: http://localhost:3001/
- Admin login: http://localhost:3001/login
- Schedule editor: http://localhost:3001/admin
- Events CRUD: http://localhost:3001/admin/events
- Users CRUD: http://localhost:3001/admin/users

## Tech Stack
- Nuxt 4.2 + Vue 3.5
- Nuxt UI 4 (with custom dark theme)
- Drizzle ORM + Turso (cloud SQLite)
- nuxt-auth-utils for sessions
- PDFKit for PDF export
- html2canvas for JPG export

## Database
- **Production:** Turso Cloud (libSQL)
- Tables: events, schedule_entries, users, settings
- Schedule entries have: date, bowl, start_time, end_time, event_id, created_by, updated_by

## Key Files
```
app/pages/admin/index.vue    - Schedule editor (add/edit/delete slots)
app/pages/admin/events.vue   - Events management
app/pages/admin/users.vue    - Users management
app/pages/index.vue          - Public view (desktop grid + mobile swipe)
server/database/schema.ts    - Drizzle schema
server/database/db.ts        - Turso connection
server/api/admin/schedule/   - Schedule CRUD endpoints
server/api/export/           - PDF export
```

## Commands
```bash
npm run dev        # Start dev server
npm run db:push    # Push schema to Turso
npm run db:seed    # Seed initial data
npm run db:studio  # Open Drizzle Studio
```

## Known Issues
1. Week navigation bug: column may go blank after 4-5 weeks forward/back
2. Lock state is client-side only (doesn't persist)
3. Mobile export captures single day view only

## Full Documentation
See `.claude/memory/CURRENT_STATE.md` for complete implementation details.
