import { chunk } from 'lodash'
import { v4 as createUuid } from 'uuid'

import { Book } from '../../lib/types/book'

import { Graph, LinkRequest, LinkResponse } from './client.types'
import { JsonFetchOptions, jsonFetch } from './json-fetch'

interface ClientOptions {
  clientId: string
  clientSecret: string
  redirectUrl: string
  accessToken: string | null
}

export class Client {
  clientId: string
  clientSecret: string
  redirectUrl: string
  accessToken: string | null = null
  private state?: string

  endpoint = 'https://reflect.app'
  authPath = '/oauth'
  tokenPath = '/api/oauth/token'
  graphsPath = '/api/graphs'
  userTraitsPath = '/api/users/me/traits'
  notesPath = (graphId: string) => `/api/graphs/${graphId}/notes`
  linksPath = (graphId: string) => `/api/graphs/${graphId}/links`
  linkPath = (graphId: string, linkId: string) => `${this.linksPath(graphId)}/${linkId}}`
  backlinksPath = (graphId: string) => `/api/graphs/${graphId}/backlinks`
  booksPath = (graphId: string) => `/api/graphs/${graphId}/books`

  constructor({
    clientId,
    clientSecret,
    redirectUrl,
    accessToken = null,
  }: ClientOptions) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUrl = redirectUrl
    this.accessToken = accessToken
  }

  private generateState(): string {
    if (!this.state) {
      this.state = createUuid()
    }
    return this.state
  }

  generateAuthUrl() {
    const url = new URL(this.endpoint + this.authPath)
    url.searchParams.set('client_id', this.clientId)
    url.searchParams.set('state', this.generateState())
    url.searchParams.set('redirect_uri', this.redirectUrl)
    return url.href
  }

  setToken(value: string | null) {
    this.accessToken = value
  }

  async getToken(code: string): Promise<string> {
    const { access_token: accessToken } = await this.jsonPost<{ access_token: string }>(
      this.tokenPath,
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      },
    )

    this.accessToken = accessToken

    return accessToken
  }

  syncBooks(graphId: string, books: Book[]) {
    return this.jsonPost(this.booksPath(graphId) + '/sync', {
      books: books,
    })
  }

  async batchSyncBooks(graphId: string, books: Book[]) {
    for (const bookChunk of chunk(books, 100)) {
      try {
        await this.syncBooks(graphId, bookChunk)
      } catch (e) {
        console.error(e)
      }
    }
  }

  getGraphs(): Promise<Graph[]> {
    return this.jsonGet(this.graphsPath)
  }

  setLink(graphId: string, data: LinkRequest) {
    return this.jsonPost<LinkResponse>(this.linksPath(graphId), data)
  }

  deleteLinkByUrl(graphId: string, url: string) {
    return this.jsonFetch(this.linksPath(graphId), {
      method: 'DELETE',
      headers: this.authHeaders,
      data: {
        url,
      },
    })
  }

  getLinks(graphId: string) {
    return this.jsonGet<LinkResponse[]>(this.linksPath(graphId))
  }

  setUserTraits(traits: any) {
    return this.jsonPost(this.userTraitsPath, { traits })
  }

  private async jsonFetch<T>(path: string, options?: JsonFetchOptions): Promise<T> {
    return jsonFetch<T>(this.endpoint + path, {
      ...options,
      headers: {
        ...this.authHeaders,
        ...(options?.headers ?? {}),
      },
    })
  }

  private async jsonGet<T>(url: string, options?: JsonFetchOptions): Promise<T> {
    return this.jsonFetch<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  private async jsonPost<T>(
    url: string,
    data: any,
    options?: JsonFetchOptions,
  ): Promise<T> {
    return this.jsonFetch<T>(url, {
      ...options,
      method: 'POST',
      data,
    })
  }

  private get authHeaders() {
    const headers: HeadersInit = {
      ...(this.accessToken
        ? {
            Authorization: `Bearer ${this.accessToken}`,
          }
        : {}),
    }

    return headers
  }
}
