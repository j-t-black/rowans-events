import { db, scheduleEntries, djs } from '~~/server/database/db'
import { eq, and, gte, lte, asc } from 'drizzle-orm'
import PDFDocument from 'pdfkit'

export default defineEventHandler(async (event) => {
  const bowl = getRouterParam(event, 'bowl')
  const query = getQuery(event)
  const { startDate, endDate } = query

  if (!bowl || !['upper', 'lower'].includes(bowl)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid bowl. Must be "upper" or "lower"',
    })
  }

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: 'startDate and endDate query params are required',
    })
  }

  // Fetch schedule for the date range and bowl
  const entries = await db
    .select({
      date: scheduleEntries.date,
      startTime: scheduleEntries.startTime,
      endTime: scheduleEntries.endTime,
      dj: djs.name,
    })
    .from(scheduleEntries)
    .leftJoin(djs, eq(scheduleEntries.djId, djs.id))
    .where(
      and(
        eq(scheduleEntries.bowl, bowl),
        gte(scheduleEntries.date, startDate as string),
        lte(scheduleEntries.date, endDate as string)
      )
    )
    .orderBy(asc(scheduleEntries.date), asc(scheduleEntries.startTime))

  // Fetch default DJ
  const [defaultDJ] = await db
    .select({ name: djs.name })
    .from(djs)
    .where(eq(djs.isDefault, true))

  // Group entries by date
  const byDate = new Map<string, typeof entries>()
  for (const entry of entries) {
    const existing = byDate.get(entry.date) || []
    existing.push(entry)
    byDate.set(entry.date, existing)
  }

  // Generate dates for the week
  const dates: string[] = []
  const start = new Date(startDate as string)
  const end = new Date(endDate as string)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0] ?? '')
  }

  // Format day label
  function formatDay(dateStr: string): string {
    const date = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
  }

  // Format week range for title
  const startDateObj = new Date(startDate as string)
  const endDateObj = new Date(endDate as string)
  const weekTitle = `${startDateObj.getDate()}/${startDateObj.getMonth() + 1} - ${endDateObj.getDate()}/${endDateObj.getMonth() + 1}/${endDateObj.getFullYear()}`

  // Find max slots across all dates
  let maxSlots = 0
  for (const date of dates) {
    const dateEntries = byDate.get(date) || []
    if (dateEntries.length > maxSlots) maxSlots = dateEntries.length
  }
  // Ensure at least 4 rows for visual consistency
  maxSlots = Math.max(maxSlots, 4)

  // Create PDF with PDFKit - single page, compressed
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 50, bottom: 50, left: 30, right: 30 },
    compress: true,
    autoFirstPage: false,
  })

  // Add single page
  doc.addPage()

  // Collect PDF chunks
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  // Page dimensions
  const pageWidth = 842 // A4 landscape width in points
  const marginLeft = 30
  const marginRight = 30
  const marginTop = 50
  const usableWidth = pageWidth - marginLeft - marginRight

  // Use built-in font (no embedding)
  doc.font('Helvetica')

  // Title (light mode)
  doc.fontSize(18).fillColor('#d0232a').text(`ROWANS ROTA - ${bowl.toUpperCase()} BOWL`, marginLeft, marginTop, {
    align: 'center',
    width: usableWidth,
  })

  // Week info
  doc.fontSize(10).fillColor('#666666').text(`Week: ${weekTitle}`, marginLeft, marginTop + 25, {
    align: 'center',
    width: usableWidth,
  })

  // Table setup
  const tableTop = marginTop + 55
  const numCols = dates.length
  const colWidth = usableWidth / numCols
  const rowHeight = 45
  const headerHeight = 30

  // Draw header row (lighter background, white text)
  doc.fillColor('#888888').rect(marginLeft, tableTop, usableWidth, headerHeight).fill()

  // Header text (white on gray)
  doc.fillColor('#ffffff').fontSize(9)
  dates.forEach((date, i) => {
    const x = marginLeft + colWidth * i
    doc.text(formatDay(date), x + 5, tableTop + 10, { width: colWidth - 10, align: 'center' })
  })

  // Draw data rows
  for (let slot = 0; slot < maxSlots; slot++) {
    const rowTop = tableTop + headerHeight + slot * rowHeight

    // Data cells
    dates.forEach((date, i) => {
      const x = marginLeft + colWidth * i
      const dateEntries = byDate.get(date) || []
      const entry = dateEntries[slot]

      if (entry) {
        const time = `${entry.startTime}-${entry.endTime}`
        const dj = entry.dj || defaultDJ?.name || 'TBA'

        // Time in muted gray
        doc.fillColor('#888888').fontSize(8)
        doc.text(time, x + 5, rowTop + 8, { width: colWidth - 10, align: 'center' })

        // DJ name in dark/black
        doc.fillColor('#222222').fontSize(10)
        doc.text(dj, x + 5, rowTop + 22, { width: colWidth - 10, align: 'center' })
      } else {
        doc.fillColor('#cccccc').fontSize(10)
        doc.text('-', x + 5, rowTop + 15, { width: colWidth - 10, align: 'center' })
      }
    })
  }

  // Draw grid lines (light mode - darker lines for visibility)
  doc.strokeColor('#cccccc').lineWidth(0.5)

  // Vertical lines
  for (let i = 0; i <= numCols; i++) {
    const x = marginLeft + colWidth * i
    doc.moveTo(x, tableTop).lineTo(x, tableTop + headerHeight + maxSlots * rowHeight).stroke()
  }

  // Horizontal lines
  doc.moveTo(marginLeft, tableTop).lineTo(marginLeft + usableWidth, tableTop).stroke()
  doc.moveTo(marginLeft, tableTop + headerHeight).lineTo(marginLeft + usableWidth, tableTop + headerHeight).stroke()
  for (let i = 1; i <= maxSlots; i++) {
    const y = tableTop + headerHeight + i * rowHeight
    doc.moveTo(marginLeft, y).lineTo(marginLeft + usableWidth, y).stroke()
  }

  doc.end()

  await new Promise<void>((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)
  })

  const pdfBuffer = Buffer.concat(chunks)

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="rowans-${bowl}-bowl-${startDate}.pdf"`)

  return pdfBuffer
})
