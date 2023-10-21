import { uniqBy } from 'lodash'
import { computed } from 'mobx'
import {
  getParent,
  getRootStore,
  idProp,
  Model,
  model,
  modelAction,
  prop,
} from 'mobx-keystone'

import { assert } from '../../lib/assert'
import type { LinkSnapshot } from '../../lib/types/link-snapshot'

import { isEqual, type Highlight } from './highlight'
import { LinkStore } from './link-store'
import type { RootStore } from './root-store'

@model('Link')
export class Link extends Model({
  id: idProp,
  url: prop<string>().withSetter(),
  title: prop<string | null>(null).withSetter(),
  description: prop<string | null>(null).withSetter(),
  highlights: prop<Highlight[]>(() => []).withSetter(),
  remoteId: prop<string | null>(null).withSetter(),
}) {
  @modelAction
  addHighlight(highlight: Highlight) {
    this.highlights = uniqBy([...this.highlights, highlight], (hl) => hl.text + hl.offset)
  }

  @modelAction
  removeHighlight(highlight: Highlight) {
    this.highlights = this.highlights.filter((hl) => !isEqual(hl, highlight))
  }

  @computed
  get snapshot(): LinkSnapshot {
    return {
      url: this.url,
      title: this.title,
      description: this.description,
      highlights: this.highlights,
      noteUrl: this.noteUrl,
      autoHighlight: this.rootStore.autoHighlight,
      showToolbar: this.rootStore.showToolbar,
    }
  }

  get noteUrl(): string | null {
    return this.remoteId
      ? `https://reflect.app/g/${this.graph.id}/link-${this.remoteId}`
      : null
  }

  async setRemote() {
    const result = await this.client.setLink(this.graph.id, {
      url: this.url,
      title: this.title,
      description: this.description,
      highlights: this.highlights,
    })

    this.setRemoteId(result.id)
  }

  private get linkStore(): LinkStore {
    const links = getParent<Link[]>(this)
    const store = links && getParent<LinkStore>(links)
    assert(store, 'No link store found')
    return store
  }

  private get graph() {
    return this.linkStore.graph
  }

  private get rootStore() {
    const store = getRootStore<RootStore>(this)
    assert(store, 'No root store found')
    return store
  }

  private get client() {
    return this.rootStore.client
  }
}
