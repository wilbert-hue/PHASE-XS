import type { Trial } from "@/app/dashboard/trial-types"
import { normalizePhase } from "@/app/dashboard/trial-types"
import type { DashboardRegion } from "@/lib/dashboard-region"
import { matchesSearchTerm } from "@/lib/dashboard-query"
import { isMeaningfulTrialValue } from "@/lib/dashboard-region-profile"
import { splitUkHealthConditions } from "@/lib/uk-trial-map"

export type InsightTakeaway = {
  category: string
  icon: string
  text: string
  highlight: string
}

export type InsightsResult = {
  query: string
  region: DashboardRegion
  matchCount: number
  summary: string
  takeaways: InsightTakeaway[]
  noResults: boolean
}

function topN(map: Map<string, number>, n: number): [string, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
}

function pct(count: number, total: number): string {
  if (total === 0) return "0%"
  return `${Math.round((count / total) * 100)}%`
}

function avg(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function regionLabel(region: DashboardRegion): string {
  const labels: Record<DashboardRegion, string> = {
    us: "United States",
    in: "India (CTRI)",
    uk: "United Kingdom (ISRCTN)",
    es: "Spain",
    be: "Belgium",
    dk: "Denmark",
    fr: "France",
    de: "Germany",
    it: "Italy",
    lu: "Luxembourg",
    nl: "Netherlands",
    no: "Norway",
    pl: "Poland",
    ru: "Russia",
    sg: "Singapore",
    kr: "South Korea",
    se: "Sweden",
  }
  return labels[region] ?? region
}

export function computeInsights(
  allTrials: Trial[],
  query: string,
  region: DashboardRegion,
): InsightsResult {
  const term = query.trim()
  if (!term) {
    return { query, region, matchCount: 0, summary: "", takeaways: [], noResults: true }
  }

  const matched = allTrials.filter(t => matchesSearchTerm(t, term, region))

  if (matched.length === 0) {
    return { query, region, matchCount: 0, summary: "", takeaways: [], noResults: true }
  }

  const total = matched.length
  const takeaways: InsightTakeaway[] = []

  // 1. Coverage
  takeaways.push({
    category: "Coverage",
    icon: "database",
    highlight: total.toLocaleString(),
    text: `${total.toLocaleString()} trial${total !== 1 ? "s" : ""} match "${term}" in the ${regionLabel(region)} dataset, representing ${pct(total, allTrials.length)} of all regional records.`,
  })

  // 2. Phase distribution
  const phaseMap = new Map<string, number>()
  matched.forEach(t => {
    const p = normalizePhase(t.phase)
    if (isMeaningfulTrialValue(p)) phaseMap.set(p, (phaseMap.get(p) || 0) + 1)
  })
  if (phaseMap.size > 0) {
    const top = topN(phaseMap, 1)[0]
    const breakdown = topN(phaseMap, 4)
      .map(([p, n]) => `${p}: ${n}`)
      .join(" · ")
    takeaways.push({
      category: "Trial Phase",
      icon: "flask",
      highlight: top[0],
      text: `${top[0]} is the dominant phase, covering ${pct(top[1], total)} of matched trials. Full phase breakdown — ${breakdown}.`,
    })
  }

  // 3. Recruitment / study status
  const statusMap = new Map<string, number>()
  matched.forEach(t => {
    const s = (t.recruitmentStatus || "").trim()
    if (isMeaningfulTrialValue(s)) statusMap.set(s, (statusMap.get(s) || 0) + 1)
  })
  if (statusMap.size > 0) {
    const top = topN(statusMap, 1)[0]
    const secondList = topN(statusMap, 3).slice(1).map(([s]) => s).join(", ")
    takeaways.push({
      category: "Recruitment Status",
      icon: "users",
      highlight: top[0],
      text: `"${top[0]}" is the most common recruitment status (${pct(top[1], total)})${secondList ? `, followed by ${secondList}` : ""}.`,
    })
  }

  // 4. Enrollment
  const enrollments = matched.filter(t => t.enrollment > 0).map(t => t.enrollment)
  if (enrollments.length > 0) {
    const totalEnroll = enrollments.reduce((a, b) => a + b, 0)
    const avgEnroll = Math.round(avg(enrollments))
    const maxEnroll = Math.max(...enrollments)
    takeaways.push({
      category: "Enrollment",
      icon: "users-round",
      highlight: totalEnroll.toLocaleString(),
      text: `Total target enrollment across matched trials: ${totalEnroll.toLocaleString()} participants. Average per trial: ${avgEnroll.toLocaleString()}, largest single trial: ${maxEnroll.toLocaleString()}.`,
    })
  }

  // 5. Duration
  const durations = matched.filter(t => t.durationYears > 0).map(t => t.durationYears)
  if (durations.length > 0) {
    const avgDur = avg(durations).toFixed(1)
    const minDur = Math.min(...durations).toFixed(1)
    const maxDur = Math.max(...durations).toFixed(1)
    takeaways.push({
      category: "Duration",
      icon: "clock",
      highlight: `${avgDur} yr`,
      text: `Average trial duration is ${avgDur} years (submission to completion). Range across matched trials: ${minDur} – ${maxDur} years.`,
    })
  }

  // 6. Top sponsors
  const sponsorMap = new Map<string, number>()
  matched.forEach(t => {
    const s = (t.sponsor || "").trim()
    if (isMeaningfulTrialValue(s)) sponsorMap.set(s, (sponsorMap.get(s) || 0) + 1)
  })
  if (sponsorMap.size > 0) {
    const tops = topN(sponsorMap, 3)
    const leader = tops[0]
    const others = tops.slice(1).map(([n, c]) => `${n} (${c})`).join(", ")
    takeaways.push({
      category: "Leading Sponsors",
      icon: "building",
      highlight: leader[0],
      text: `${leader[0]} leads with ${leader[1]} trial${leader[1] !== 1 ? "s" : ""}${others ? `. Other active sponsors: ${others}` : ""}.`,
    })
  }

  // 7. Conditions / Indications
  const condMap = new Map<string, number>()
  matched.forEach(t => {
    const tokens =
      region === "uk"
        ? splitUkHealthConditions(t.indication)
        : isMeaningfulTrialValue(t.indication)
          ? [t.indication]
          : []
    tokens.forEach(c => condMap.set(c, (condMap.get(c) || 0) + 1))
  })
  if (condMap.size > 0) {
    const tops = topN(condMap, 4).map(([c, n]) => `${c} (${n})`)
    takeaways.push({
      category: "Top Conditions",
      icon: "stethoscope",
      highlight: topN(condMap, 1)[0][0],
      text: `Most studied conditions within matched trials: ${tops.join(", ")}.`,
    })
  }

  // 8. Technology (US only)
  if (region === "us") {
    const techMap = new Map<string, number>()
    matched.forEach(t => {
      if (isMeaningfulTrialValue(t.technology))
        techMap.set(t.technology, (techMap.get(t.technology) || 0) + 1)
    })
    if (techMap.size > 0) {
      const tops = topN(techMap, 3)
      const leader = tops[0]
      const rest = tops.slice(1).map(([t]) => t).join(", ")
      takeaways.push({
        category: "Drug Technology",
        icon: "dna",
        highlight: leader[0],
        text: `${leader[0]} is the primary technology platform (${pct(leader[1], total)})${rest ? `. Also represented: ${rest}` : ""}.`,
      })
    }
  }

  // 9. Route of administration (US only)
  if (region === "us") {
    const routeMap = new Map<string, number>()
    matched.forEach(t => {
      if (t.routeOfAdmin) {
        const primary = t.routeOfAdmin.split(",")[0].trim()
        if (primary) routeMap.set(primary, (routeMap.get(primary) || 0) + 1)
      }
    })
    if (routeMap.size > 0) {
      const top = topN(routeMap, 1)[0]
      const others = topN(routeMap, 3).slice(1).map(([r]) => r).join(", ")
      takeaways.push({
        category: "Administration Route",
        icon: "syringe",
        highlight: top[0],
        text: `${top[0]} is the most common administration route (${pct(top[1], total)})${others ? `, with ${others} also observed` : ""}.`,
      })
    }
  }

  // 10. Admin / intervention type (India)
  if (region === "in") {
    const adminMap = new Map<string, number>()
    matched.forEach(t => {
      const a = (t.adminType || "").trim()
      if (isMeaningfulTrialValue(a)) adminMap.set(a, (adminMap.get(a) || 0) + 1)
    })
    if (adminMap.size > 0) {
      const tops = topN(adminMap, 3).map(([a, n]) => `${a} (${n})`)
      takeaways.push({
        category: "Intervention Type",
        icon: "pill",
        highlight: topN(adminMap, 1)[0][0],
        text: `Intervention types observed: ${tops.join(", ")}.`,
      })
    }
  }

  // 11. Timeline
  const years = matched
    .map(t => {
      const m = (t.startDate || "").match(/\b(19|20)\d{2}\b/)
      return m ? parseInt(m[0]) : null
    })
    .filter((y): y is number => y !== null)

  if (years.length > 0) {
    const minY = Math.min(...years)
    const maxY = Math.max(...years)
    const span = maxY - minY
    takeaways.push({
      category: "Timeline",
      icon: "calendar",
      highlight: `${minY}–${maxY}`,
      text:
        minY === maxY
          ? `All matched trials were initiated in ${minY}.`
          : `Trial activity spans ${minY}–${maxY} (${span} year${span !== 1 ? "s" : ""}), indicating a ${span > 8 ? "well-established" : span > 3 ? "growing" : "recently emerging"} research focus.`,
    })
  }

  // Build summary sentence from computed facts
  const summaryParts: string[] = []

  summaryParts.push(
    `${total.toLocaleString()} trial${total !== 1 ? "s" : ""} matched "${term}" in the ${regionLabel(region)} dataset (${pct(total, allTrials.length)} of all records).`,
  )

  const topPhaseEntry = topN(phaseMap, 1)[0]
  if (topPhaseEntry) {
    summaryParts.push(`The majority are ${topPhaseEntry[0]} trials (${pct(topPhaseEntry[1], total)}).`)
  }

  const enrollVals = matched.filter(t => t.enrollment > 0).map(t => t.enrollment)
  if (enrollVals.length > 0) {
    const totalEnroll = enrollVals.reduce((a, b) => a + b, 0)
    summaryParts.push(`Combined target enrollment stands at ${totalEnroll.toLocaleString()} participants.`)
  }

  const durVals = matched.filter(t => t.durationYears > 0).map(t => t.durationYears)
  if (durVals.length > 0) {
    summaryParts.push(`Average trial duration is ${avg(durVals).toFixed(1)} years.`)
  }

  const topSponsorEntry = topN(sponsorMap, 1)[0]
  if (topSponsorEntry) {
    summaryParts.push(`${topSponsorEntry[0]} is the leading sponsor with ${topSponsorEntry[1]} trial${topSponsorEntry[1] !== 1 ? "s" : ""}.`)
  }

  const summary = summaryParts.join(" ")

  return { query, region, matchCount: total, summary, takeaways, noResults: false }
}
