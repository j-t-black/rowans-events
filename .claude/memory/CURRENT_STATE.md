# Rowans Events - Complete Implementation Guide

**Last Updated:** December 16, 2025
**Repo:** https://github.com/j-t-black/rowans-events
**Live:** Check Vercel dashboard

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
- `TURSO_DATABASE_URL` - libsql://rowans-events-j-t-black.aws-eu-west-1.turso.io
- `TURSO_AUTH_TOKEN` - Turso auth token
- `NUXT_SESSION_PASSWORD` - 32+ char session secret
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password (for seeding only)

**Login:** pickled / pepper

## Application Purpose

Event schedule management for Rowans venue. The week runs **Wednesday to Sunday** with different time slots per day and per bowl (Upper/Lower).

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
- Default event auto-selected
- Real-time save on selection change
- Lock & Reset per bowl
- Populate button (fills week with default events)
- User tracking: shows who created/updated each entry

### 6. Events Management (`app/pages/admin/events.vue`)
- CRUD for Events
- Fields: name, description, color, isActive, isDefault
- Modal form for create/edit

### 7. User Management (`app/pages/admin/users.vue`)
- CRUD for admin users
- Fields: username, displayName, password, role, isActive
- User tracking on schedule entries

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
      events.vue           # Events CRUD
      users.vue            # Users CRUD
      time-slots.vue       # Time slot CRUD (legacy)
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
      events/              # Events CRUD
      users/               # Users CRUD
      schedule/            # Schedule CRUD + populate + reset
      export/[bowl].get.ts # PDF export
    export/[bowl].get.ts   # Public PDF export
    schedule.get.ts        # Public schedule endpoint
    events.get.ts          # Public events list
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
| GET | /api/events | No | Active events |
| GET | /api/export/:bowl | No | Public PDF download |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | Yes | Logout |
| GET | /api/auth/session | No | Current session |
| GET | /api/admin/schedule | Yes | Schedule entries |
| POST | /api/admin/schedule | Yes | Create/update entry |
| POST | /api/admin/schedule/reset | Yes | Reset bowl for week |
| POST | /api/admin/schedule/populate | Yes | Fill week with defaults |
| GET | /api/admin/events | Yes | All events |
| POST/PUT/DELETE | /api/admin/events | Yes | Events CRUD |
| GET | /api/admin/users | Yes | All users |
| POST/PUT/DELETE | /api/admin/users | Yes | Users CRUD |
| GET | /api/admin/export/:bowl | Yes | Admin PDF download |

---

## Database Schema (Turso Cloud)

**Tables:**
- `events` - Events available for selection (name, description, color, isActive, isDefault)
- `schedule_entries` - Schedule data (date, bowl, startTime, endTime, eventId, createdBy, updatedBy)
- `users` - Admin users (username, displayName, passwordHash, role, isActive)
- `time_slots` - Legacy time slots (may be removed)
- `settings` - App settings key-value store

All database operations are async. API routes use `await` with Drizzle queries.

---

## Known Issues / Future Work

1. **Week navigation bug:** When clicking forward/back 4-5 weeks, first column may go blank until refresh
2. **Lock state persistence:** Currently client-side only
3. **Mobile export:** Works but captures single day view (could add week export option)
