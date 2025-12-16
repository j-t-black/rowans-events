import { db, scheduleEntries, events } from '~~/server/database/db'
import { eq, and, gte, lte, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { startDate, endDate } = query

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: 'startDate and endDate query params are required',
    })
  }

  // Fetch all schedule entries for the date range with event info
  const entries = await db
    .select({
      id: scheduleEntries.id,
      date: scheduleEntries.date,
      bowl: scheduleEntries.bowl,
      startTime: scheduleEntries.startTime,
      endTime: scheduleEntries.endTime,
      event: events.name,
    })
    .from(scheduleEntries)
    .leftJoin(events, eq(scheduleEntries.eventId, events.id))
    .where(
      and(
        gte(scheduleEntries.date, startDate as string),
        lte(scheduleEntries.date, endDate as string)
      )
    )
    .orderBy(asc(scheduleEntries.date), asc(scheduleEntries.bowl), asc(scheduleEntries.startTime))

  return entries
})
