<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { isDark } = useTheme()

interface Event {
  id: number
  name: string
  isDefault: boolean
}

interface ScheduleEntry {
  id?: number
  date: string
  bowl: string
  startTime: string
  endTime: string
  eventId: number | null
  eventName?: string
}

// Week management
const currentWeekStart = ref(getThisWednesday())

function getThisWednesday() {
  const today = new Date()
  const day = today.getDay()
  const diff = (day >= 3 ? day - 3 : day + 4)
  const wed = new Date(today)
  wed.setDate(today.getDate() - diff)
  return formatDate(wed)
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

function getWeekDates(startDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  for (let i = 0; i < 5; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(formatDate(d))
  }
  return dates
}

const weekDates = computed(() => getWeekDates(currentWeekStart.value))

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = days[date.getDay()]
  return `${day} ${date.getDate()}/${date.getMonth() + 1}`
}

function prevWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = formatDate(d)
}

function nextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = formatDate(d)
}

// Time options for dropdowns (30-min increments from 12:00 to 02:30)
const timeOptions = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30',
]

// Default slots by day and bowl
const weekdayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '17:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
  upper: [
    { startTime: '18:00', endTime: '20:30' },
    { startTime: '20:30', endTime: '22:30' },
    { startTime: '22:30', endTime: '00:30' },
    { startTime: '00:30', endTime: '02:30' },
  ],
}

const saturdayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '12:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
  upper: [
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:00' },
    { startTime: '00:00', endTime: '02:30' },
  ],
}

const sundayDefaults: Record<string, Array<{ startTime: string; endTime: string }>> = {
  lower: [
    { startTime: '12:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
    { startTime: '20:00', endTime: '22:00' },
    { startTime: '22:00', endTime: '00:30' },
  ],
  upper: [
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
  ],
}

function getDefaultSlotsForDateAndBowl(dateStr: string, bowl: string): Array<{ startTime: string; endTime: string }> {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  if (dayOfWeek >= 3 && dayOfWeek <= 5) return weekdayDefaults[bowl] || []
  if (dayOfWeek === 6) return saturdayDefaults[bowl] || []
  if (dayOfWeek === 0) return sundayDefaults[bowl] || []
  return weekdayDefaults[bowl] || []
}

// Fetch Events
const { data: eventsList, status: eventsStatus } = await useFetch<Event[]>('/api/events')

const isDataReady = computed(() => eventsStatus.value === 'success' && eventsList.value)

const defaultEventId = computed(() =>
  eventsList.value?.find(e => e.isDefault)?.id || eventsList.value?.[0]?.id || null
)

// Fetch schedule
const { data: schedule, refresh: refreshSchedule } = await useFetch<ScheduleEntry[]>('/api/admin/schedule', {
  query: computed(() => ({
    startDate: weekDates.value[0],
    endDate: weekDates.value[4],
  })),
  watch: [weekDates],
})

// Get entries for a specific date/bowl, sorted by startTime
function getEntriesForDateAndBowl(date: string, bowl: string): ScheduleEntry[] {
  const entries = schedule.value?.filter(e => e.date === date && e.bowl === bowl) || []
  return entries.sort((a, b) => {
    // Sort by start time, handling midnight crossover
    const aMinutes = timeToMinutes(a.startTime)
    const bMinutes = timeToMinutes(b.startTime)
    return aMinutes - bMinutes
  })
}

// Convert time string to minutes for sorting (handles 00:00-02:30 as late night)
function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const mins = parts[1] ?? 0
  // Times 00:00-02:30 are late night, so add 24 hours for sorting
  if (hours < 12) return (hours + 24) * 60 + mins
  return hours * 60 + mins
}

// Get slots to display - actual entries or defaults if none exist
function getSlotsForDateAndBowl(date: string, bowl: string): Array<ScheduleEntry | { startTime: string; endTime: string; isDefault: true }> {
  const entries = getEntriesForDateAndBowl(date, bowl)
  if (entries.length > 0) return entries
  // Return defaults with marker
  return getDefaultSlotsForDateAndBowl(date, bowl).map(d => ({ ...d, isDefault: true as const }))
}

// Check if slot is a default (not saved)
function isDefaultSlot(slot: any): slot is { startTime: string; endTime: string; isDefault: true } {
  return slot.isDefault === true
}

// Create or update entry
async function saveEntry(date: string, bowl: string, startTime: string, endTime: string, eventId: number | null) {
  await $fetch('/api/admin/schedule', {
    method: 'POST',
    body: { date, bowl, startTime, endTime, eventId },
  })
  await refreshSchedule()
}

