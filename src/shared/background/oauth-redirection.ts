import { rootStore } from './models/store'
import { processAuthCallback } from './services/auth'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'loading' &&
    tab.url?.startsWith(rootStore.client.redirectUrl)
  ) {
    const url = new URL(tab.url)
    const code = url.searchParams.get('code')

    if (code) {
      processAuthCallback({ code })
    }

    chrome.tabs.remove(tabId)
  }
})
