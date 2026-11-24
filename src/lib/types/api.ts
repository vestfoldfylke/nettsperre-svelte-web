export type HttpMethod = "GET" | "POST" | "PUT"

export type ApiResponse<T> = {
  status: number
  data: T
}

export type ApiErrorResult = {
  error: unknown
}

export type BlockStatus = "pending" | "active" | "expired"

export type BlockType = "fullBlock" | "eksamen" | "forms" | "formsFile"

export type BlockPayload = Record<string, unknown>

export type PersistedBlockPayload = BlockPayload & {
  _id: string
}
