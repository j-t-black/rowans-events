import { db, scheduleEntries, events, users } from '~~/server/database/db'
import { eq, and, gte, lte, asc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { startDate, endDate, date, bowl } = query

  // Create aliases for user joins
  const createdByUser = alias(users, 'created_by_user')
  const updatedByUser = alias(users, 'updated_by_user')

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
      eventId: scheduleEntries.eventId,
      eventName: events.name,
      createdBy: scheduleEntries.createdBy,
      createdByName: createdByUser.displayName,
      createdByUsername: createdByUser.username,
      updatedBy: scheduleEntries.updatedBy,
      updatedByName: updatedByUser.displayName,
      updatedByUsername: updatedByUser.username,
      createdAt: scheduleEntries.createdAt,
      updatedAt: scheduleEntries.updatedAt,
    })
    .from(scheduleEntries)
    .leftJoin(events, eq(scheduleEntries.eventId, events.id))
    .leftJoin(createdByUser, eq(scheduleEntries.createdBy, createdByUser.id))
    .leftJoin(updatedByUser, eq(scheduleEntries.updatedBy, updatedByUser.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(scheduleEntries.date), asc(scheduleEntries.startTime))

  return entries
})
