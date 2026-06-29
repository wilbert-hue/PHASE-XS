/** Strip CTRI Number suffixes like "[Registered on: …] Trial Registered Prospectively". */
export function normalizeCtriId(raw: string | undefined | null): string {
  const s0 = (raw ?? "").trim()
  if (!s0) return ""
  let s = s0
  const bracket = s.indexOf("[")
  if (bracket >= 0) s = s.slice(0, bracket).trim()
  s = s.replace(/\s+Trial\s+Registered\s+(Prospectively|Retrospectively)\s*$/i, "").trim()
  s = s.replace(/\s+Registered\s+(Prospectively|Retrospectively)\s*$/i, "").trim()
  const m = s.match(/CTRI\/[\d/]+/i)
  return m ? m[0] : s
}
