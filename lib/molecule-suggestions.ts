/** Split regimen / combo molecule cells into plausible INN-ish tokens */
function tokenizeMoleculeField(raw: string): string[] {
  const s = raw.trim()
  if (!s) return []

  const chunks = s.split(/[/|,;+]+/).flatMap(c => c.split(/\s+and\s+/gi))
  const tokens: string[] = []

  for (const chunk of chunks) {
    for (const w of chunk.split(/\s+/)) {
      const t = w.replace(/^[^\wÀ-ÖØ-öø-ÿ-]+|[^\wÀ-ÖØ-öø-ÿ-]+$/g, "").trim()
      if (t.length >= 3 && /[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(t)) tokens.push(t)
    }
  }

  const dedup = new Map<string, string>()
  for (const t of tokens) {
    const low = t.toLowerCase()
    if (!dedup.has(low)) dedup.set(low, t)
  }
  return [...dedup.values()]
}

/** lower-case key → preferred display token (first seen casing in source) */
export function buildMoleculeSuggestionCatalog(trials: readonly { molecule: string }[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const row of trials) {
    for (const token of tokenizeMoleculeField(row.molecule ?? "")) {
      const low = token.toLowerCase()
      if (!map.has(low)) map.set(low, token)
    }
  }
  return map
}

const MIN_FRAGMENT = 2

export function moleculePrefixSuggestions(
  catalog: Map<string, string>,
  queryFragment: string,
  limit = 12,
): string[] {
  const q = queryFragment.trim().toLowerCase()
  if (q.length < MIN_FRAGMENT) return []

  const hits: string[] = []
  for (const [low, label] of catalog) {
    if (low.startsWith(q)) hits.push(label)
  }
  hits.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  return hits.slice(0, limit)
}

/** Text after last comma — supports `term1, partial` comparison typing */
export function activeSearchTypingSegment(fullSearch: string): string {
  const lastComma = fullSearch.lastIndexOf(",")
  const tail = lastComma >= 0 ? fullSearch.slice(lastComma + 1) : fullSearch
  return tail.trimStart()
}

export function applyMoleculeSuggestion(fullSearch: string, moleculePick: string): string {
  const lastComma = fullSearch.lastIndexOf(",")
  if (lastComma < 0) return moleculePick
  const before = fullSearch.slice(0, lastComma + 1).replace(/\s+$/,"")
  return `${before} ${moleculePick}`.trim()
}
