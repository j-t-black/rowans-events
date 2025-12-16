import { db, timeSlots } from '~~/server/database/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { time, displayOrder, isDefault } = body

  if (!time) {
    throw createError({
      statusCode: 400,
      message: 'Time is required',
    })
  }

  const [result] = await db
    .insert(timeSlots)
    .values({
      time,
      displayOrder: displayOrder ?? 0,
      isDefault: isDefault ?? false,
    })
    .returning()

  return result
})
