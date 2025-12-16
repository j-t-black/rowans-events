import { db, scheduleEntries, events } from '~~/server/database/db'
import { eq, and, gte, lte, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { startDate, endDate, date, bowl } = query

  let conditions = []

  if (date) {
    conditions.push(eq(scheduleEntries.date, date as string))
  } else if (startDate && endDate) {
    conditions.push(gte(scheduleEntries.date, startDate as string))
    conditions.push(lte(scheduleEntries.date, endDate as string))
  }

  if (bowl) {
    conditions.push(eq(scheduleEntries.bowl, bowl as string))
  }

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(scheduleEntries.date), asc(scheduleEntries.startTime))

  return entries
})
