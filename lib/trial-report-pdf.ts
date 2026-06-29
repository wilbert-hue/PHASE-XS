import type { Trial } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import {
  buildTrialReportPayload,
  trialReportFilename,
  type ReportField,
  type ReportSection,
} from "@/lib/trial-report-sections"

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 16
const CONTENT_W = PAGE_W - MARGIN * 2
const HEADER_H = 52
const BRAND = "#1B4965"
const TEXT = "#1a1a1a"
const MUTED = "#5c6b73"
const RULE = "#d0dde3"

type JsPDFInstance = import("jspdf").jsPDF

function ensureSpace(doc: JsPDFInstance, y: number, need: number): number {
  if (y + need > PAGE_H - MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function drawWrapped(
  doc: JsPDFInstance,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  fontSize: number,
  color = TEXT,
): number {
  doc.setFontSize(fontSize)
  doc.setTextColor(color)
  const lines = doc.splitTextToSize(text, maxW) as string[]
  for (const line of lines) {
    y = ensureSpace(doc, y, lineH)
    doc.text(line, x, y)
    y += lineH
  }
  return y
}

function drawBulletList(
  doc: JsPDFInstance,
  items: string[],
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  fontSize: number,
): number {
  const bullet = "\u2022 "
  doc.setFont("helvetica", "normal")
  doc.setFontSize(fontSize)
  doc.setTextColor(TEXT)
  const bulletW = doc.getTextWidth(bullet)
  const textX = x + bulletW
  const textW = maxW - bulletW

  for (let i = 0; i < items.length; i++) {
    const lines = doc.splitTextToSize(items[i], textW) as string[]
    y = ensureSpace(doc, y, lineH)
    doc.text(bullet, x, y)
    doc.text(lines[0], textX, y)
    y += lineH
    for (let li = 1; li < lines.length; li++) {
      y = ensureSpace(doc, y, lineH)
      doc.text(lines[li], textX, y)
      y += lineH
    }
    if (i < items.length - 1) y += 1.5
  }
  return y
}

function drawField(
  doc: JsPDFInstance,
  field: ReportField,
  y: number,
  compact = false,
): number {
  const padX = 3
  const labelSize = 7
  const valueSize = compact ? 8 : 9
  const labelLineH = 4
  const valueLineH = compact ? 3.8 : 4.2
  const minBlock = labelLineH + valueLineH + 6

  y = ensureSpace(doc, y, minBlock)

  doc.setDrawColor(RULE)
  doc.setLineWidth(0.15)
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
  y += 4

  doc.setFont("helvetica", "bold")
  doc.setFontSize(labelSize)
  doc.setTextColor(BRAND)
  const labelLines = doc.splitTextToSize(field.label.toUpperCase(), CONTENT_W - padX * 2) as string[]
  for (const line of labelLines) {
    y = ensureSpace(doc, y, labelLineH)
    doc.text(line, MARGIN + padX, y)
    y += labelLineH
  }

  doc.setFont("helvetica", "normal")
  const valueX = MARGIN + padX
  const valueW = CONTENT_W - padX * 2
  if (field.items?.length) {
    y = drawBulletList(doc, field.items, valueX, y, valueW, valueLineH, valueSize)
  } else {
    y = drawWrapped(doc, field.value, valueX, y, valueW, valueLineH, valueSize, TEXT)
  }
  return y + 2
}

function drawSection(doc: JsPDFInstance, section: ReportSection, y: number): number {
  const compact = section.fields.length > 8
  y = ensureSpace(doc, y, 14)
  doc.setFillColor(BRAND)
  doc.rect(MARGIN, y - 4, CONTENT_W, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(compact ? 10 : 11)
  doc.setTextColor("#ffffff")
  doc.text(section.title, MARGIN + 3, y + 1.5)
  y += 12

  for (const f of section.fields) {
    y = drawField(doc, f, y, compact)
  }
  return y + 4
}

function drawHeader(doc: JsPDFInstance, payload: ReturnType<typeof buildTrialReportPayload>): number {
  const molLines = payload.molecule
    ? (doc.splitTextToSize(payload.molecule, CONTENT_W - 4) as string[]).slice(0, 3)
    : []
  const headerH = Math.max(HEADER_H, 44 + (payload.molecule ? 14 : 0) + molLines.length * 4)

  doc.setFillColor(BRAND)
  doc.rect(0, 0, PAGE_W, headerH, "F")

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor("#b8d4dc")
  doc.text(payload.regionLabel.toUpperCase(), MARGIN, 12)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor("#ffffff")
  const idLines = doc.splitTextToSize(payload.displayId, CONTENT_W - 4) as string[]
  doc.text(idLines.slice(0, 1), MARGIN, 22)

  let y = 28
  if (payload.molecule) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor("#9ec5cf")
    doc.text("INTERVENTION / MOLECULE", MARGIN, y)
    y += 5
    doc.setFontSize(10)
    doc.setTextColor("#ffffff")
    for (const line of molLines) {
      doc.text(line, MARGIN, y)
      y += 4
    }
  }

  let badgeX = MARGIN
  const badgeY = headerH - 8
  doc.setFontSize(7)
  for (const badge of payload.badges.slice(0, 4)) {
    const w = doc.getTextWidth(badge) + 6
    if (badgeX + w > PAGE_W - MARGIN) break
    doc.setFillColor("#ffffff")
    doc.roundedRect(badgeX, badgeY - 4, w, 6, 1.5, 1.5, "F")
    doc.setTextColor(BRAND)
    doc.setFont("helvetica", "bold")
    doc.text(badge, badgeX + 3, badgeY)
    badgeX += w + 3
  }

  return headerH + 6
}

function drawKpis(doc: JsPDFInstance, y: number, kpis: { label: string; value: string }[]): number {
  if (kpis.length === 0) return y
  const colW = CONTENT_W / Math.min(kpis.length, 4)
  let x = MARGIN
  const boxH = 22
  y = ensureSpace(doc, y, boxH + 4)

  for (const kpi of kpis.slice(0, 4)) {
    doc.setDrawColor(RULE)
    doc.setFillColor("#f8fafb")
    doc.roundedRect(x, y, colW - 3, boxH, 2, 2, "FD")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(MUTED)
    doc.text(kpi.label.toUpperCase(), x + 4, y + 7)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(BRAND)
    doc.text(kpi.value, x + 4, y + 16)
    x += colW
  }
  return y + boxH + 10
}

function drawFooter(doc: JsPDFInstance, pageNum: number, total: number) {
  const y = PAGE_H - 10
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(MUTED)
  const date = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.text(`PHASE-XS · Generated ${date}`, MARGIN, y)
  doc.text(`Page ${pageNum} of ${total}`, PAGE_W - MARGIN, y, { align: "right" })
}

export async function downloadTrialReportPdf(trial: Trial, region: DashboardRegion): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const payload = buildTrialReportPayload(trial, region)
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })

  let y = drawHeader(doc, payload)
  y = drawKpis(doc, y, payload.kpis)

  for (const section of payload.sections) {
    y = drawSection(doc, section, y)
  }

  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    drawFooter(doc, p, total)
  }

  doc.save(trialReportFilename(trial, region))
}
