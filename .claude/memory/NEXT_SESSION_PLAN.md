# Next Session Plan - Rowans DJs

**Last Updated:** December 9, 2024
**Status:** Feature complete, ready for production testing
**Repo:** https://github.com/j-t-black/rowans-rota-v2

---

## How to Resume

Tell Claude: **"Read .claude/memory/CURRENT_STATE.md to get up to speed"**

---

## Session Summary - What We Did (Dec 9, 2024)

### JPG Export Toggle
- Added html2canvas for client-side image capture
- Created sliding toggle UI: `[PDF ●───○ JPG]`
- JPG captures current theme (dark/light)
- 2x scale for high quality output

### Mobile Responsive View
- Single-day swipe navigation (<768px)
- Sticky day header at top
- Full-page swipe detection (not just header)
- Arrow buttons (‹ ›) for day navigation
- Day indicator dots (tappable)
- Prev/Next Week buttons
- Upper/Lower Bowl stacked vertically

### Branding & Styling
- Renamed to "Rowans DJs"
- Week title: "Rowans DJs : Week Starting [date]"
- Increased font sizes and weights across the board
- Theme-aware logo (black in light, white in dark)
- Single centered bowl titles (not repeated across columns)

### Initial Commit & Push
- Created GitHub repo: j-t-black/rowans-rota-v2 (private)
- Initial commit with all features

---

## Potential Future Improvements

### High Priority
1. **Week navigation bug** - Going 4-5 weeks forward can blank first column (needs investigation)
2. **Production deployment** - Set up hosting (Vercel, Railway, etc.)
3. **Real data entry** - Populate with actual DJ schedules

### Medium Priority
4. **Mobile week export** - Currently exports single day; could add option to export full week
5. **Lock state persistence** - Save to localStorage so it persists across sessions
6. **Admin mobile view** - Admin page isn't optimized for mobile yet

### Low Priority / Nice to Have
7. **DJ photos** - Add avatar display to schedule cells
8. **Notifications** - Email/WhatsApp reminders to DJs
9. **History view** - Browse past weeks easily
10. **Print styles** - Optimize for direct browser printing

---

## Key File Locations

- **Public page:** `app/pages/index.vue`
- **Admin schedule:** `app/pages/admin/index.vue`
- **Theme composable:** `app/composables/useTheme.ts`
- **Public PDF export:** `server/api/export/[bowl].get.ts`
- **Admin PDF export:** `server/api/admin/export/[bowl].get.ts`
- **Public schedule API:** `server/api/schedule.get.ts`
- **Populate API:** `server/api/admin/schedule/populate.post.ts`

---

## Quick Start for Next Session

```bash
cd /Users/jtblack/dev/rowans-rota-v2
npm run dev
# App at http://localhost:3001/
# Login: admin / changeme
```

---

## Git Commands

```bash
git status                    # Check changes
git add . && git commit -m "message"  # Commit
git push                      # Push to GitHub
```
