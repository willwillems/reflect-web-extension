import { getParent, getRootStore, Model, model, modelAction, prop } from 'mobx-keystone'

import { assert } from '../../lib/assert'
import { computedFn } from '../../lib/mobx-utils-fns'

import type { Graph } from './graph'
import { normalizeHighlights } from './lib/highlights'
import { Link } from './link'
import type { RootStore } from './root-store'

@model('LinkStore')
export class LinkStore extends Model({
  links: prop<Link[]>(() => []).withSetter(),
}) {
  @modelAction
  addLink(link: Link) {
    this.links.push(link)
  }

  @modelAction
  removeLink(link: Link) {
    this.links = this.links.filter((l) => l !== link)
  }

  @modelAction
  removeLinkByUrl(url: string) {
    this.links = this.links.filter((link) => link.url !== url)
  }

  @computedFn()
  findByUrl(url: string): Link | null {
    return this.links.find((link) => link.url === url) ?? null
  }

  findOrCreateByUrl(url: string): Link {
    const link = this.findByUrl(url)

    if (link) {
      return link
    }

    const newLink = new Link({ url })
    this.addLink(newLink)

    return newLink
  }

  async fetchLinks() {
    const clientLinks = await this.client.getLinks(this.graph.id)

    const links = clientLinks.map((clientLink) => {
      const highlights = normalizeHighlights(clientLink.highlights)

      return new Link({
        url: clientLink.url,
        title: clientLink.title,
        description: clientLink.description,
        highlights,
      })
    })

    this.setLinks(links)
  }

  get graph() {
    const model = getParent<Graph>(this)
    assert(model, 'graph not set')
    return model
  }

  protected onAttachedToRootStore() {
    this.fetchLinksWhenReady()
  }

  private async fetchLinksWhenReady() {
    await this.rootStore.waitUntilReady()

    if (this.links.length === 0) {
      this.fetchLinks()
    }
  }

  private get rootStore() {
    const rootStore = getRootStore<RootStore>(this)
    assert(rootStore, 'No root store found')
    return rootStore
  }

  private get client() {
    return this.rootStore.client
  }
}
