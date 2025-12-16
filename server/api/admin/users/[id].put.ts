import { db, users } from '~~/server/database/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  // Build update object
  const updateData: Record<string, any> = {
    username: body.username,
    displayName: body.displayName || null,
    role: body.role,
    isActive: body.isActive,
  }

  // Only hash and update password if provided
  if (body.password) {
    updateData.passwordHash = await bcrypt.hash(body.password, 10)
  }

  const [result] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return result
})
