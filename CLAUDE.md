# Rowans Rota v2

**Read `.claude/memory/CURRENT_STATE.md` for complete implementation details.**

## Stack
Nuxt 4.2 | Nuxt UI 4 | Drizzle ORM + Turso (cloud SQLite) | nuxt-auth-utils | PDFKit

## Deployment
- **Hosting:** Vercel (free tier)
- **Database:** Turso Cloud (libSQL)
- **Live URL:** Check Vercel dashboard

## Quick Start
```bash
npm run dev  # http://localhost:3001/
```
Login: pickled / pepper

## Purpose
DJ schedule management for Rowans venue. Week runs Wed→Sun with different time slots per day and bowl.

## Schedule Slots

**Lower Bowl** (4-5 slots):
- Wed-Fri: 17:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30
- Sat: 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30
- Sun: 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:30

**Upper Bowl** (varies: 4/6/2 slots):
- Wed-Fri: 18:00-20:30, 20:30-22:30, 22:30-00:30, 00:30-02:30
- Sat: 14:00-16:00, 16:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30
- Sun: 14:00-16:00, 16:00-18:00

## Key Files
- `app/pages/admin/index.vue` - Schedule editor with slot defaults
- `app/pages/index.vue` - Public view with smoke effect (lines 18-110)
- `server/api/admin/export/[bowl].get.ts` - PDF export
- `server/database/schema.ts` - Drizzle schema
- `server/database/db.ts` - Turso connection

## Styling
Dark theme, inline styles + scoped CSS. Background #0a0a0a, accent #d0232a, font Fira Code.

## Environment Variables
```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NUXT_SESSION_PASSWORD=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

## Memory
- `.claude/memory/CURRENT_STATE.md` - **Complete implementation guide**
