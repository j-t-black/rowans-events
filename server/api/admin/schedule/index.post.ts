import { db, scheduleEntries } from '~~/server/database/db'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session.user?.id

  const body = await readBody(event)
  const { id, date, bowl, startTime, endTime, eventId } = body

  if (!date || !bowl || !startTime || !endTime) {
    throw createError({
      statusCode: 400,
      message: 'Date, bowl, startTime, and endTime are required',
    })
  }

  // Check if entry exists - by ID first, then by date/bowl/startTime
  let existing
  if (id) {
    const [byId] = await db
      .select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.id, id))
    existing = byId
  } else {
    const [byFields] = await db
      .select()
      .from(scheduleEntries)
      .where(
        and(
          eq(scheduleEntries.date, date),
          eq(scheduleEntries.bowl, bowl),
          eq(scheduleEntries.startTime, startTime)
        )
      )
    existing = byFields
  }

  let result
  if (existing) {
    // Update existing entry
    const [updated] = await db
      .update(scheduleEntries)
      .set({
        endTime,
        eventId,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scheduleEntries.id, existing.id))
      .returning()
    result = updated
  } else {
    // Create new entry
    const now = new Date().toISOString()
    const [inserted] = await db
      .insert(scheduleEntries)
      .values({
        date,
        bowl,
        startTime,
        endTime,
        eventId,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    result = inserted
  }

  return result
})
