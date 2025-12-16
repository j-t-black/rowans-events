import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Time slots available for selection
export const timeSlots = sqliteTable('time_slots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  time: text('time').notNull().unique(), // e.g., "22:00"
  displayOrder: integer('display_order').default(0),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// DJs available for selection
export const djs = sqliteTable('djs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  email: text('email'),
  instagram: text('instagram'), // Instagram handle (without @)
  whatsapp: text('whatsapp'),   // WhatsApp number
  avatar: text('avatar'),       // URL to avatar image
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Schedule entries
export const scheduleEntries = sqliteTable('schedule_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // ISO date: "2025-12-05"
  bowl: text('bowl').notNull(), // "upper" or "lower"
  startTime: text('start_time').notNull(), // "17:00"
  endTime: text('end_time').notNull(), // "20:00"
  djId: integer('dj_id').references(() => djs.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Admin users
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// App settings
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

// Type exports for TypeScript
export type TimeSlot = typeof timeSlots.$inferSelect
export type NewTimeSlot = typeof timeSlots.$inferInsert
export type DJ = typeof djs.$inferSelect
export type NewDJ = typeof djs.$inferInsert
export type ScheduleEntry = typeof scheduleEntries.$inferSelect
export type NewScheduleEntry = typeof scheduleEntries.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Setting = typeof settings.$inferSelect
