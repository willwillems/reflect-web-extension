import { rootStore } from './models/store'
import { performSync } from './services/kindle'

async function onKindleOwnedContentHeaders(
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails,
) {
  // Close the tab since we don't need it
  if (details.tabId !== -1) {
    chrome.tabs.remove(details.tabId)
  }

  console.log('[reflect]', 'Stored owned content url: ', details.url)
  rootStore.kindleStore.setOwnedContentUrl(details.url)
  rootStore.kindleStore.setEnabled(true)

  if (rootStore.kindleStore.readyToSync) {
    console.log('[reflect]', 'Kicking off sync via Amazon web request...')

    try {
      await performSync()
    } catch (error) {
      console.error('[reflect]', 'Error syncing:', error)
    }
  }
}

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.url.includes('from_ext=true')) {
      onKindleOwnedContentHeaders(details)
    }
  },
  {
    url: [{ urlPrefix: 'https://read.amazon.com/kindle-library/search' }],
  },
)
