import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { timeSlots, events, users, settings } from './schema'
import bcrypt from 'bcryptjs'

// Create client for seeding
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client)

async function seed() {
  console.log('Seeding database...')

  // Default time slots - all ranges (legacy, kept for reference)
  const defaultTimeSlots = [
    { time: '17:00-20:00', displayOrder: 1 },
    { time: '18:00-20:30', displayOrder: 2 },
    { time: '20:00-22:00', displayOrder: 3 },
    { time: '20:30-22:30', displayOrder: 4 },
    { time: '22:00-00:00', displayOrder: 5 },
    { time: '22:30-00:30', displayOrder: 6 },
    { time: '00:00-02:30', displayOrder: 7 },
    { time: '00:30-02:30', displayOrder: 8 },
    { time: '12:00-18:00', displayOrder: 9 },
    { time: '18:00-20:00', displayOrder: 10 },
    { time: '14:00-16:00', displayOrder: 13 },
    { time: '16:00-18:00', displayOrder: 14 },
    { time: '22:00-00:30', displayOrder: 17 },
  ]

  console.log('Inserting time slots...')
  for (const slot of defaultTimeSlots) {
    try {
      await db.insert(timeSlots).values(slot)
    } catch (e) {
      // Ignore duplicates
    }
  }

  // Sample events
  const sampleEvents = [
    { name: 'TBA', isActive: true, isDefault: true },
  ]

  console.log('Inserting sample events...')
  for (const evt of sampleEvents) {
    try {
      await db.insert(events).values(evt)
    } catch (e) {
      // Ignore duplicates
    }
  }

  // Create admin user
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  console.log('Creating admin user...')
  try {
    await db.insert(users).values({
      username: adminUsername,
      passwordHash,
      role: 'admin',
    })
    console.log(`Admin user created: ${adminUsername}`)
  } catch (e) {
    console.log('Admin user already exists')
  }

  // Default settings
  const defaultSettings = [
    { key: 'default_time_slot_id', value: '' },
    { key: 'default_event_id', value: '' },
  ]

  console.log('Inserting default settings...')
  for (const setting of defaultSettings) {
    try {
      await db.insert(settings).values(setting)
    } catch (e) {
      // Ignore duplicates
    }
  }

  console.log('Database seeded successfully!')
}

seed().catch(console.error)
