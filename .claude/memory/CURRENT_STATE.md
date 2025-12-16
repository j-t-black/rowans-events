# Rowans DJs - Complete Implementation Guide

**Last Updated:** December 10, 2025
**Repo:** https://github.com/j-t-black/rowans-rota-v2
**Live:** https://rowans-djs.vercel.app (or your Vercel URL)

## Tech Stack

- **Framework:** Nuxt 4.2.1 (Vue 3.5)
- **UI Library:** Nuxt UI 4.2.1 (with inline styles for theming)
- **Database:** Turso (libSQL - cloud SQLite)
- **ORM:** Drizzle ORM 0.45 with @libsql/client
- **Auth:** nuxt-auth-utils 0.5.25
- **PDF:** PDFKit 0.17.2
- **JPG Export:** html2canvas (client-side)
- **Hosting:** Vercel (free tier)

## Deployment

**Production:** Vercel + Turso Cloud

```bash
# Local development
npm run dev

# Database commands (uses Turso cloud)
npm run db:push       # Push schema to Turso
npm run db:seed       # Seed initial data
npm run db:studio     # Open Drizzle Studio
```

**Environment Variables (set in Vercel):**
- `TURSO_DATABASE_URL` - libsql://rowans-djs-j-t-black.aws-eu-west-1.turso.io
- `TURSO_AUTH_TOKEN` - Turso auth token
- `NUXT_SESSION_PASSWORD` - 32+ char session secret
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password (for seeding only)

**Login:** pickled / pepper

## Application Purpose

DJ schedule management for Rowans venue. The week runs **Wednesday to Sunday** with different time slots per day and per bowl (Upper/Lower).

---

## Schedule Configuration

### Flexible Time Slots

Time slots are now stored directly with `start_time` and `end_time` fields, allowing flexible customization per date.

**Default templates** are used when no entries exist for a date/bowl:

#### Weekday Defaults (Wed-Fri)
- **Lower Bowl:** 17:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30
- **Upper Bowl:** 18:00-20:30, 20:30-22:30, 22:30-00:30, 00:30-02:30

#### Saturday Defaults
- **Lower Bowl:** 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30
- **Upper Bowl:** 14:00-16:00, 16:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:00, 00:00-02:30

#### Sunday Defaults
- **Lower Bowl:** 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:30
- **Upper Bowl:** 14:00-16:00, 16:00-18:00

**Key features:**
- Add/remove slots freely for any date without affecting other dates
- Time dropdowns: 30-minute increments from 12:00 to 02:30
- Slots auto-sort by start time
- Delete all slots → reset shows template defaults
- Each date is independent

### Display Order

- **Lower Bowl** displayed first (top), then **Upper Bowl**
- Days run Wed → Thu → Fri → Sat → Sun (5 columns on desktop)

---

## Key Features

### 1. Public Schedule View (`app/pages/index.vue`)

**Desktop (≥768px):**
- 5-column grid layout (Wed-Sun)
- Week navigation with date picker
- PDF/JPG export toggle + download buttons
- Dark/light theme toggle
- Monochromatic smoke cursor trail with red text glow effect
- Hover effects with glow/scale

**Mobile (<768px):**
- Single day view with swipe navigation
- Sticky day header stays at top
- Swipe left/right anywhere on page to change days
- Arrow buttons (‹ ›) for day navigation
- Day indicator dots (tappable)
- Upper Bowl → Lower Bowl stacked vertically
- Prev/Next Week buttons

### 2. Smoke Trail Effect

- Monochromatic white particles following cursor
- Text glows red when smoke passes over it
- Configurable: size, speed, opacity in `app/pages/index.vue` lines 18-110

### 3. Export System

**PDF Export:**
- Server-side via PDFKit
- Light mode only (white background)
- Endpoint: `/api/export/[bowl]?startDate=X&endDate=Y`

