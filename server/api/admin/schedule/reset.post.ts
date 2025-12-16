import { db, scheduleEntries } from '~~/server/database/db'
import { and, eq, gte, lte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Check auth
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { bowl, startDate, endDate } = body

  if (!bowl || !startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  // Delete all schedule entries for this bowl within the date range
  await db.delete(scheduleEntries)
    .where(
      and(
        eq(scheduleEntries.bowl, bowl),
        gte(scheduleEntries.date, startDate),
        lte(scheduleEntries.date, endDate)
      )
    )

  return { success: true, message: `Reset ${bowl} bowl schedule for ${startDate} to ${endDate}` }
})
