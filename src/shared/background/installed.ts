import { rootStore } from './models/store'

chrome.runtime.onInstalled.addListener(async () => {
  await rootStore.waitUntilReady()

  if (!rootStore.isSignedIn) {
    chrome.runtime.openOptionsPage()
  }
})
