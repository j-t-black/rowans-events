import { db, timeSlots } from '~~/server/database/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  const [result] = await db
    .delete(timeSlots)
    .where(eq(timeSlots.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Time slot not found',
    })
  }

  return { success: true }
})
