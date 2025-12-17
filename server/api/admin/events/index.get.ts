import { db, events, users } from '~~/server/database/db'
import { asc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'

export default defineEventHandler(async () => {
  const createdByUser = alias(users, 'createdByUser')
  const updatedByUser = alias(users, 'updatedByUser')

  const eventList = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      color: events.color,
      isActive: events.isActive,
      isDefault: events.isDefault,
      createdBy: events.createdBy,
      createdByName: createdByUser.displayName,
      createdByUsername: createdByUser.username,
      updatedBy: events.updatedBy,
      updatedByName: updatedByUser.displayName,
      updatedByUsername: updatedByUser.username,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .leftJoin(createdByUser, eq(events.createdBy, createdByUser.id))
    .leftJoin(updatedByUser, eq(events.updatedBy, updatedByUser.id))
    .orderBy(asc(events.name))

  return eventList
})
