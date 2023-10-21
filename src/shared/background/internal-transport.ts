import { showLinkSavedNotification } from '../lib/notification'
import type {
  SetLinkMessage,
  GetAuthUrlMessage,
  GetStateMessage,
  KindleSyncEnabledMessage,
  Message,
  SetDefaultGraphIdMessage,
  RemoveLinkMessage,
  RemoveHighlightMessage,
} from '../lib/types/message-types'
import type { StateSnapshot } from '../lib/types/state-snapshot'

import { removeHighlight } from './actions/remove-highlight'
import { removeLink } from './actions/remove-link'
import { setLink } from './actions/set-link'
import { rootStore } from './models/store'
import { signOut } from './services/auth'
import { performSync } from './services/kindle'

async function processSetLinkMessage(message: SetLinkMessage) {
  console.log('[reflect] setting link', message.args)
  showLinkSavedNotification()
  await setLink({
    ...message.args,
    rootStore,
  })
}

async function processRemoveLinkMessage(message: RemoveLinkMessage) {
  console.log('[reflect] removing link', message)
  await removeLink({
    ...message.args,
    rootStore,
  })
}

async function processRemoveHighlightMessage(message: RemoveHighlightMessage) {
  console.log('[reflect] removing highlight', message)
  await removeHighlight({
    ...message.args,
    rootStore,
  })
}

function processSetDefaultGraphIdMessage(message: SetDefaultGraphIdMessage) {
  console.log('[reflect] setting default graph id to', message.args.graphId)
  rootStore.graphStore.setDefaultGraphId(message.args.graphId)
}

function processGetAuthUrlMessage(_message: GetAuthUrlMessage): string {
  return rootStore.client.generateAuthUrl()
}

function processGetStateMessage(_message: GetStateMessage): StateSnapshot {
  return rootStore.snapshot
}

function processKindleSyncEnabledMessage(message: KindleSyncEnabledMessage) {
  rootStore.kindleStore.setEnabled(message.args.enabled)
}

async function processMessage(message: Message): Promise<any> {
  const inBackground = typeof window === 'undefined'

  console.log('[reflect] internal-transport incoming message', { message, inBackground })

  switch (message.type) {
    case 'kindle-sync':
      return performSync()
    case 'kindle-sync-enabled':
      return processKindleSyncEnabledMessage(message)
    case 'sign-out':
      return signOut()
    case 'set-default-graph-id':
      return processSetDefaultGraphIdMessage(message)
    case 'set-link':
      return processSetLinkMessage(message)
    case 'remove-link':
      return processRemoveLinkMessage(message)
    case 'remove-highlight':
      return processRemoveHighlightMessage(message)
    case 'get-state':
      return processGetStateMessage(message)
    case 'get-auth-url':
      return processGetAuthUrlMessage(message)
    case 'set-auto-highlight':
      rootStore.setAutoHighlight(message.args.enabled)
      break
    case 'set-save-bookmarked-tweets':
      rootStore.setSaveBookmarkedTweets(message.args.enabled)
      break
    case 'set-save-favorited-tweets':
      rootStore.setSaveFavoritedTweets(message.args.enabled)
      break
    case 'options-opened':
      rootStore.checkPermissionsWhenReady()
      break
  }
}

console.log('[reflect]', 'Setting up background listener...')

// This listener is used to receive messages from internal extension
// pages like options.tsx and popup.tsx. It's important that it returns true.
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  processMessage(request)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error?.message ?? true }))

  return true
})
