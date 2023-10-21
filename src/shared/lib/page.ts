import { getTab } from './tabs'

interface PageVariables {
  ogTitle?: string
  ogDescription?: string
  metaDescription?: string
  title?: string
  url?: string
  selectionText?: string
  selectionOffset?: number
}

export async function getPageData(): Promise<PageVariables> {
  const tab = await getTab()

  if (!tab || !tab.id) {
    return { url: tab?.url }
  }

  // In Chrome, we can pass `function` as argument to `chrome.scripting`.
  // However, in Safari, that doesn't work, so we pass file that contains
  // the function to get page data.
  //
  // See also: get-page-data.js
  // See also: https://developer.apple.com/forums/thread/714225

  try {
    const [pageData] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['get-page-data.js'],
    })

    if (!pageData) {
      console.error('[reflect] Page data not found')
      return {}
    }

    const data = 'result' in pageData ? pageData.result : pageData
    return data as PageVariables
  } catch (error) {
    console.error('[reflect] Error getting page data', error)
    return {}
  }
}
