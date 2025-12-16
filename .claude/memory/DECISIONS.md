# Architectural Decisions

## ADR-001: Start Fresh vs Migrate
**Decision**: Start fresh with new Nuxt 4 project
**Rationale**:
- Existing code is Vue 3 SPA (~800 lines)
- Nuxt 4 has different architecture
- UI components need complete rewrite for Nuxt UI Pro
- Data layer fundamentally different (localStorage → SQLite)
- Old code serves as reference only

## ADR-002: Database Choice
**Decision**: SQLite with Drizzle ORM
**Rationale**:
- Simple deployment (single file)
- No external database server needed
- Drizzle provides type-safe queries
- Easy migrations
- Sufficient for single-venue scheduling app

## ADR-003: PDF Generation
**Decision**: Server-side with PDFKit (light mode only)
**Rationale**:
- Clean vector-based PDFs
- Consistent output regardless of user's theme
- White background for printing
- Server-side generation is reliable

## ADR-004: JPG Export
**Decision**: Client-side with html2canvas
**Date**: December 9, 2024
**Rationale**:
- No server dependencies for image generation
- Captures user's current theme (dark/light)
- Shows exactly what user sees on screen
- 2x scale for high quality
- Mobile users prefer image format for sharing

## ADR-005: Authentication
**Decision**: nuxt-auth-utils with session cookies
**Rationale**:
- Simple username/password for admin
- Session-based (no JWT complexity)
- Built for Nuxt/Nitro
- Single admin user sufficient for this use case

## ADR-006: UI Framework
**Decision**: Nuxt UI 4 with inline styles for theming
**Rationale**:
- Native Nuxt integration
- Pre-built components
- Inline styles for reliable dark/light mode
- Avoids CSS variable conflicts

## ADR-007: Font Choice
**Decision**: Fira Code (monospace)
**Rationale**:
- User preference
- Good readability for schedules/times
- Modern aesthetic
- Self-hosted for reliability

## ADR-008: Theme System
**Decision**: Dark/light mode toggle with localStorage persistence
**Date**: December 2024
**Rationale**:
- User preference for both options
- PDF exports use light mode only (for printing)
- JPG exports capture current theme
- Theme-aware components via inline styles

## ADR-009: Week Structure
**Decision**: Wed-Sun (5 days), weeks start on Wednesday
**Rationale**:
- Matches venue operating schedule
- Carried over from existing app logic

## ADR-010: Mobile Navigation
**Decision**: Swipe-based day navigation with full-page touch detection
**Date**: December 9, 2024
**Rationale**:
- Natural mobile UX pattern (like carousel)
- Single day view avoids cramped grid
- Sticky header keeps navigation accessible
- Swipe works anywhere on page (not just header)
- Day indicator dots provide visual feedback
- 50px swipe threshold for deliberate gestures
- Buttons (‹ ›) provide alternative for non-swipe users

## ADR-011: Mobile Breakpoint
**Decision**: 768px breakpoint for mobile/desktop switch
**Date**: December 9, 2024
**Rationale**:
- Standard tablet breakpoint
- Below 768px: single-day swipe view
- Above 768px: 5-column grid view
- JavaScript-based detection (not CSS-only) for template switching

## ADR-012: Branding
**Decision**: "Rowans DJs" as site name
**Date**: December 9, 2024
**Rationale**:
- Cleaner than "Rowans Rota"
- Week title format: "Rowans DJs : Week Starting [date]"
- Logo is theme-aware (black in light mode, white in dark mode)
