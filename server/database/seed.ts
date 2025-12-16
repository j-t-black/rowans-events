import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { timeSlots, djs, users, settings } from './schema'
import bcrypt from 'bcryptjs'

// Create client for seeding
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://rowans-djs-j-t-black.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client)

async function seed() {
  console.log('Seeding database...')

  // Default time slots - all ranges
  const defaultTimeSlots = [
    // Weekday ranges (Wed-Fri)
    { time: '17:00-20:00', displayOrder: 1 },  // Lower Bowl slot 1
    { time: '18:00-20:30', displayOrder: 2 },  // Upper Bowl slot 1
    { time: '20:00-22:00', displayOrder: 3 },  // Lower Bowl slot 2
    { time: '20:30-22:30', displayOrder: 4 },  // Upper Bowl slot 2
    { time: '22:00-00:00', displayOrder: 5 },  // Lower Bowl slot 3
    { time: '22:30-00:30', displayOrder: 6 },  // Upper Bowl slot 3
    { time: '00:00-02:30', displayOrder: 7 },  // Lower/Upper Bowl slot 4
    { time: '00:30-02:30', displayOrder: 8 },  // Upper Bowl slot 4
    // Saturday ranges - Lower Bowl (5 slots: 12-18, 18-20, 20-22, 22-00, 00-02:30)
    { time: '12:00-18:00', displayOrder: 9 },  // Lower Bowl slot 1
    { time: '18:00-20:00', displayOrder: 10 }, // Lower/Upper Bowl slot 2/3
    { time: '20:00-22:00', displayOrder: 11 }, // Lower/Upper Bowl slot 3/4 (shared with weekday)
    // Saturday ranges - Upper Bowl
    { time: '14:00-16:00', displayOrder: 13 }, // Upper Bowl slot 1
    { time: '16:00-18:00', displayOrder: 14 }, // Upper Bowl slot 2
    { time: '22:00-00:00', displayOrder: 15 }, // Upper Bowl slot 5 (shared with weekday)
    { time: '00:00-02:30', displayOrder: 16 }, // Upper Bowl slot 6 (shared)
    // Sunday ranges (mostly shared with Saturday)
    // Lower: 12:00-18:00, 18:00-20:00, 20:00-22:00, 22:00-00:30
    // Upper: 14:00-16:00, 16:00-18:00
    { time: '22:00-00:30', displayOrder: 17 }, // Sunday Lower Bowl slot 4 (unique)
  ]

  console.log('Inserting time slots...')
  for (const slot of defaultTimeSlots) {
    try {
      await db.insert(timeSlots).values(slot)
    } catch (e) {
      // Ignore duplicates
    }
  }

  // Sample DJs (optional)
  const sampleDJs = [
    { name: 'TBA', isActive: true, isDefault: true },
  ]

  console.log('Inserting sample DJs...')
  for (const dj of sampleDJs) {
    try {
      await db.insert(djs).values(dj)
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
    { key: 'default_dj_id', value: '' },
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
