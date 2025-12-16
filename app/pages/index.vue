<script setup lang="ts">
import html2canvas from 'html2canvas'

const { isDark, initTheme, toggleTheme } = useTheme()

// Export format toggle
const exportFormat = ref<'pdf' | 'jpg'>('pdf')

interface ScheduleEntry {
  id: number
  date: string
  bowl: string
  startTime: string
  endTime: string
  event: string | null
}

// Smoke trail effect
const smokeCanvas = ref<HTMLCanvasElement | null>(null)
const particles = ref<Array<{x: number, y: number, vx: number, vy: number, life: number, size: number}>>([])
const mousePos = ref({ x: 0, y: 0 })
let animationId: number | null = null

function initSmokeTrail() {
  const canvas = smokeCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const handleMouseMove = (e: MouseEvent) => {
    mousePos.value = { x: e.clientX, y: e.clientY }
    // Add 2-3 particles per move for subtle effect
    for (let i = 0; i < 2; i++) {
      particles.value.push({
        x: e.clientX + (Math.random() - 0.5) * 15,
        y: e.clientY + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        life: 1,
        size: Math.random() * 18 + 10
      })
    }
  }

  document.addEventListener('mousemove', handleMouseMove)

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.value = particles.value.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.012
      p.size *= 0.985

      if (p.life <= 0) return false

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.035})`
      ctx.fill()

      return true
    })

    // Apply red glow to text elements near smoke
    const glowRadius = 80
    const textElements = document.querySelectorAll('.slot-event, .slot-time, .day-name, .day-date, .bowl-title, .week-title, .logo, .mobile-slot-event, .mobile-slot-time, .mobile-day-name, .mobile-bowl-title')
    textElements.forEach(el => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Check distance to mouse and nearby particles
      let maxIntensity = 0
      const distToMouse = Math.sqrt((centerX - mousePos.value.x) ** 2 + (centerY - mousePos.value.y) ** 2)
      if (distToMouse < glowRadius) {
        maxIntensity = Math.max(maxIntensity, 1 - distToMouse / glowRadius)
      }

      // Also check against active particles for trailing glow
      for (const p of particles.value) {
        if (p.life > 0.5) {
          const dist = Math.sqrt((centerX - p.x) ** 2 + (centerY - p.y) ** 2)
          if (dist < glowRadius) {
            maxIntensity = Math.max(maxIntensity, (1 - dist / glowRadius) * p.life)
          }
        }
      }

      const htmlEl = el as HTMLElement
      if (maxIntensity > 0.1) {
        const glowStrength = Math.min(maxIntensity * 15, 12)
        htmlEl.style.textShadow = `0 0 ${glowStrength}px rgba(208, 35, 42, ${maxIntensity * 0.9}), 0 0 ${glowStrength * 2}px rgba(208, 35, 42, ${maxIntensity * 0.5})`
        htmlEl.style.color = `rgb(${Math.floor(240 + maxIntensity * 15)}, ${Math.floor(240 - maxIntensity * 100)}, ${Math.floor(240 - maxIntensity * 100)})`
      } else {
        htmlEl.style.textShadow = ''
        htmlEl.style.color = ''
      }
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

// Mobile detection
const isMobile = ref(false)
const currentDayIndex = ref(0)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// Touch swipe handling
const touchStartX = ref(0)
const touchEndX = ref(0)
const swipeThreshold = 50

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0]?.clientX ?? 0
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0]?.clientX ?? 0
}

function handleTouchEnd() {
  const diff = touchStartX.value - touchEndX.value
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && currentDayIndex.value < 4) {
      // Swipe left - next day
      currentDayIndex.value++
    } else if (diff < 0 && currentDayIndex.value > 0) {
      // Swipe right - prev day
      currentDayIndex.value--
    }
  }
  touchStartX.value = 0
  touchEndX.value = 0
}

function prevDay() {
  if (currentDayIndex.value > 0) currentDayIndex.value--
}

function nextDay() {
  if (currentDayIndex.value < 4) currentDayIndex.value++
}

const currentDate = computed(() => weekDates.value[currentDayIndex.value] ?? '')

onMounted(() => {
  initTheme()
  initSmokeTrail()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', checkMobile)
})

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

const weekStartFormatted = computed(() => {
  const d = new Date(currentWeekStart.value)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})

function getDayName(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { weekday: 'short' })
}

function getDayDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getDate()} ${date.toLocaleDateString('en-GB', { month: 'short' })}`
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

