import { assert } from '../../lib/assert'
import type { Highlight } from '../models/highlight'
import { RootStore } from '../models/root-store'

export function setLink({
  url,
  title,
  description,
  highlight,
  rootStore,
}: {
  url: string
  title?: string
  description?: string
  highlight?: Highlight
  rootStore: RootStore
}) {
  const { graphStore } = rootStore
  const graph = graphStore.currentGraph
  assert(graph, 'No graph found')

  const link = graph.linkStore.findOrCreateByUrl(url)

  if (title) {
    link.setTitle(title)
  }

  if (description) {
    link.setDescription(description)
  }

  if (highlight) {
    link.addHighlight(highlight)
  }

  return link.setRemote()
}
