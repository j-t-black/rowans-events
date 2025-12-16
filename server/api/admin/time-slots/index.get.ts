import { db, timeSlots } from '~~/server/database/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const slots = await db
    .select()
    .from(timeSlots)
    .orderBy(asc(timeSlots.displayOrder))

  return slots
})
