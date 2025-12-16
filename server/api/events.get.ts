import { db, events } from '~~/server/database/db'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const eventList = await db
    .select({
      id: events.id,
      name: events.name,
      isDefault: events.isDefault,
    })
    .from(events)
    .where(eq(events.isActive, true))
    .orderBy(asc(events.name))

  return eventList
})