**JPG Export:**
- Client-side via html2canvas
- Captures current theme (dark/light)
- 2x scale for high quality
- Downloads as `.jpg` file

**Toggle UI:** Sliding dot switch `[PDF ●───○ JPG]`

### 4. Theme System
- Dark/light mode toggle
- Persists to localStorage
- All elements are theme-aware
- Composable: `app/composables/useTheme.ts`

### 5. Admin Schedule Editor (`app/pages/admin/index.vue`)
- Week navigation (Prev/Next buttons)
- Grid layout: 5 columns × dynamic rows per bowl
- Dropdowns filter to valid times for each day/bowl/slot
- Default DJ auto-selected
- Real-time save on selection change
- Lock & Reset per bowl
- Populate button (fills week with default DJs)

### 6. DJ Management (`app/pages/admin/djs.vue`)
- CRUD for DJs
- Fields: name, email, instagram, whatsapp, avatar, isActive, isDefault
- Modal form for create/edit

---

## Styling

- **Font:** Fira Code (monospace), base 1.1rem, weight 500
- **Background:** Dark: #0a0a0a, Light: #f5f5f5
- **Cards/cells:** Dark: #1a1a1a, Light: #ffffff
- **Border:** Dark: #333, Light: #ddd
- **Text:** Dark: #f0f0f0, Light: #1a1a1a
- **Muted text:** #888 / #666
- **Accent (red):** #d0232a
- **Logo:** Theme-aware (black in light, white in dark)

---

## File Structure

```
app/
  pages/
    index.vue              # Public schedule (desktop grid + mobile swipe)
    login.vue              # Login form
    admin/
      index.vue            # Schedule editor
      djs.vue              # DJ CRUD
      time-slots.vue       # Time slot CRUD
  layouts/
    admin.vue              # Admin navigation layout
  composables/
    useTheme.ts            # Dark/light theme composable
  middleware/
    admin.ts               # Client-side auth check

server/
  api/
    auth/                  # Login/logout/session
    admin/                 # Protected admin endpoints
      djs/                 # DJ CRUD
      schedule/            # Schedule CRUD + populate + reset
      export/[bowl].get.ts # PDF export
    export/[bowl].get.ts   # Public PDF export
    schedule.get.ts        # Public schedule endpoint
    djs.get.ts             # Public DJs list
  database/
    schema.ts              # Drizzle schema
    db.ts                  # Turso/libSQL connection
    seed.ts                # Initial data seeding
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/schedule | No | Public schedule for date range |
| GET | /api/djs | No | Active DJs |
| GET | /api/export/:bowl | No | Public PDF download |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | Yes | Logout |
| GET | /api/auth/session | No | Current session |
| GET | /api/admin/schedule | Yes | Schedule entries |
| POST | /api/admin/schedule | Yes | Create/update entry |
| POST | /api/admin/schedule/reset | Yes | Reset bowl for week |
| POST | /api/admin/schedule/populate | Yes | Fill week with defaults |
| GET | /api/admin/djs | Yes | All DJs |
| POST/PUT/DELETE | /api/admin/djs | Yes | DJ CRUD |
| GET | /api/admin/export/:bowl | Yes | Admin PDF download |

---

## Database (Turso Cloud)

All database operations are async. API routes use `await` with Drizzle queries.

**Update admin password:**
```bash
npx tsx -e "
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { users } from './server/database/schema.ts'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = drizzle(client)

async function update() {
  const hash = await bcrypt.hash('NEW_PASSWORD', 10)
  await db.update(users).set({ username: 'NEW_USERNAME', passwordHash: hash }).where(eq(users.username, 'OLD_USERNAME'))
  console.log('Updated!')
}
update()
"
```

---

## Known Issues / Future Work

1. **Week navigation bug:** When clicking forward/back 4-5 weeks, first column may go blank until refresh
2. **Lock state persistence:** Currently client-side only
3. **Mobile export:** Works but captures single day view (could add week export option)
