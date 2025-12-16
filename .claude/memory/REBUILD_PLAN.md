# Rowans Rota - Full Stack Rebuild Plan

## Current State Analysis

The existing application is a Vue 3 SPA with:
- **Storage**: localStorage only (no backend/database)
- **UI**: Inline text inputs for time/DJ names
- **PDF Export**: html2canvas + jsPDF (produces large file sizes ~2-5MB)
- **Auth**: None
- **API**: None
- **Days**: Wed-Sun (5 days)
- **Structure**: Upper Bowl + Lower Bowl, 7 time slots each per day

---

## Target Stack

| Layer | Technology |
|-------|------------|
| Frontend | Nuxt 4 |
| UI Framework | Nuxt UI 4 Pro |
| Backend/API | Nitro (built into Nuxt) |
| Database | SQLite (via Drizzle ORM) |
| Auth | nuxt-auth-utils |
| PDF Generation | @react-pdf/renderer or pdfmake (server-side) |
| Font | Fira Code (monospace) |
| Theme | Dark mode (minimal design) |

---

## Database Schema

### Tables

```sql
-- Time slots available for selection
CREATE TABLE time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL UNIQUE,        -- e.g., "22:00", "23:00", "00:00"
  display_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DJs available for selection
CREATE TABLE djs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Schedule entries
CREATE TABLE schedule_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,               -- ISO date: "2025-12-05"
  bowl TEXT NOT NULL,               -- "upper" or "lower"
  slot_number INTEGER NOT NULL,     -- 1-7
  time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE SET NULL,
  dj_id INTEGER REFERENCES djs(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, bowl, slot_number)
);

-- Admin users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App settings (for defaults)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Default Data Seeds

```javascript
// Default time slots
const defaultTimeSlots = [
  { time: "21:00", display_order: 1 },
  { time: "22:00", display_order: 2 },
  { time: "23:00", display_order: 3 },
  { time: "00:00", display_order: 4 },
  { time: "01:00", display_order: 5 },
  { time: "02:00", display_order: 6 },
  { time: "03:00", display_order: 7 },
];

// Settings
const defaultSettings = {
  default_time_slot_id: null,  // Can be set to a time_slot id
  default_dj_id: null,         // Can be set to a dj id
};
```

---

## API Endpoints

### Public API (for external Nuxt site)

```
GET /api/schedule
  Query params: ?week=2025-12-03 (Wednesday of week)
  Returns: Full week schedule for both bowls

GET /api/schedule/:date
  Returns: Schedule for specific date

GET /api/schedule/current
  Returns: Current week's schedule

GET /api/schedule/range
  Query params: ?start=2025-12-03&end=2025-12-15
  Returns: Schedule for date range
```

### Admin API (authenticated)

```
# Time Slots CRUD
GET    /api/admin/time-slots
POST   /api/admin/time-slots
PUT    /api/admin/time-slots/:id
DELETE /api/admin/time-slots/:id

# DJs CRUD
GET    /api/admin/djs
POST   /api/admin/djs
PUT    /api/admin/djs/:id
DELETE /api/admin/djs/:id

# Schedule Management
GET    /api/admin/schedule
POST   /api/admin/schedule        # Create/update entry
DELETE /api/admin/schedule/:id

# Settings
GET    /api/admin/settings
PUT    /api/admin/settings

# PDF Export (server-side generation)
GET    /api/admin/export/upper-bowl?week=2025-12-03
GET    /api/admin/export/lower-bowl?week=2025-12-03

# Auth
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
```

---

## Page Structure

```
pages/
├── index.vue                 # Public schedule view (read-only)
├── login.vue                 # Admin login page
└── admin/
    ├── index.vue             # Dashboard / Week schedule editor
    ├── time-slots.vue        # Manage time slots (CRUD)
    ├── djs.vue               # Manage DJs (CRUD)
    └── settings.vue          # App settings (defaults)
```

---

## Component Structure

```
components/
├── schedule/
│   ├── WeekPicker.vue        # Week selection component
│   ├── ScheduleGrid.vue      # Main 5-day grid
│   ├── DayColumn.vue         # Single day column
│   ├── BowlSection.vue       # Upper/Lower bowl section
│   ├── SlotCard.vue          # Individual slot (display mode)
│   └── SlotEditor.vue        # Slot with select dropdowns (edit mode)
├── admin/
│   ├── TimeSlotTable.vue     # CRUD table for time slots
│   ├── DjTable.vue           # CRUD table for DJs
│   └── ExportButtons.vue     # PDF export controls
├── ui/
│   ├── AppHeader.vue         # Header with nav
│   └── AppFooter.vue         # Footer
└── pdf/
    ├── UpperBowlPdf.vue      # PDF template for upper bowl
    └── LowerBowlPdf.vue      # PDF template for lower bowl
