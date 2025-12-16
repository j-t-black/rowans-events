import { db, users } from '~~/server/database/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))

  if (!user || !user.isActive) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role,
    },
  })

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role,
    },
  }
})