// Delete entry
async function deleteEntry(id: number) {
  await $fetch(`/api/admin/schedule/${id}`, { method: 'DELETE' })
  await refreshSchedule()
}

// Handle time change - creates entry if default, updates if existing
async function handleTimeChange(date: string, bowl: string, slot: any, field: 'startTime' | 'endTime', value: string) {
  if (isDefaultSlot(slot)) {
    // Create new entry from default
    const eventId = defaultEventId.value
    const startTime = field === 'startTime' ? value : slot.startTime
    const endTime = field === 'endTime' ? value : slot.endTime
    await saveEntry(date, bowl, startTime, endTime, eventId)
  } else {
    // Update existing entry
    const startTime = field === 'startTime' ? value : slot.startTime
    const endTime = field === 'endTime' ? value : slot.endTime
    await saveEntry(date, bowl, startTime, endTime, slot.eventId)
  }
}

// Handle Event change
async function handleEventChange(date: string, bowl: string, slot: any, eventId: number | null) {
  if (isDefaultSlot(slot)) {
    // Create new entry from default
    await saveEntry(date, bowl, slot.startTime, slot.endTime, eventId)
  } else {
    // Update existing entry
    await saveEntry(date, bowl, slot.startTime, slot.endTime, eventId)
  }
}

// Add new slot
async function addSlot(date: string, bowl: string) {
  // Find a reasonable default time that's not already used
  const existing = getEntriesForDateAndBowl(date, bowl)
  const usedTimes = new Set(existing.map(e => e.startTime))

  // Find first available time
  let startTime = '20:00'
  let endTime = '22:00'
  for (const time of timeOptions) {
    if (!usedTimes.has(time)) {
      startTime = time
      // Set end time 2 hours later
      const idx = timeOptions.indexOf(time)
      endTime = timeOptions[Math.min(idx + 4, timeOptions.length - 1)] ?? '02:30'
      break
    }
  }

  await saveEntry(date, bowl, startTime, endTime, defaultEventId.value)
}

// Handle delete - if last entry, reset shows defaults automatically
async function handleDelete(date: string, bowl: string, slot: any) {
  if (!isDefaultSlot(slot) && slot.id) {
    await deleteEntry(slot.id)
  }
}

const bowls = ['lower', 'upper'] as const

// Lock state
const lockedWeeks = ref<Record<string, boolean>>({})

function getLockKey(bowl: string): string {
  return `${bowl}-${currentWeekStart.value}`
}

function isWeekLocked(bowl: string): boolean {
  return lockedWeeks.value[getLockKey(bowl)] || false
}

function toggleLock(bowl: string) {
  const key = getLockKey(bowl)
  lockedWeeks.value[key] = !lockedWeeks.value[key]
}

async function resetWeek(bowl: string) {
  if (isWeekLocked(bowl)) return
  if (!confirm(`Reset all ${bowl} bowl entries for this week? This will restore default time slots.`)) return

  try {
    await $fetch('/api/admin/schedule/reset', {
      method: 'POST',
      body: {
        bowl,
        startDate: weekDates.value[0],
        endDate: weekDates.value[4],
      },
    })
    await refreshSchedule()
  } catch (err) {
    console.error('Failed to reset week:', err)
    alert('Failed to reset week')
  }
}

async function populateWeek(bowl: string) {
  if (isWeekLocked(bowl)) return

  try {
    const result = await $fetch('/api/admin/schedule/populate', {
      method: 'POST',
      body: {
        bowl,
        startDate: weekDates.value[0],
        endDate: weekDates.value[4],
      },
    })
    await refreshSchedule()
    if (result.created > 0) {
      alert(`Populated ${result.created} slots with default event`)
    } else {
      alert('All slots already have entries')
    }
  } catch (err) {
    console.error('Failed to populate week:', err)
    alert('Failed to populate week')
  }
}

