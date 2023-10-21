import { getPageData } from '../lib/page'

import { setLink } from './actions/set-link'
import { rootStore } from './models/store'

chrome.action.onClicked.addListener(async () => {
  await rootStore.waitUntilReady()

  if (!rootStore.isSignedIn) {
    console.error('[reflect] access token not found')
    chrome.runtime.openOptionsPage()
    return
  }

  if (!rootStore.graphStore.currentGraph) {
    console.error('[reflect] graph ID not found')
    chrome.runtime.openOptionsPage()
    return
  }

  const pageData = await getPageData()

  if (!pageData.url) {
    console.error('[reflect] URL not found')
    return
  }

  // If existing link, toggle to show the toolbar
  const existingLink = rootStore.linkStore.findByUrl(pageData.url)

  if (existingLink) {
    console.log('[reflect] Link found. Toggling toolbar.', existingLink)
    rootStore.toggleShowToolbar()
    return
  }

  const result = await setLink({
    url: pageData.url,
    title: pageData.title,
    description: pageData.ogDescription || pageData.metaDescription,
    highlight: pageData.selectionText
      ? {
          text: pageData.selectionText,
          offset: pageData.selectionOffset ?? null,
        }
      : undefined,
    rootStore,
  })

  console.log('[reflect] Link set', result)
})
