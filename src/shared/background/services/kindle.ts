import { selectAll, selectOne } from 'css-select'
import { DomHandler, Element, Node } from 'domhandler'
import { getAttributeValue, textContent } from 'domutils'
import { Parser } from 'htmlparser2'
import { uniq } from 'lodash'

import { retry } from '../../lib/retry'
import { Book, BookNote } from '../../lib/types/book'
import { KindleSync } from '../models/kindle-sync'
import { rootStore } from '../models/store'

export const KINDLE_OWNED_CONTENT_URL = 'kindle-owned-content-url'

export async function performSync(graphId = rootStore.graphStore.currentGraphId) {
  if (!graphId) {
    console.error('Default graph not set')
    return
  }

  if (!rootStore.kindleStore.readyToSync) {
    console.error('Kindle not ready to sync')
    return
  }

  const sync = rootStore.kindleStore.startSync()

  sync.log('Starting Kindle sync...')

  try {
    const content = await fetchOwnedContent()

    sync.setTotalCount(content.length)
    sync.log(`Fetching notes for ${content.length} books`)

    const books = await convertOwnedContentToBooks(content, sync)

    sync.log('Syncing books to graph...')

    await rootStore.client.batchSyncBooks(graphId, books)

    sync.success()
    sync.log('Successfully finished sync')
  } catch (error: any) {
    sync.setErrorMessage(error?.message ?? 'Unknown error')
    sync.setStatus('error')
    sync.log(error?.message ?? 'Unknown error')
  }
}

// Authors is a weird array that looks like this:
// ["Lindauer, Mel:Larimore, Taylor:LeBoeuf, Michael:"]
function convertAuthors(authors: string[]) {
  const authorsArray = authors.flatMap((author) => author.split(':'))

  // Convert `Brown, Brené` to Brené Brown
  // Remove blank authors
  const reverseAuthorsArray = authorsArray
    .map((author) => author.split(', ').reverse().join(' '))
    .filter((a) => a)

  return uniq(reverseAuthorsArray)
}

async function convertOwnedContentToBooks(
  content: OwnedContentItemsList[],
  sync: KindleSync,
): Promise<Book[]> {
  const books: Book[] = []

  for (const book of content) {
    sync.log(`Fetching notes for: ${book.title}`)

    await retry(async () => {
      const notes = await fetchNotes(book.asin)

      books.push({
        asin: book.asin,
        authors: convertAuthors(book.authors),
        title: book.title,
        cover_src: book.productUrl,
        notes,
      })
    })

    sync.incrementProcessed()
  }

  return books
}

async function fetchOwnedContent(paginationToken?: string) {
  const ownedContentUrl = rootStore.kindleStore.ownedContentUrl

  if (!ownedContentUrl) {
    throw 'No owned content url set'
  }

  const url = new URL(ownedContentUrl)

  // Make sure we don't have a pagination token
  url.searchParams.delete('paginationToken')

  // Make sure we don't record this request
  url.searchParams.delete('from_ext')

  if (paginationToken) {
    url.searchParams.set('paginationToken', paginationToken)
  }

  const response = await fetch(url.href)

  if (response.status !== 200) {
    console.error('Invalid response', response)
    throw new Error('Invalid response: ' + response.status)
  }

  const data = (await response.json()) as OwnedContentResponse

  const { paginationToken: nextPaginationToken, itemsList } = data

  let content = itemsList

  if (nextPaginationToken && itemsList) {
    const rest = await fetchOwnedContent(nextPaginationToken)

    content = [...content, ...rest]
  }

  return content
}

async function fetchNotes(asin: string) {
  let notes: BookNote[] = []
  let nextPageToken: string | undefined | null
  let nextContentLimitState: string | undefined | null
  let pages = 0

  do {
    pages++

    if (pages > 10) {
      console.error('[reflect]', `Too many pages for ${asin}`)
      break
    }

    const url = new URL('https://read.amazon.com/notebook')
    url.searchParams.set('asin', asin)
    url.searchParams.set('contentLimitState', nextContentLimitState || '')

    if (nextPageToken) {
      url.searchParams.set('token', nextPageToken)
    }

    const response = await fetch(url.href, {
      credentials: 'include',
    })

    const parsedNotesFragment = await parseNotesFragment(await response.text())

    notes = [...notes, ...parsedNotesFragment.notes]
    nextPageToken = parsedNotesFragment.nextPageToken
    nextContentLimitState = parsedNotesFragment.nextContentLimitState
  } while (nextPageToken)

  return notes
}

function htmlToDom(html: string): Promise<Node[]> {
  return new Promise((resolve, reject) => {
    const handler = new DomHandler((error, dom) => {
      if (error) {
        // Handle error
        reject(error)
      } else {
        // Parsing completed, do something
        resolve(dom)
      }
    })
    const parser = new Parser(handler)
    parser.write(html)
    parser.end()
  })
}

async function parseNotesFragment(htmlString: string) {
  const doc = await htmlToDom(htmlString)

  const notes: BookNote[] = []

  const nodes = selectAll<Node, Element>('.a-row.a-spacing-base', doc)

  for (const node of nodes) {
    const pageTextNode = selectOne('.kp-notebook-metadata', node.children)
    const highlightTextNode = selectOne('.kp-notebook-highlight', node.children)
    const noteTextNode = selectOne('.kp-notebook-note', node.children)

    const pageText = pageTextNode && textContent(pageTextNode)
    const highlightText = highlightTextNode && textContent(highlightTextNode)
    const noteText = noteTextNode && textContent(noteTextNode)

    const [, extractedPage] = pageText?.match(/Page:\s+([\d,]+)/) || []
    const [, extractedLocation] = pageText?.match(/Location:\s+([\d,]+)/) || []

    const page = extractedPage
      ? Number.parseInt(extractedPage.replaceAll(',', ''), 10)
      : undefined
    const location = extractedLocation
      ? Number.parseInt(extractedLocation.replaceAll(',', ''), 10)
      : undefined

    const highlight = highlightText?.replace(/^Highlight:/, '')?.trim()
    const note = noteText?.replace(/^Note:/, '')?.trim()
    const hasPageOrLocation = page != null || location != null

    if (hasPageOrLocation && (highlightText || noteText)) {
      notes.push({
        page,
        location,
        type: note ? 'note' : 'highlight',
        value: note || highlight,
      })
    }
  }

  const nextPageTokenElement = selectOne<Node, Element>(
    '.kp-notebook-annotations-next-page-start',
    doc,
  )
  const nextPageToken =
    nextPageTokenElement && getAttributeValue(nextPageTokenElement, 'value')

  const nextContentLimitStateElement = selectOne<Node, Element>(
    '.kp-notebook-content-limit-state',
    doc,
  )
  const nextContentLimitState =
    nextContentLimitStateElement &&
    getAttributeValue(nextContentLimitStateElement, 'value')

  return {
    notes,
    nextPageToken,
    nextContentLimitState,
  }
}

// Kindle responses

interface OwnedContentItemsList {
  asin: string
  webReaderUrl: string
  productUrl: string
  title: string
  percentageRead: number
  authors: string[]
  resourceType: string
  originType: string
  mangaOrComicAsin: boolean
}

interface OwnedContentResponse {
  itemsList: OwnedContentItemsList[]
  libraryType: string
  sortType: string
  paginationToken?: string
}
