import { db, djs } from '~~/server/database/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const djList = await db
    .select()
    .from(djs)
    .orderBy(asc(djs.name))

  return djList
})
