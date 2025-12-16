import { db, timeSlots } from '~~/server/database/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  const [result] = await db
    .update(timeSlots)
    .set({
      time: body.time,
      displayOrder: body.displayOrder,
      isDefault: body.isDefault,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(timeSlots.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Time slot not found',
    })
  }

  return result
})
