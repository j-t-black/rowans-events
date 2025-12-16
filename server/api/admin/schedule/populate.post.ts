import { db, scheduleEntries, events } from '~~/server/database/db'
import { eq, and } from 'drizzle-orm'

// Default time slots by day and bowl - now as {startTime, endTime} tuples
const weekdayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '17:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
  upper: [
    { startTime: '18:00', endTime: '20:30' },
    { startTime: '20:30', endTime: '22:30' },
    { startTime: '22:30', endTime: '00:30' },
    { startTime: '00:30', endTime: '02:30' },
  ],
}

const saturdayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '12:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
  upper: [
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
}

const sundayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '12:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:30' },
  ],
  upper: [
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
  ],
}

function getDefaultSlotsForDateAndBowl(dateStr: string, bowl: string): Array<{ startTime: string; endTime: string }> {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  if (dayOfWeek >= 3 && dayOfWeek <= 5) return weekdayDefaults[bowl] || []
  if (dayOfWeek === 6) return saturdayDefaults[bowl] || []
  if (dayOfWeek === 0) return sundayDefaults[bowl] || []
  return weekdayDefaults[bowl] || []
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session.user?.id

  const body = await readBody(event)
  const { bowl, startDate, endDate } = body

  if (!bowl || !startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: 'bowl, startDate, and endDate are required',
    })
  }

  // Fetch default event
  const [defaultEvent] = await db
    .select()
    .from(events)
    .where(eq(events.isDefault, true))

  if (!defaultEvent) {
    throw createError({
      statusCode: 400,
      message: 'No default event configured',
    })
  }

  // Generate dates for the week
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0] ?? '')
  }

  let created = 0
  let skipped = 0

  for (const date of dates) {
    const slots = getDefaultSlotsForDateAndBowl(date, bowl)

    for (const slot of slots) {
      // Check if entry already exists for this date/bowl/startTime
      const [existing] = await db
        .select()
        .from(scheduleEntries)
        .where(
          and(
            eq(scheduleEntries.date, date),
            eq(scheduleEntries.bowl, bowl),
            eq(scheduleEntries.startTime, slot.startTime)
          )
        )

      if (existing) {
        skipped++
        continue
      }

      // Create new entry with start/end times directly
      await db.insert(scheduleEntries)
        .values({
          date,
          bowl,
          startTime: slot.startTime,
          endTime: slot.endTime,
          eventId: defaultEvent.id,
          createdBy: userId,
          updatedBy: userId,
        })

      created++
    }
  }

  return { created, skipped, bowl, startDate, endDate }
})
