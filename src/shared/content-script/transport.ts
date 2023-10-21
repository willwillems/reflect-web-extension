import { cloneDeep } from 'lodash'
import { getLocationUrl } from '../lib/location'
import { onLocationChange } from '../lib/on-location-change'
import { LinkSnapshot } from '../lib/types/link-snapshot'
import {
  ContentScriptReadyMessage,
  LINK_TRANSPORT,
  Message,
} from '../lib/types/message-types'

import { setMarks } from './highlight/manager'
import { setLink } from './store'
import { setToolbar } from './toolbar/manager'

let sharedPort: chrome.runtime.Port | null = null

function getPort() {
  if (sharedPort) {
    return sharedPort
  }

  sharedPort = chrome.runtime.connect({
    name: LINK_TRANSPORT,
  })

  sharedPort.onDisconnect.addListener(() => {
    sharedPort = null
  })

  sharedPort.onMessage.addListener(onMessage)

  return sharedPort
}

function postSubscribe(port: chrome.runtime.Port) {
  const url = getLocationUrl()

  const message: ContentScriptReadyMessage = {
    type: 'content-script-ready',
    args: { url },
  }

  try {
    const messageCopy = cloneDeep(message) 
    port.postMessage(messageCopy)
  } catch (error) {
    console.error('[reflect]', 'content-script-ready error', error)
  }
}

function onLinkSnapshot(link: LinkSnapshot | null) {
  setLink(link)
  setMarks(link)
  setToolbar(link)
}

function onMessage(message: Message) {
  switch (message.type) {
    case 'link-snapshot':
      onLinkSnapshot(message.args.snapshot)
      break
  }
}

function onLoad() {
  // This works by:
  //   1. Sending a LINK_SUBSCRIBE message to the background
  //   2. Background responds with a LINK_SNAPSHOT message
  //   3. Highlights are updated
  const port = getPort()

  // Each time we get connected, subscribe with the current
  // URL so that we can receive updates for that URL
  postSubscribe(port)
}

onLoad()
onLocationChange(onLoad)
document.addEventListener('turbolinks:render', onLoad)