async function exportPDF(bowl: string) {
  const url = `/api/admin/export/${bowl}?startDate=${weekDates.value[0]}&endDate=${weekDates.value[4]}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Export failed')
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `rowans-${bowl}-bowl-${weekDates.value[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.error('PDF export failed:', err)
    alert('Failed to export PDF')
  }
}

// Get max slots for a bowl across the week (for grid rows)
function getMaxSlotsForBowl(bowl: string): number {
  let max = 0
  for (const date of weekDates.value) {
    const slots = getSlotsForDateAndBowl(date, bowl)
    if (slots.length > max) max = slots.length
  }
  return Math.max(max, 4) // At least 4 rows
}

const selectStyle = computed(() => `
  padding: 0.25rem 0.35rem;
  background: ${isDark.value ? '#1a1a1a' : '#ffffff'};
  border: 1px solid ${isDark.value ? '#333' : '#ccc'};
  color: ${isDark.value ? '#f0f0f0' : '#1a1a1a'};
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: 'Fira Code', monospace;
  width: 100%;
  cursor: pointer;
`)

const smallSelectStyle = computed(() => `
  padding: 0.2rem 0.25rem;
  background: ${isDark.value ? '#1a1a1a' : '#ffffff'};
  border: 1px solid ${isDark.value ? '#333' : '#ccc'};
  color: ${isDark.value ? '#f0f0f0' : '#1a1a1a'};
  border-radius: 3px;
  font-size: 0.65rem;
  font-family: 'Fira Code', monospace;
  cursor: pointer;
  min-width: 55px;
`)
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold;">Schedule Editor</h2>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button
          @click="prevWeek"
          class="nav-btn"
          :style="{
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderColor: isDark ? '#333' : '#ccc',
            color: isDark ? '#f0f0f0' : '#1a1a1a',
          }"
        >Prev</button>
        <span style="padding: 0 1rem; font-size: 0.875rem;">{{ weekDates[0] }} - {{ weekDates[4] }}</span>
        <button
          @click="nextWeek"
          class="nav-btn"
          :style="{
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderColor: isDark ? '#333' : '#ccc',
            color: isDark ? '#f0f0f0' : '#1a1a1a',
          }"
        >Next</button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="!isDataReady" style="padding: 2rem; text-align: center; color: #888;">
      Loading schedule data...
    </div>

    <!-- Schedule Grid for each bowl -->
    <div v-if="isDataReady" v-for="bowl in bowls" :key="bowl" style="margin-bottom: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.125rem; font-weight: 600; text-transform: capitalize;">{{ bowl }} Bowl</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button
            @click="toggleLock(bowl)"
            class="lock-btn"
            :class="{ locked: isWeekLocked(bowl) }"
            :title="isWeekLocked(bowl) ? 'Unlock week' : 'Lock week'"
          >
            {{ isWeekLocked(bowl) ? '🔒' : '🔓' }}
          </button>
          <button
            @click="populateWeek(bowl)"
            :disabled="isWeekLocked(bowl)"
            class="populate-btn"
            :class="{ disabled: isWeekLocked(bowl) }"
          >
            Populate
          </button>
          <button
            @click="resetWeek(bowl)"
            :disabled="isWeekLocked(bowl)"
            class="reset-btn"
            :class="{ disabled: isWeekLocked(bowl) }"
          >
            Reset
          </button>
          <button @click="exportPDF(bowl)" class="export-btn">
            Export PDF
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th v-for="date in weekDates" :key="date" :style="{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: isDark ? '#888' : '#666' }">
                {{ formatDayLabel(date) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rowIdx in getMaxSlotsForBowl(bowl)" :key="rowIdx" :style="{ borderTop: `1px solid ${isDark ? '#333' : '#ddd'}` }">
              <td v-for="date in weekDates" :key="date" style="padding: 0.35rem; vertical-align: top;">
                <template v-if="getSlotsForDateAndBowl(date, bowl)[rowIdx - 1]">
                  <div
                    :style="{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      opacity: isDefaultSlot(getSlotsForDateAndBowl(date, bowl)[rowIdx - 1]) ? 0.6 : 1,
                      background: isDefaultSlot(getSlotsForDateAndBowl(date, bowl)[rowIdx - 1]) ? (isDark ? '#1a1a1a' : '#f5f5f5') : 'transparent',
                      padding: '0.25rem',
                      borderRadius: '4px',
                    }"
                  >
                    <!-- Time row: Start - End -->
                    <div style="display: flex; gap: 0.2rem; align-items: center;">
                      <select
                        :value="getSlotsForDateAndBowl(date, bowl)[rowIdx - 1].startTime"
                        @change="handleTimeChange(date, bowl, getSlotsForDateAndBowl(date, bowl)[rowIdx - 1], 'startTime', ($event.target as HTMLSelectElement).value)"
                        :disabled="isWeekLocked(bowl)"
                        :style="smallSelectStyle"
                      >
                        <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                      </select>
                      <span :style="{ color: isDark ? '#666' : '#999', fontSize: '0.65rem' }">-</span>
                      <select
                        :value="getSlotsForDateAndBowl(date, bowl)[rowIdx - 1].endTime"
                        @change="handleTimeChange(date, bowl, getSlotsForDateAndBowl(date, bowl)[rowIdx - 1], 'endTime', ($event.target as HTMLSelectElement).value)"
                        :disabled="isWeekLocked(bowl)"
                        :style="smallSelectStyle"
                      >
                        <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                      </select>
                    </div>
                    <!-- Event + Delete row -->
                    <div style="display: flex; gap: 0.2rem; align-items: center;">
                      <select
                        :value="isDefaultSlot(getSlotsForDateAndBowl(date, bowl)[rowIdx - 1]) ? defaultEventId : getSlotsForDateAndBowl(date, bowl)[rowIdx - 1].eventId"
                        @change="handleEventChange(date, bowl, getSlotsForDateAndBowl(date, bowl)[rowIdx - 1], parseInt(($event.target as HTMLSelectElement).value))"
                        :disabled="isWeekLocked(bowl)"
                        :style="selectStyle"
                        style="flex: 1;"
                      >
                        <option v-for="evt in eventsList" :key="evt.id" :value="evt.id">{{ evt.name }}</option>
                      </select>
                      <button
                        v-if="!isDefaultSlot(getSlotsForDateAndBowl(date, bowl)[rowIdx - 1])"
                        @click="handleDelete(date, bowl, getSlotsForDateAndBowl(date, bowl)[rowIdx - 1])"
                        :disabled="isWeekLocked(bowl)"
                        class="delete-btn"
                        title="Delete slot"
                      >×</button>
                    </div>
                  </div>
                </template>
                <!-- Empty cell / Add button -->
                <div v-else style="display: flex; justify-content: center; padding: 0.5rem;">
                  <button
                    v-if="rowIdx === getSlotsForDateAndBowl(date, bowl).length + 1"
                    @click="addSlot(date, bowl)"
                    :disabled="isWeekLocked(bowl)"
                    class="add-btn"
                    title="Add slot"
                  >+</button>
                  <span v-else :style="{ color: isDark ? '#333' : '#ddd' }">-</span>
                </div>
              </td>
            </tr>
            <!-- Add row at bottom -->
            <tr :style="{ borderTop: `1px solid ${isDark ? '#333' : '#ddd'}` }">
              <td v-for="date in weekDates" :key="date" style="padding: 0.35rem; text-align: center;">
                <button
                  @click="addSlot(date, bowl)"
                  :disabled="isWeekLocked(bowl)"
                  class="add-btn"
                  title="Add slot"
                >+ Add</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  border-color: #d0232a !important;
  box-shadow: 0 0 12px rgba(208, 35, 42, 0.3);
  transform: scale(1.05);
}

