export default defineEventHandler(async (event) => {
  // Only protect /api/admin routes
  if (!event.path.startsWith('/api/admin')) {
    return
  }

  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
})
