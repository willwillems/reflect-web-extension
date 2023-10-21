export interface Highlight {
  text: string
  offset: number | null
}

export function isEqual(a: Highlight, b: Highlight) {
  return a.text === b.text && a.offset === b.offset
}
