const JSON_CONTENT_TYPE = "application/json"

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

const parseBody = async (response) => {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes(JSON_CONTENT_TYPE)) {
    return await response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

/**
 * Sends an authorized request and returns `{ status, data }`. Throws ApiError on non-2xx responses (same contract as axios)
 */
export const apiRequest = async (method, url, token, body) => {
  const headers = {
    Authorization: `Bearer ${token}`
  }

  if (body !== undefined) {
    headers["Content-Type"] = JSON_CONTENT_TYPE
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  const data = await parseBody(response)
  if (!response.ok) {
    throw new ApiError(`${method} ${url} failed with status ${response.status} ${response.statusText}. Check the API response for details and try again`, response.status, data)
  }

  return { status: response.status, data }
}
