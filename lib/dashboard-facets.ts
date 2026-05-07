/**
 * True when selected includes every catalogue value (extras allowed but ignored).
 */
export function selectionCoversCatalog(
  selected: readonly string[],
  catalog: readonly string[],
): boolean {
  if (!catalog.length) return true
  const set = new Set(selected)
  return catalog.every(c => set.has(c))
}

/** Narrowing facet: some selection exists and it does not cover the entire catalogue. */
export function facetApplied(selected: readonly string[], catalog: readonly string[]): boolean {
  if (!selected.length) return false
  return !selectionCoversCatalog(selected, catalog)
}
