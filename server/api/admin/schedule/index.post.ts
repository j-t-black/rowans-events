import { db, scheduleEntries } from '~~/server/database/db'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date, bowl, startTime, endTime, djId } = body

  if (!date || !bowl || !startTime || !endTime) {
    throw createError({
      statusCode: 400,
      message: 'Date, bowl, startTime, and endTime are required',
    })
  }

  // Check if entry exists for this date/bowl/startTime
  const [existing] = await db
    .select()
    .from(scheduleEntries)
    .where(
      and(
        eq(scheduleEntries.date, date),
        eq(scheduleEntries.bowl, bowl),
        eq(scheduleEntries.startTime, startTime)
      )
    )

  let result
  if (existing) {
    // Update existing entry
    const [updated] = await db
      .update(scheduleEntries)
      .set({
        endTime,
        djId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scheduleEntries.id, existing.id))
      .returning()
    result = updated
  } else {
    // Create new entry
    const [inserted] = await db
      .insert(scheduleEntries)
      .values({
        date,
        bowl,
        startTime,
        endTime,
        djId,
      })
      .returning()
    result = inserted
  }

  return result
})
