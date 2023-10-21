export async function getTabs(): Promise<chrome.tabs.Tab[]> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs
}

export async function getTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await getTabs()
  const [tab] = tabs
  return tab
}