```

---

## UI/UX Specifications

### Theme

- **Mode**: Dark mode only (minimal)
- **Font**: Fira Code (monospace) for all text
- **Accent Color**: #d0232a (Rowans brand red)
- **Background**: Dark grey (#1a1a1a or similar)
- **Surface**: Slightly lighter grey (#2a2a2a)
- **Text**: Light grey (#e0e0e0) / White (#ffffff)
- **Border**: Subtle (#3a3a3a)

### Nuxt UI 4 Pro Configuration

```typescript
// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'red',
      neutral: 'zinc',
    },
    fonts: {
      sans: 'Fira Code',
      mono: 'Fira Code',
    },
  },
});
```

### Schedule Grid Layout

- 5 columns (Wed-Sun)
- Each column has:
  - Day header (day name + date)
  - Upper Bowl section (7 slots)
  - Lower Bowl section (7 slots)
- Each slot shows:
  - Time (from select dropdown)
  - DJ name (from select dropdown)
- Empty slots show dashed border

### Select Dropdowns (Admin)

- **Time Slot Select**: Lists all time slots from database
- **DJ Select**: Lists all active DJs from database
- Both have "Clear" option to unset
- Both can show "default" option based on settings

---

## PDF Export Specifications

### Requirements

- **Separate exports**: Upper Bowl PDF, Lower Bowl PDF
- **Small file size**: Target < 200KB per PDF
- **Server-side generation**: Use Nitro route handler
- **Format**: A4 or Letter, landscape orientation
- **Content**: Week header + 5-day grid for single bowl

### Implementation

Use `pdfmake` or `jspdf` on server-side (no html2canvas):

```typescript
// server/api/admin/export/[bowl].get.ts
import PDFDocument from 'pdfkit';

