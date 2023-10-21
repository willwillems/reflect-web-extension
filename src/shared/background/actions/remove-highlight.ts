import { assertString } from '../../lib/assert'
import { HighlightSnapshot } from '../../lib/types/highlight-snapshot'
import { RootStore } from '../models/root-store'

export async function removeHighlight({
  url,
  highlight,
  rootStore,
}: {
  url: string
  highlight: HighlightSnapshot
  rootStore: RootStore
}) {
  const link = rootStore.linkStore.findByUrl(url)
  const graphId = rootStore.graphStore.currentGraphId

  assertString(graphId, 'No graph ID found')

  if (!link) {
    return
  }

  link.removeHighlight(highlight)
  await link.setRemote()
}
