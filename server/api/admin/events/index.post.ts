import { db, events } from '~~/server/database/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, color, isActive, isDefault } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Name is required',
    })
  }

  const [result] = await db
    .insert(events)
    .values({
      name,
      description: description || null,
      color: color || null,
      isActive: isActive ?? true,
      isDefault: isDefault ?? false,
    })
    .returning()

  return result
})
