import { autorun, makeObservable, observable } from 'mobx'

import { LinkSnapshot } from '../../lib/types/link-snapshot'
import {
  LinkSnapshotMessage,
  ContentScriptReadyMessage,
  Message,
} from '../../lib/types/message-types'
import { Link } from '../models/link'
import { rootStore } from '../models/store'

export class ContentScriptTransport {
  @observable
  url?: string

  @observable
  port: chrome.runtime.Port

  snapshotUnsubscribe?: () => void

  // This listener is used to transport messages from the
  // content-script to the background script
  static listen(port: chrome.runtime.Port) {
    const transport = new this(port)
    transport.addListeners()
  }

  constructor(port: chrome.runtime.Port) {
    makeObservable(this)
    this.port = port
  }

  private addListeners() {
    this.port.onMessage.addListener((msg) => this.onMessage(msg))
    this.port.onDisconnect.addListener(() => this.onDisconnect())
  }

  private postLinkSnapshot(link: Link | null) {
    const snapshot: LinkSnapshot | null = link?.snapshot ?? null

    const linkSnapshot: LinkSnapshotMessage = {
      type: 'link-snapshot',
      args: { snapshot },
    }

    try {
      this.port.postMessage(linkSnapshot)
    } catch (error) {
      console.error('Error posting link snapshot: ', error)
    }
  }

  private onDisconnect() {
    this.snapshotUnsubscribe?.()
  }

  private onContentScriptReadyMessage(message: ContentScriptReadyMessage) {
    rootStore.checkPermissionsWithDelay()

    this.subscribeToUrl(message.args.url)
  }

  private onMessage(message: Message) {
    switch (message.type) {
      case 'content-script-ready':
        this.onContentScriptReadyMessage(message)
        break
    }
  }

  private subscribeToUrl(url: string) {
    this.snapshotUnsubscribe?.()
    this.url = url

    this.snapshotUnsubscribe = autorun(() => {
      try {
        if (this.url) {
          const link = rootStore.linkStore.findByUrl(this.url)
          this.postLinkSnapshot(link)
        }
      } catch (error) {
        console.error('Error subscribing: ', error)
      }
    })
  }
}
