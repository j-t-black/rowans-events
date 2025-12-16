import { db, users } from '~~/server/database/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const userList = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.username))

  return userList
})
