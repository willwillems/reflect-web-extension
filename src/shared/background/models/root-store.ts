import { computed, reaction, when } from 'mobx'
import { Model, model, modelAction, prop } from 'mobx-keystone'

import { assert } from '../../lib/assert'
import { sendMessage } from '../../lib/message'
import sleep from '../../lib/sleep'
import { StateSnapshot } from '../../lib/types/state-snapshot'
import { Client } from '../lib/client'
import { clientOptions } from '../services/client'

import { GraphStore } from './graph-store'
import { KindleStore } from './kindle-store'
import { UnsubscribeCallback, unsubscriberListeners } from './lib/unsubscribe-listeners'

@model('root')
export class RootStore extends Model({
  graphStore: prop<GraphStore>(() => new GraphStore({})),
  kindleStore: prop<KindleStore>(() => new KindleStore({})),
  accessToken: prop<string | null>(null).withSetter(),
  ready: prop<boolean>(false).withSetter(),
  canAccessAllWebsites: prop<boolean>(false).withSetter(),
  autoHighlight: prop<boolean>(true).withSetter(),
  showToolbar: prop<boolean>(true).withSetter(),
  saveBookmarkedTweets: prop<boolean>(true).withSetter(),
  saveFavoritedTweets: prop<boolean>(true).withSetter(),
}) {
  @modelAction
  reset() {
    this.graphStore = new GraphStore({})
    this.kindleStore = new KindleStore({})
    this.accessToken = null
  }

  toggleShowToolbar() {
    this.setShowToolbar(!this.showToolbar)
  }

  @computed
  get client() {
    return new Client({ ...clientOptions, accessToken: this.accessToken })
  }

  @computed
  get isSignedIn() {
    return !!this.accessToken
  }

  @computed
  get snapshot(): StateSnapshot {
    return {
      ready: this.ready,
      isSignedIn: this.isSignedIn,
      hasSetupKindle: this.kindleStore.hasSetupKindle,
      defaultGraphId: this.graphStore.defaultGraphId ?? null,
      currentGraphId: this.graphStore.currentGraphId ?? null,
      graphs: this.graphStore.graphs.map((graph) => graph.snapshot),
      recentKindleSyncs: this.kindleStore.recentSyncs.map((sync) => sync.snapshot),
      canAccessAllWebsites: this.canAccessAllWebsites,
      kindleSyncEnabled: this.kindleStore.enabled,
      autoHighlight: this.autoHighlight,
      showToolbar: this.showToolbar,
      saveBookmarkedTweets: this.saveBookmarkedTweets,
      saveFavoritedTweets: this.saveFavoritedTweets,
    }
  }

  async waitUntilReady() {
    await when(() => this.ready)
  }

  async waitUntilGraphsReady() {
    await when(() => this.graphStore.graphs.length > 0)
  }

  async postAuthSetup() {
    this.client.setUserTraits({ chrome_extension_installed: true })
    await this.waitUntilGraphsReady()
  }

  async checkPermissionsWhenReady() {
    await this.waitUntilReady()
    this.checkPermissions()
  }

  async checkPermissionsWithDelay() {
    // We need to wait for a short time before checking permissions, because
    // there is a delay between when the content script is loaded and when the
    // updated permissions are available to be checked.
    await sleep(500)
    this.checkPermissions()
  }

  /**
   * This method checks that user selected "Allow on all websites" (as opposed to
   * "Allow on reflect.app") by checking permissions for both reflect.app and
   * reflect.site.
   */
  checkPermissions() {
    chrome.permissions.contains(
      { origins: ['https://reflect.app/', 'https://reflect.site/'] },
      (result) => {
        this.setCanAccessAllWebsites(result)
      },
    )
  }

  get graph() {
    const model = this.graphStore.currentGraph
    assert(model, 'No graph found')
    return model
  }

  get linkStore() {
    return this.graph.linkStore
  }

  private listeners: UnsubscribeCallback[] = []

  onAttachedToRootStore() {
    this.listeners.push(
      reaction(
        () => this.snapshot,
        (snapshot) => {
          this.broadcastState(snapshot)
        },
        { fireImmediately: true },
      ),
    )

    this.checkPermissionsWhenReady()

    return () => this.beforeDetach()
  }

  private broadcastState(snapshot: StateSnapshot) {
    sendMessage({
      type: 'state-snapshot',
      args: {
        snapshot,
      },
    })
  }

  private beforeDetach() {
    unsubscriberListeners(this.listeners)
  }
}
