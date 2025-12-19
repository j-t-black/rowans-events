import { db, events } from '~~/server/database/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session.user?.id

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  const [result] = await db
    .update(events)
    .set({
      name: body.name,
      description: body.description || null,
      color: body.color || null,
      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      contactEmail: body.contactEmail || null,
      socialMedia: body.socialMedia || null,
      website: body.website || null,
      isActive: body.isActive,
      isDefault: body.isDefault,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(events.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Event not found',
    })
  }

  return result
})
