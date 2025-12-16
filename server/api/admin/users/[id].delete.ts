import { db, users } from '~~/server/database/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  // Prevent deleting yourself
  if (session.user?.id === id) {
    throw createError({
      statusCode: 400,
      message: 'Cannot delete your own account',
    })
  }

  const [result] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return { success: true }
})