export default defineEventHandler(async (event) => {
  const bowl = getRouterParam(event, 'bowl'); // 'upper-bowl' or 'lower-bowl'
  const { week } = getQuery(event);

  // Fetch schedule data
  const schedule = await getScheduleForWeek(week, bowl);

  // Generate PDF programmatically (no DOM rendering)
  const pdf = generateSchedulePdf(schedule, bowl);

  // Return as downloadable PDF
  setHeader(event, 'Content-Type', 'application/pdf');
  setHeader(event, 'Content-Disposition', `attachment; filename=${bowl}-${week}.pdf`);
  return pdf;
});
```

### PDF Template

```
+----------------------------------------------------------+
|  ROWANS ROTA - UPPER BOWL                                 |
|  Week of December 3, 2025                                 |
+----------------------------------------------------------+
|  WED 3     |  THU 4     |  FRI 5     |  SAT 6    | SUN 7  |
+------------+------------+------------+-----------+--------+
|  22:00     |  22:00     |  22:00     |  21:00    | 21:00  |
|  DJ Alpha  |  DJ Beta   |  DJ Gamma  |  DJ Delta | DJ Echo|
+------------+------------+------------+-----------+--------+
|  23:00     |  23:00     |  23:00     |  22:00    | 22:00  |
|  DJ Foxtrot|  DJ Golf   |  DJ Hotel  |  DJ India | DJ Jul |
+------------+------------+------------+-----------+--------+
|  ... (7 rows total)                                       |
+----------------------------------------------------------+
```

---

## Authentication Flow

### Login

1. User navigates to `/login`
2. Enters username/password
3. Server validates credentials against `users` table
4. On success, creates session cookie via `nuxt-auth-utils`
5. Redirects to `/admin`

### Protected Routes

- All `/admin/*` routes require authentication
- Middleware checks session on each request
- Unauthorized users redirected to `/login`

### Session Management

```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user || !await verifyPassword(password, user.password_hash)) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' });
  }

  await setUserSession(event, {
    user: { id: user.id, username: user.username, role: user.role },
  });

  return { success: true };
});
```

---

## Project Structure

```
rowans-rota-v2/
├── nuxt.config.ts
├── app.config.ts
├── package.json
├── .env
├── server/
│   ├── database/
│   │   ├── schema.ts          # Drizzle schema
│   │   ├── migrations/        # SQL migrations
│   │   └── seed.ts            # Seed data
│   ├── api/
│   │   ├── schedule/
│   │   │   ├── index.get.ts   # Public: get week schedule
│   │   │   ├── [date].get.ts  # Public: get day schedule
│   │   │   └── current.get.ts # Public: current week
│   │   ├── admin/
│   │   │   ├── time-slots/
│   │   │   │   ├── index.get.ts
│   │   │   │   ├── index.post.ts
│   │   │   │   ├── [id].put.ts
│   │   │   │   └── [id].delete.ts
│   │   │   ├── djs/
│   │   │   │   ├── index.get.ts
│   │   │   │   ├── index.post.ts
│   │   │   │   ├── [id].put.ts
│   │   │   │   └── [id].delete.ts
│   │   │   ├── schedule/
│   │   │   │   ├── index.get.ts
│   │   │   │   ├── index.post.ts
│   │   │   │   └── [id].delete.ts
│   │   │   ├── settings/
│   │   │   │   ├── index.get.ts
│   │   │   │   └── index.put.ts
│   │   │   └── export/
│   │   │       └── [bowl].get.ts
│   │   └── auth/
│   │       ├── login.post.ts
│   │       ├── logout.post.ts
│   │       └── session.get.ts
│   ├── middleware/
│   │   └── auth.ts            # Protect admin routes
│   └── utils/
│       ├── db.ts              # Database connection
│       └── pdf.ts             # PDF generation utilities
├── pages/
│   ├── index.vue
│   ├── login.vue
│   └── admin/
│       ├── index.vue
│       ├── time-slots.vue
│       ├── djs.vue
│       └── settings.vue
├── components/
│   └── (as outlined above)
├── composables/
│   ├── useSchedule.ts
│   ├── useTimeSlots.ts
│   ├── useDjs.ts
│   └── useAuth.ts
├── middleware/
│   └── auth.ts                # Client-side auth guard
├── assets/
│   └── css/
│       └── main.css           # Global styles, Fira Code import
└── public/
    └── fonts/
        └── FiraCode/          # Self-hosted Fira Code
```

---

## Implementation Steps

### Phase 1: Project Setup

1. Create new Nuxt 4 project
2. Install dependencies:
   - `@nuxt/ui` (Nuxt UI 4 Pro)
   - `drizzle-orm`, `better-sqlite3`
   - `nuxt-auth-utils`
   - `pdfmake` or `pdfkit`
3. Configure Nuxt UI with dark theme
4. Set up Fira Code font
5. Configure Drizzle ORM with SQLite

### Phase 2: Database & API

1. Create Drizzle schema
2. Run migrations
3. Seed default data (time slots)
4. Implement public schedule API endpoints
5. Implement admin CRUD endpoints
6. Implement auth endpoints

### Phase 3: Admin Interface

1. Create login page
2. Set up auth middleware
3. Build admin dashboard with schedule editor
4. Implement time slots management page
5. Implement DJs management page
6. Implement settings page

### Phase 4: Schedule Editor

1. Build week picker component
2. Build schedule grid with select dropdowns
3. Implement slot editing with time/DJ selects
4. Add default value handling
5. Auto-save on selection change

### Phase 5: PDF Export

1. Create PDF generation utility
2. Implement upper bowl export endpoint
3. Implement lower bowl export endpoint
4. Add export buttons to admin UI
5. Optimize for small file size

### Phase 6: Public View

1. Build read-only schedule view
2. Style with dark theme
3. Add responsive layout

### Phase 7: Testing & Polish

1. Test all CRUD operations
2. Test authentication flow
3. Test PDF exports
4. Test public API
5. Responsive design testing
6. Performance optimization

---

## Dependencies

```json
{
  "dependencies": {
    "nuxt": "^4.0.0",
    "@nuxt/ui": "^3.0.0",
    "drizzle-orm": "^0.30.0",
    "better-sqlite3": "^9.4.0",
    "nuxt-auth-utils": "^0.1.0",
    "pdfmake": "^0.2.9",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.0",
    "@types/better-sqlite3": "^7.6.8",
    "@types/bcrypt": "^5.0.2"
  }
}
```

---

## Environment Variables

```env
# .env
DATABASE_URL=file:./data/rowans.db
NUXT_SESSION_PASSWORD=your-32-char-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=initial-password-change-me
```

---

## Notes for Implementation

1. **Nuxt 4 Compatibility**: Ensure all modules support Nuxt 4 (check latest versions)
2. **Nuxt UI Pro License**: Requires Pro license for full component access
3. **SQLite Location**: Store database in `./data/` directory (gitignored)
4. **PDF File Size**: Use vector-based PDF generation (not image-based) for small files
5. **CORS**: Configure for external site API access if needed
6. **Migration from Old App**: Optional data import script from localStorage JSON

---

## Public API Response Format

```typescript
// GET /api/schedule?week=2025-12-03
{
  "week_start": "2025-12-03",
  "days": [
    {
      "date": "2025-12-03",
      "day_name": "Wednesday",
      "upper_bowl": [
        { "slot": 1, "time": "22:00", "dj": "DJ Alpha" },
        { "slot": 2, "time": "23:00", "dj": "DJ Beta" },
        // ...
      ],
      "lower_bowl": [
        { "slot": 1, "time": "22:00", "dj": "DJ Gamma" },
        // ...
      ]
    },
    // ... 4 more days
  ]
}
```

This format allows the external Nuxt site to easily consume and display the schedule.
