import { RootStore } from '../models/root-store'

export async function removeLink({
  url,
  rootStore,
}: {
  url: string
  rootStore: RootStore
}) {
  const link = rootStore.linkStore.findByUrl(url)
  const graphId = rootStore.graphStore.currentGraphId

  if (link) {
    rootStore.linkStore.removeLink(link)
  }

  if (graphId) {
    await rootStore.client.deleteLinkByUrl(graphId, url)
  }
}
