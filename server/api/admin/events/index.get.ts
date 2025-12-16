import { db, events } from '~~/server/database/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const eventList = await db
    .select()
    .from(events)
    .orderBy(asc(events.name))

  return eventList
})