// Convert time string to minutes for sorting (handles 00:00-02:30 as late night)
function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const mins = parts[1] ?? 0
  // Times 00:00-02:30 are late night, so add 24 hours for sorting
  if (hours < 12) return (hours + 24) * 60 + mins
  return hours * 60 + mins
}

// Fetch schedule from database
const { data: schedule } = await useFetch<ScheduleEntry[]>('/api/schedule', {
  query: computed(() => ({
    startDate: weekDates.value[0],
    endDate: weekDates.value[4],
  })),
  watch: [weekDates],
})

// Get entries for specific date/bowl, sorted by startTime
function getEntriesForDateAndBowl(date: string, bowl: string): ScheduleEntry[] {
  const entries = schedule.value?.filter(e => e.date === date && e.bowl === bowl) || []
  return entries.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

// Get max slots for a bowl across the week (for grid rows)
function getMaxSlotsForBowl(bowl: string): number {
  let max = 0
  for (const date of weekDates.value) {
    const entries = getEntriesForDateAndBowl(date, bowl)
    if (entries.length > max) max = entries.length
  }
  return Math.max(max, 4) // At least 4 rows for visual consistency
}

const bowls = ['lower', 'upper'] as const

// PDF export
async function exportPDF(bowl: string) {
  const url = `/api/export/${bowl}?startDate=${weekDates.value[0]}&endDate=${weekDates.value[4]}`
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

// JPG export using html2canvas
async function exportJPG(bowl: string) {
  const element = document.querySelector(`[data-bowl="${bowl}"]`) as HTMLElement
  if (!element) {
    alert('Could not find schedule to export')
    return
  }
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: isDark.value ? '#0a0a0a' : '#f5f5f5',
      scale: 2,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    })
    const link = document.createElement('a')
    link.download = `rowans-${bowl}-bowl-${weekDates.value[0]}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.9)
    link.click()
  } catch (err) {
    console.error('JPG export failed:', err)
    alert('Failed to export JPG')
  }
}

// Unified export function
function exportBowl(bowl: string) {
  if (exportFormat.value === 'pdf') {
    exportPDF(bowl)
  } else {
    exportJPG(bowl)
  }
}
</script>

<template>
  <div class="rota-page" :style="{ backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5', color: isDark ? '#f0f0f0' : '#1a1a1a' }">
    <!-- Smoke Trail Canvas -->
    <canvas ref="smokeCanvas" class="smoke-canvas"></canvas>

    <!-- Header -->
    <header class="header" :style="{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }">
      <div class="header-inner">
        <h1 class="logo" :style="{ color: isDark ? '#f0f0f0' : '#1a1a1a' }">Rowans Events</h1>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <!-- Format Toggle -->
          <div class="format-toggle" :style="{ background: isDark ? '#1a1a1a' : '#e5e5e5' }">
            <span class="format-label" :class="{ active: exportFormat === 'pdf' }">PDF</span>
            <div class="toggle-track" :style="{ background: isDark ? '#333' : '#ccc' }" @click="exportFormat = exportFormat === 'pdf' ? 'jpg' : 'pdf'">
              <div class="toggle-dot" :class="{ right: exportFormat === 'jpg' }"></div>
            </div>
            <span class="format-label" :class="{ active: exportFormat === 'jpg' }">JPG</span>
          </div>
          <button @click="exportBowl('upper')" class="export-btn">Upper</button>
          <button @click="exportBowl('lower')" class="export-btn">Lower</button>
          <button @click="toggleTheme" class="theme-btn">{{ isDark ? '☀️' : '🌙' }}</button>
          <NuxtLink to="/login" class="login-link">Admin</NuxtLink>
        </div>
      </div>
    </header>

    <main class="main">
      <!-- MOBILE VIEW -->
      <div
        v-if="isMobile"
        class="mobile-container"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Sticky Day Header -->
        <div
          class="mobile-day-header"
          :style="{ background: isDark ? '#1a1a1a' : '#ffffff' }"
        >
          <button @click="prevDay" class="day-nav-btn" :disabled="currentDayIndex === 0" :style="{ color: isDark ? '#f0f0f0' : '#1a1a1a' }">‹</button>
          <div class="mobile-day-info">
            <div class="mobile-day-name">{{ getDayName(currentDate) }}</div>
            <div class="mobile-day-date" :style="{ color: isDark ? '#888' : '#666' }">{{ getDayDate(currentDate) }}</div>
          </div>
          <button @click="nextDay" class="day-nav-btn" :disabled="currentDayIndex === 4" :style="{ color: isDark ? '#f0f0f0' : '#1a1a1a' }">›</button>
        </div>

        <!-- Day Indicator Dots -->
        <div class="day-dots">
          <span
            v-for="(date, idx) in weekDates"
            :key="date"
            class="day-dot"
            :class="{ active: idx === currentDayIndex }"
            @click="currentDayIndex = idx"
          ></span>
        </div>

        <!-- Week Navigation -->
        <div class="mobile-week-nav">
          <button @click="prevWeek" class="week-nav-btn" :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ccc', color: isDark ? '#f0f0f0' : '#1a1a1a' }">← Prev Week</button>
          <button @click="nextWeek" class="week-nav-btn" :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ccc', color: isDark ? '#f0f0f0' : '#1a1a1a' }">Next Week →</button>
        </div>

        <!-- Mobile Bowl Sections -->
        <div v-for="bowl in bowls" :key="bowl" class="mobile-bowl-section">
          <h3 class="mobile-bowl-title">{{ bowl === 'upper' ? 'Upper Bowl' : 'Lower Bowl' }}</h3>
          <div class="mobile-slots">
            <div
              v-for="entry in getEntriesForDateAndBowl(currentDate, bowl)"
              :key="entry.id"
              class="mobile-slot-cell"
              :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ddd' }"
            >
              <div class="mobile-slot-time">{{ entry.startTime }}-{{ entry.endTime }}</div>
              <div class="mobile-slot-event">{{ entry.event || 'TBA' }}</div>
            </div>
            <!-- Show message if no slots -->
            <div
              v-if="getEntriesForDateAndBowl(currentDate, bowl).length === 0"
              class="mobile-slot-cell empty-message"
              :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ddd', justifyContent: 'center' }"
            >
              <div :style="{ color: isDark ? '#666' : '#999' }">No slots scheduled</div>
            </div>
          </div>
        </div>
      </div>

      <!-- DESKTOP VIEW -->
      <template v-else>
        <!-- Week Selector -->
        <div class="week-selector">
          <span class="label" :style="{ color: isDark ? '#888' : '#666' }">Select Week:</span>
          <div class="controls">
            <button @click="prevWeek" class="nav-btn" :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ccc', color: isDark ? '#f0f0f0' : '#1a1a1a' }">←</button>
            <input
              type="date"
              :value="currentWeekStart"
              @change="currentWeekStart = ($event.target as HTMLInputElement).value"
              class="date-input"
              :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ccc', color: isDark ? '#f0f0f0' : '#1a1a1a' }"
            />
            <button @click="nextWeek" class="nav-btn" :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ccc', color: isDark ? '#f0f0f0' : '#1a1a1a' }">→</button>
          </div>
        </div>

        <!-- Week Title -->
        <h2 class="week-title">
          Rowans Events : Week Starting {{ weekStartFormatted }}
        </h2>

        <!-- Schedule Grid -->
        <div v-for="bowl in bowls" :key="bowl" class="bowl-section" :data-bowl="bowl">
          <!-- Day Headers -->
          <div class="grid-row">
            <div v-for="date in weekDates" :key="date" class="day-header" :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ddd' }">
              <div class="day-name">{{ getDayName(date) }}</div>
              <div class="day-date" :style="{ color: isDark ? '#888' : '#666' }">{{ getDayDate(date) }}</div>
            </div>
          </div>

          <!-- Bowl Title -->
          <h2 class="bowl-title">{{ bowl === 'upper' ? 'Upper Bowl' : 'Lower Bowl' }}</h2>

          <!-- Time Slots Grid - iterate by row index -->
          <div v-for="rowIdx in getMaxSlotsForBowl(bowl)" :key="rowIdx" class="grid-row">
            <div
              v-for="date in weekDates"
              :key="date"
              class="slot-cell"
              :class="{ 'empty-slot': !getEntriesForDateAndBowl(date, bowl)[rowIdx - 1] }"
              :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333' : '#ddd' }"
            >
              <template v-if="getEntriesForDateAndBowl(date, bowl)[rowIdx - 1]">
                <div class="slot-time">
                  {{ getEntriesForDateAndBowl(date, bowl)[rowIdx - 1].startTime }}-{{ getEntriesForDateAndBowl(date, bowl)[rowIdx - 1].endTime }}
                </div>
                <div class="slot-event">
                  {{ getEntriesForDateAndBowl(date, bowl)[rowIdx - 1].event || 'TBA' }}
                </div>
              </template>
              <template v-else>
                <div class="slot-empty">—</div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.rota-page {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #f0f0f0;
  font-family: 'Fira Code', monospace;
  font-size: 1.1rem;
  font-weight: 500;
  position: relative;
}

.smoke-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #d0232a;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f0f0f0;
}

.login-link {
  color: #888;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #d0232a;
  text-shadow: 0 0 8px rgba(208, 35, 42, 0.5);
}

.export-btn {
  padding: 0.5rem 0.9rem;
  background: #d0232a;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #e02530;
  box-shadow: 0 0 12px rgba(208, 35, 42, 0.4);
  transform: scale(1.03);
}

.theme-btn {
  padding: 0.4rem 0.5rem;
  background: transparent;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  border-color: #d0232a;
  transform: scale(1.1);
}

.main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.week-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.week-selector .label {
  color: #888;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #f0f0f0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #252525;
  border-color: #d0232a;
  box-shadow: 0 0 12px rgba(208, 35, 42, 0.3);
  transform: scale(1.05);
}

.date-input {
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #f0f0f0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.date-input:hover,
.date-input:focus {
  border-color: #d0232a;
  box-shadow: 0 0 8px rgba(208, 35, 42, 0.2);
  outline: none;
}

.week-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.bowl-section {
  margin-bottom: 3rem;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.day-header {
  text-align: center;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  transition: all 0.2s ease;
}

.day-header:hover {
  border-color: #444;
  background: #1f1f1f;
}

.day-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.day-date {
  font-size: 0.95rem;
  font-weight: 500;
  color: #888;
}

.bowl-title {
  text-align: center;
  padding: 0.75rem 0;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.slot-cell {
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 0.75rem;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.25s ease;
  cursor: default;
}

.slot-cell:hover {
  background: #1f1f1f;
  border-color: #d0232a;
  box-shadow: 0 0 16px rgba(208, 35, 42, 0.2), inset 0 0 20px rgba(208, 35, 42, 0.05);
  transform: scale(1.02);
}

.slot-time {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.25rem;
  transition: color 0.2s ease;
}

.slot-cell:hover .slot-time {
  color: #888;
}

.slot-event {
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.slot-cell:hover .slot-event {
  color: #fff;
  text-shadow: 0 0 8px rgba(208, 35, 42, 0.3);
}

.slot-cell.empty-slot {
  background: #0f0f0f;
  border-color: #222;
}

.slot-cell.empty-slot:hover {
  transform: none;
  box-shadow: none;
  background: #0f0f0f;
  border-color: #222;
}

.slot-empty {
  color: #333;
  font-size: 1rem;
}

/* Format Toggle */
.format-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 4px 8px;
  border-radius: 20px;
}

.format-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  transition: color 0.2s ease;
}

.format-label.active {
  color: #d0232a;
  font-weight: bold;
}

.toggle-track {
  width: 36px;
  height: 20px;
  background: #333;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-track:hover {
  background: #444;
}

.toggle-dot {
  width: 16px;
  height: 16px;
  background: #d0232a;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 0 8px rgba(208, 35, 42, 0.5);
}

.toggle-dot.right {
  transform: translateX(16px);
}

/* Mobile Styles */
.mobile-container {
  touch-action: pan-y;
  min-height: calc(100vh - 120px);
}

.mobile-day-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #d0232a;
}

.day-nav-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: opacity 0.2s ease;
}

.day-nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.mobile-day-info {
  text-align: center;
}

.mobile-day-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.mobile-day-date {
  font-size: 1rem;
  font-weight: 500;
}

.day-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
}

.day-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-dot.active {
  background: #d0232a;
  box-shadow: 0 0 8px rgba(208, 35, 42, 0.5);
}

.mobile-week-nav {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 1rem;
  gap: 1rem;
}

.week-nav-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.week-nav-btn:active {
  transform: scale(0.98);
}

.mobile-bowl-section {
  padding: 0 1rem 1.5rem;
}

.mobile-bowl-title {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #333;
}

.mobile-slots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-slot-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
}

.mobile-slot-cell.empty-message {
  justify-content: center;
}

.mobile-slot-time {
  font-size: 0.95rem;
  font-weight: 500;
  color: #888;
}

.mobile-slot-event {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Mobile header adjustments */
@media (max-width: 767px) {
  .header {
    padding: 1rem;
  }

  .header-inner {
    flex-direction: column;
    gap: 0.75rem;
  }

  .logo {
    font-size: 1.4rem;
  }

  .format-toggle {
    padding: 2px 6px;
  }

  .format-label {
    font-size: 0.7rem;
  }

  .toggle-track {
    width: 30px;
    height: 16px;
  }

  .toggle-dot {
    width: 12px;
    height: 12px;
  }

  .toggle-dot.right {
    transform: translateX(14px);
  }

  .export-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }

  .main {
    padding: 0;
  }
}
</style>
