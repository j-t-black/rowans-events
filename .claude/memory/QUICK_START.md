# Quick Start for New Session

## First Steps
```bash
cd /Users/jtblack/dev/rowans-rota-v2
npm run dev
```
App runs at http://localhost:3001/

## Project Status: FUNCTIONAL
Full-stack DJ schedule app with flexible time slots, cloud database, and PDF/JPG export.

## Login
- URL: http://localhost:3001/login
- Username: `pickled`
- Password: `pepper`

## URLs
- Public schedule: http://localhost:3001/
- Admin dashboard: http://localhost:3001/admin
- DJs CRUD: http://localhost:3001/admin/djs

## Flexible Time Slots

Time slots are stored directly with `start_time` and `end_time` fields. Each date is independent.

**Admin UI features:**
- Add/remove slots freely for any date
- Time dropdowns: 30-minute increments from 12:00 to 02:30
- Slots auto-sort by start time
- Delete all slots → shows template defaults

**Default templates (used when no entries exist):**

| Day | Lower Bowl | Upper Bowl |
|-----|------------|------------|
| Wed-Fri | 17:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30 | 18:00-20:30, 20:30-22:30, 22:30-00:30, 00:30-02:30 |
| Saturday | 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30 | 14:00-16:00, 16:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30 |
| Sunday | 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:30 | 14:00-16:00, 16:00-18:00 |

## Database
- **Production:** Turso Cloud (libSQL)
- Tables: djs, schedule_entries, users, settings
- Schedule entries have: date, bowl, start_time, end_time, dj_id

## Key Files
```
app/pages/admin/index.vue    - Schedule editor (add/edit/delete slots)
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

## Environment Variables
```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NUXT_SESSION_PASSWORD=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

## Known Issues
1. Week navigation bug: column may go blank after 4-5 weeks forward/back
2. Lock state is client-side only (doesn't persist)
3. Mobile export captures single day view only

## Full Documentation
See `.claude/memory/CURRENT_STATE.md` for complete implementation details.
