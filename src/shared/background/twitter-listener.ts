import { setLink } from './actions/set-link'
import { rootStore } from './models/store'

chrome.webRequest.onBeforeRequest.addListener(
  onTweetAction,
  {
    urls: [
      'https://twitter.com/i/api/graphql/**/CreateBookmark',
      'https://twitter.com/i/api/graphql/**/FavoriteTweet',
    ],
  },
  ['requestBody'],
)

interface TweetAction {
  variables: {
    tweet_id: string
  }
}

function onTweetAction(details: chrome.webRequest.WebRequestBodyDetails): void {
  // Pull out the body of the request
  const bodyText = getRequestBodyText(details)

  if (!bodyText) {
    return
  }

  // Parse the body into a JSON object
  const body = safeJsonParse<Partial<TweetAction>>(bodyText)

  // Pull out the tweet ID
  const tweetId = body?.variables?.tweet_id

  if (!tweetId) {
    return
  }

  const action = details.url.includes('CreateBookmark') ? 'bookmark' : 'favorite'

  saveTweetLink(tweetId, action)
}

async function saveTweetLink(
  tweetId: string,
  action: 'bookmark' | 'favorite' = 'bookmark',
) {
  const url = `https://twitter.com/i/web/status/${tweetId}`

  await rootStore.waitUntilReady()

  if (action === 'favorite' && !rootStore.saveFavoritedTweets) {
    console.log('[reflect]', 'Not saving favorited tweet link:', url)
    return
  }

  if (action === 'bookmark' && !rootStore.saveBookmarkedTweets) {
    console.log('[reflect]', 'Not saving bookmarked tweet link:', url)
    return
  }

  console.log('[reflect]', 'Saving tweet link:', url)

  await setLink({
    url,
    rootStore,
  })

  console.log('[reflect]', 'Saved tweet link:', url)
}

function getRequestBodyText(details: chrome.webRequest.WebRequestBodyDetails) {
  const bodyBuffer = details.requestBody?.raw?.[0]?.bytes

  if (!bodyBuffer) {
    return null
  }

  return new TextDecoder('utf-8').decode(bodyBuffer)
}

function safeJsonParse<T>(json: string) {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    return null
  }
}
