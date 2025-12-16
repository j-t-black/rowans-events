import { db, djs } from '~~/server/database/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, instagram, whatsapp, avatar, isActive, isDefault } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Name is required',
    })
  }

  const [result] = await db
    .insert(djs)
    .values({
      name,
      email: email || null,
      instagram: instagram || null,
      whatsapp: whatsapp || null,
      avatar: avatar || null,
      isActive: isActive ?? true,
      isDefault: isDefault ?? false,
    })
    .returning()

  return result
})
