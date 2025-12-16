import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Create libSQL client for Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://rowans-djs-j-t-black.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Create Drizzle instance with schema
export const db = drizzle(client, { schema })

// Export schema for convenience
export * from './schema'
