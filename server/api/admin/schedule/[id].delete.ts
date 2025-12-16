import { db, scheduleEntries } from '~~/server/database/db'
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
    .delete(scheduleEntries)
    .where(eq(scheduleEntries.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Schedule entry not found',
    })
  }

  return { success: true }
})
