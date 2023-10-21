import first from 'lodash/first'
import sortBy from 'lodash/sortBy'
import { computed } from 'mobx'
import { Model, model, modelAction, prop } from 'mobx-keystone'

import { KindleSync } from './kindle-sync'

@model('KindleStore')
export class KindleStore extends Model({
  syncs: prop<KindleSync[]>(() => []).withSetter(),
  ownedContentUrl: prop<string | null>(null).withSetter(),
  enabled: prop(true).withSetter(),
}) {
  @computed
  get readyToSync() {
    // TODO - check if last sync wasn't recent
    return this.enabled
  }

  @computed
  get orderedSyncs() {
    return sortBy(this.syncs, (s) => s.createdAt).reverse()
  }

  @computed
  get recentSyncs() {
    return this.orderedSyncs.slice(0, 4)
  }

  @computed
  get lastSync() {
    return first(this.orderedSyncs)
  }

  @computed
  get lastSyncAt() {
    return this.lastSyncAt?.createdAt
  }

  @computed
  get hasSetupKindle() {
    return !!this.ownedContentUrl
  }

  @modelAction
  startSync() {
    const sync = new KindleSync({})
    this.syncs.push(sync)
    return sync
  }
}
