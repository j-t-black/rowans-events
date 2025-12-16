# Create Nitro API Route

Create a new Nitro API route for this Nuxt 4 project.

## Context
- This project uses Drizzle ORM with SQLite
- Database utilities are in `server/database/`
- Schema is in `server/database/schema.ts`
- Use `defineEventHandler` for route handlers
- Admin routes should use `requireUserSession(event)` for auth

## Patterns

### GET route
```typescript
export default defineEventHandler(async (event) => {
  const items = await db.select().from(tableName)
  return items
})
```

### POST route
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = await db.insert(tableName).values(body).returning()
  return result[0]
})
```

### Protected admin route
```typescript
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  // ... handler logic
})
```

Please specify:
1. Route path (e.g., `/api/admin/djs`)
2. HTTP method (GET, POST, PUT, DELETE)
3. Whether it needs auth protection
4. What data it should handle
