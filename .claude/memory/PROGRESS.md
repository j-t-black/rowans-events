# Rowans Events - Progress Log

## Completed Features

### Core Infrastructure
- [x] Nuxt 4.2 project setup
- [x] Turso cloud database integration
- [x] Drizzle ORM schema (time_slots, events, schedule_entries, users, settings)
- [x] nuxt-auth-utils session management
- [x] Admin middleware protection
- [x] Admin CRUD endpoints (time-slots, events, users, schedule)

### Public Schedule View
- [x] Desktop 5-column grid (Wed-Sun)
- [x] Mobile swipe navigation
- [x] Week selector with date picker
- [x] Dark/light theme toggle
- [x] Smoke trail cursor effect
- [x] Red glow on text when smoke passes
- [x] PDF export (server-side PDFKit)
- [x] JPG export (client-side html2canvas)
- [x] PDF/JPG toggle switch

### Admin Features
- [x] Schedule editor grid
- [x] Events management page (CRUD)
- [x] Users management page (CRUD)
- [x] Time slot management (legacy)
- [x] Event dropdowns in schedule
- [x] Week navigation
- [x] Lock/Unlock weeks
- [x] Reset week function
- [x] Populate week with defaults
- [x] User tracking (created_by, updated_by)

### Styling
- [x] Fira Code monospace font
- [x] Dark theme (#0a0a0a background)
- [x] Light theme (#f5f5f5 background)
- [x] Accent color (#d0232a)
- [x] Hover effects with glow
- [x] Theme persistence (localStorage)

## Migration from DJs to Events (Dec 2025)
- [x] Renamed database table from `djs` to `events`
- [x] Updated schema with new fields (description, color)
- [x] Updated all API endpoints from `/api/djs` to `/api/events`
- [x] Updated frontend components to use "events" terminology
- [x] Added user management functionality
- [x] Updated all documentation and memory files

## Known Issues
1. Week navigation bug with 4-5 week jumps
2. Lock state is client-side only
3. Mobile export captures single day only

## Next Steps
- Consider removing legacy time_slots table
- Add lock state persistence to database
- Implement full week mobile export option
