import type { ApiResponse, HttpMethod } from "./types/api.js"

const JSON_CONTENT_TYPE = "application/json"

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

const parseBody = async (response: Response): Promise<unknown> => {
  const contentType: string = response.headers.get("content-type") ?? ""
  if (contentType.includes(JSON_CONTENT_TYPE)) {
    return await response.json()
  }

  const text: string = await response.text()
  return text.length > 0 ? text : null
}

const buildRequestInit = (method: HttpMethod, bearerToken: string, body: unknown): RequestInit => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${bearerToken}`
  }

  if (body === undefined) {
    return {
      method,
      headers
    }
  }

  headers["Content-Type"] = JSON_CONTENT_TYPE

  return {
    method,
    headers,
    body: JSON.stringify(body)
  }
}

/**
 * Sends an authorized request and returns `{ status, data }`. Throws ApiError on non-2xx responses (same contract as axios)
 */
export const apiRequest = async <T = unknown>(method: HttpMethod, url: string, bearerToken: string, body?: unknown): Promise<ApiResponse<T>> => {
  const response: Response = await fetch(url, buildRequestInit(method, bearerToken, body))
  const data: unknown = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(`${method} ${url} failed with status ${response.status} ${response.statusText}. Check the API response for details and try again`, response.status, data)
  }

  return {
    status: response.status,
    data: data as T
  }
}
