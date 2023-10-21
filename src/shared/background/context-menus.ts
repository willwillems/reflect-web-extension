import { showLinkSavedNotification } from '../lib/notification'
import { platformIsMac } from '../lib/platform'

import { setLink } from './actions/set-link'
import { Highlight } from './models/highlight'
import { rootStore } from './models/store'

const CONTEXT_MENU_ID = 'reflect-highlight'

const shortcut = platformIsMac ? '⌘⇧p' : 'control+shift+p'

function createContextMenu() {
  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    title: `Save Highlight to Reflect  ${shortcut}`,
    contexts: ['selection'],
    id: CONTEXT_MENU_ID,
  })
}

// For Chrome, it's sufficient that we create context menu when extension is
// installed. For Safari, it needs to be created each time the extension starts.

createContextMenu()

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu()
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.url) {
    await rootStore.waitUntilReady()

    if (!rootStore.graphStore.currentGraph) {
      console.error('[reflect] graph ID not found')
      chrome.runtime.openOptionsPage()
      return
    }

    if (!rootStore.isSignedIn) {
      console.error('[reflect] access token not found')
      chrome.runtime.openOptionsPage()
      return
    }

    const text = (info.selectionText ?? '').trim()

    // TODO - calculate offset?
    // See also: https://height.app/dWwdXWnlP/T-1004
    const highlight: Highlight = { text, offset: null }

    setLink({
      url: tab.url,
      title: tab.title,
      highlight,
      rootStore,
    })

    showLinkSavedNotification()
  }
})
