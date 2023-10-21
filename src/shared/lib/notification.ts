// Shows a tick in the popup. background.js only
export async function showLinkSavedNotification() {
  await chrome.action.setBadgeText({ text: '✓' })

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' })
  }, 3000)
}
