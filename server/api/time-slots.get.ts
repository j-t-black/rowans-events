import { db, timeSlots } from '~~/server/database/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const slots = await db
    .select({
      id: timeSlots.id,
      time: timeSlots.time,
      isDefault: timeSlots.isDefault,
    })
    .from(timeSlots)
    .orderBy(asc(timeSlots.displayOrder))

  return slots
})
