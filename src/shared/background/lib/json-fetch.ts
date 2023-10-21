export type JsonFetchOptions = RequestInit & {
  data?: any
}

export async function jsonFetch<T>(url: string, options?: JsonFetchOptions): Promise<T> {
  const headers = {
    ...(options?.headers ?? {}),
    ...(options?.data
      ? {
          'Content-Type': 'application/json; charset=utf-8',
        }
      : {}),
  }

  const body = options?.data ? JSON.stringify(options.data) : undefined

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}