.lock-btn {
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.lock-btn:hover {
  border-color: #555;
  transform: scale(1.1);
}

.lock-btn.locked {
  border-color: #d0232a;
  color: #d0232a;
  box-shadow: 0 0 8px rgba(208, 35, 42, 0.3);
}

.populate-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid #2a5a2a;
  color: #71f871;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.populate-btn:hover:not(.disabled) {
  background: rgba(113, 248, 113, 0.1);
  box-shadow: 0 0 10px rgba(113, 248, 113, 0.2);
  transform: scale(1.03);
}

.populate-btn.disabled {
  border-color: #222;
  color: #444;
  cursor: not-allowed;
  opacity: 0.5;
}

.reset-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid #5a2a2a;
  color: #f87171;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.reset-btn:hover:not(.disabled) {
  background: rgba(248, 113, 113, 0.1);
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
  transform: scale(1.03);
}

.reset-btn.disabled {
  border-color: #222;
  color: #444;
  cursor: not-allowed;
  opacity: 0.5;
}

.export-btn {
  padding: 0.375rem 0.75rem;
  background: #d0232a;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #e02530;
  box-shadow: 0 0 14px rgba(208, 35, 42, 0.4);
  transform: scale(1.03);
}

.delete-btn {
  padding: 0.15rem 0.4rem;
  background: transparent;
  border: 1px solid #5a2a2a;
  color: #f87171;
  cursor: pointer;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.2s ease;
  line-height: 1;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.2);
  transform: scale(1.1);
}

.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-btn {
  padding: 0.2rem 0.5rem;
  background: transparent;
  border: 1px dashed #444;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.add-btn:hover:not(:disabled) {
  border-color: #d0232a;
  color: #d0232a;
  border-style: solid;
}

.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
