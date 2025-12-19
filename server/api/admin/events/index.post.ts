import { db, events } from '~~/server/database/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session.user?.id

  const body = await readBody(event)
  const { name, description, color, contactName, contactPhone, contactEmail, socialMedia, website, isActive, isDefault } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Name is required',
    })
  }

  const now = new Date().toISOString()
  const [result] = await db
    .insert(events)
    .values({
      name,
      description: description || null,
      color: color || null,
      contactName: contactName || null,
      contactPhone: contactPhone || null,
      contactEmail: contactEmail || null,
      socialMedia: socialMedia || null,
      website: website || null,
      isActive: isActive ?? true,
      isDefault: isDefault ?? false,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return result
})
