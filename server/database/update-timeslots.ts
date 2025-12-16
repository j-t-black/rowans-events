import { db, timeSlots } from './db'
import { sql } from 'drizzle-orm'

async function updateTimeSlots() {
  console.log('Updating time slots...')

  // Clear existing time slots
  db.run(sql`DELETE FROM time_slots`)
  console.log('Cleared existing time slots')

  // All unique times (combined from all day types)
  // Frontend will filter based on day:
  // - Wed/Thu/Fri: 17:00, 18:00, 20:00, 20:30, 22:00, 22:30, 00:00, 00:30
  // - Saturday: 12:00, 14:00, 16:00, 18:00, 20:00, 22:00, 00:00
  // - Sunday: TBD
  const allSlots = [
    { time: '12:00', displayOrder: 1 },
    { time: '14:00', displayOrder: 2 },
    { time: '16:00', displayOrder: 3 },
    { time: '17:00', displayOrder: 4 },
    { time: '18:00', displayOrder: 5 },
    { time: '20:00', displayOrder: 6 },
    { time: '20:30', displayOrder: 7 },
    { time: '22:00', displayOrder: 8 },
    { time: '22:30', displayOrder: 9 },
    { time: '00:00', displayOrder: 10 },
    { time: '00:30', displayOrder: 11 },
  ]

  console.log('Inserting time slots...')
  for (const slot of allSlots) {
    db.insert(timeSlots).values(slot).run()
    console.log(`  Added: ${slot.time}`)
  }

  console.log('')
  console.log('Time slots updated successfully!')
  console.log('')
  console.log('Frontend filtering:')
  console.log('  Wed/Thu/Fri: 17:00, 18:00, 20:00, 20:30, 22:00, 22:30, 00:00, 00:30')
  console.log('  Saturday: 12:00, 14:00, 16:00, 18:00, 20:00, 22:00, 00:00')
  console.log('  Sunday: TBD')
}

updateTimeSlots().catch(console.error)
