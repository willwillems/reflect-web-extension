import { LinkHighlight } from '../../lib/client.types'

export function normalizeHighlights(
  highlights: LinkHighlight[] | string[],
): LinkHighlight[] {
  return highlights.map((highlight: LinkHighlight | string) => {
    if (typeof highlight === 'string') {
      return {
        offset: null,
        text: highlight,
      }
    }

    return highlight
  })
}
