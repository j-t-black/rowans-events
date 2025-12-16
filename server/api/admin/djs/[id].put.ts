import { db, djs } from '~~/server/database/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID',
    })
  }

  const [result] = await db
    .update(djs)
    .set({
      name: body.name,
      email: body.email || null,
      instagram: body.instagram || null,
      whatsapp: body.whatsapp || null,
      avatar: body.avatar || null,
      isActive: body.isActive,
      isDefault: body.isDefault,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(djs.id, id))
    .returning()

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'DJ not found',
    })
  }

  return result
})
