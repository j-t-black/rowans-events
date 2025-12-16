import { db, users } from '~~/server/database/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, displayName, password, role, isActive } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10)

  const [result] = await db
    .insert(users)
    .values({
      username,
      displayName: displayName || null,
      passwordHash,
      role: role || 'admin',
      isActive: isActive ?? true,
    })
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  return result
})
