export const LIST_TEXT_MAX = 200

export function truncateForList(text: string, max = LIST_TEXT_MAX): string {
  const s = (text ?? "").trim()
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}
