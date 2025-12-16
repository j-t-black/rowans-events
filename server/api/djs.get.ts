import { db, djs } from '~~/server/database/db'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const djList = await db
    .select({
      id: djs.id,
      name: djs.name,
      isDefault: djs.isDefault,
    })
    .from(djs)
    .where(eq(djs.isActive, true))
    .orderBy(asc(djs.name))

  return djList
})
