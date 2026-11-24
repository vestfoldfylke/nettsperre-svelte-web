import type { IPublicClientApplication } from "@azure/msal-browser"
import { jwtDecode } from "jwt-decode"
import { apiRequest } from "./api-request.js"
import { getMsalClient, login } from "./auth/msal-auth.js"
import type { ApiErrorResult, ApiResponse, BlockPayload, BlockStatus, PersistedBlockPayload } from "./types/api.js"
import type { NettsperreTokenClaims, NettsperreUser } from "./types/auth.js"

type ApiResult = ApiResponse<unknown> | ApiErrorResult | Error

const apiUrl: string = import.meta.env.VITE_NETTSPERRE_API_URL
const NOT_LOGGED_IN_MESSAGE = "User not logged in yet - waiting for successful login"
const APP_REGISTRATION_FALLBACK = "appReg"
const VALID_BLOCK_STATUSES: BlockStatus[] = ["pending", "active", "expired"]

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error
  }

  return new Error(`Unexpected non-error value thrown: ${String(error)}`)
}

const decodeUser = (accessToken: string): NettsperreUser => {
  const { upn, roles, name, oid }: NettsperreTokenClaims = jwtDecode<NettsperreTokenClaims>(accessToken)

  return {
    upn: upn || APP_REGISTRATION_FALLBACK,
    name: name || APP_REGISTRATION_FALLBACK,
    oid: oid || APP_REGISTRATION_FALLBACK,
    roles: roles || []
  }
}

/**
 * Returns the access token for the user, or the decoded user when `decoded` is true.
 * Redirects to log in (and resolves undefined) if the token could not be acquired silently.
 */
export async function getNettsperreToken(decoded: true): Promise<NettsperreUser | undefined>
export async function getNettsperreToken(decoded?: false): Promise<string | undefined>
export async function getNettsperreToken(decoded: boolean = false): Promise<NettsperreUser | string | undefined> {
  try {
    const msalClient: IPublicClientApplication = await getMsalClient()
    if (!msalClient.getActiveAccount()) {
      console.log("Ingen aktiv bruker her enda - venter på ferdig pålogging før vi gjør API spørringer")
      throw new Error(NOT_LOGGED_IN_MESSAGE)
    }

    const { accessToken } = await msalClient.acquireTokenSilent({ scopes: [import.meta.env.VITE_DEFAULT_SCOPE] })

    return decoded ? decodeUser(accessToken) : accessToken
  } catch (error) {
    // Bruker er ikke ferdig innlogget enda - kast videre og vent på vellykket login
    if (error instanceof Error && error.message === NOT_LOGGED_IN_MESSAGE) {
      throw error
    }

    // acquireTokenSilent feilet selv om bruker (i session storage) er logget inn - refresh token er trolig utløpt, så vi logger inn på nytt
    await login(true)
    return undefined
  }
}

const requireBearer = async (): Promise<string> => {
  const token: string | undefined = await getNettsperreToken()
  if (token === undefined) {
    throw new Error("No access token available: silent token acquisition failed and the user is being redirected to login. Retry after login completes")
  }

  return token
}

const sendExpectingStatus = async (expectedStatus: number, request: Promise<ApiResponse<unknown>>): Promise<ApiResult> => {
  try {
    const response: ApiResponse<unknown> = await request
    if (response.status !== expectedStatus) {
      return {
        error: response.data
      }
    }

    return response
  } catch (error) {
    return toError(error)
  }
}

const sendCatchingErrors = async (request: Promise<ApiResponse<unknown>>): Promise<ApiResponse<unknown> | Error> => {
  try {
    return await request
  } catch (error) {
    return toError(error)
  }
}

const isValidBlockStatus = (status: string): status is BlockStatus => VALID_BLOCK_STATUSES.some((validStatus: BlockStatus) => validStatus === status)

export const getClasses = async (upn: string): Promise<ApiResponse<unknown>> => {
  const bearer: string = await requireBearer()
  return await apiRequest("GET", `${apiUrl}/getOwnedGroups/${upn}`, bearer)
}

export const getStudents = async (classId: string): Promise<ApiResponse<unknown>> => {
  const bearer: string = await requireBearer()
  return await apiRequest("GET", `${apiUrl}/getGroupMembers/${classId}/${import.meta.env.VITE_RETURN_ONLY_STUDENTS}`, bearer)
}

/**
 * Returns the group members of the search group
 */
export const getGroupMembers = async (): Promise<ApiResponse<unknown>> => {
  const bearer: string = await requireBearer()
  return await apiRequest("GET", `${apiUrl}/getGroupMembers/${import.meta.env.VITE_SEARCH_GROUP}/false`, bearer)
}

export const postBlock = async (block: BlockPayload): Promise<ApiResult> => {
  const bearer: string = await requireBearer()
  return await sendExpectingStatus(201, apiRequest("POST", `${apiUrl}/submitBlock`, bearer, block))
}

export const putBlock = async (block: BlockPayload): Promise<ApiResult> => {
  const bearer: string = await requireBearer()
  return await sendExpectingStatus(200, apiRequest("PUT", `${apiUrl}/updateBlock`, bearer, block))
}

/**
 * @param status Comma separated string of statuses (pending, active, expired)
 * @param upn The upn of the user to get blocks for
 * @param school The school's identifier. Example: Porsgrunn videregående skole
 */
export const getBlocks = async (status: string, upn: string | null, school: string | null): Promise<ApiResponse<unknown> | ApiErrorResult> => {
  if (upn === null && school === null) {
    return {
      error: "Missing valid param, must provide at least one"
    }
  }

  if (!status.split(",").every(isValidBlockStatus)) {
    return {
      error: "Invalid status"
    }
  }

  const bearer: string = await requireBearer()
  return await apiRequest("GET", `${apiUrl}/getBlocks/${status}/${upn}/${school}`, bearer)
}

export const deleteBlock = async (block: PersistedBlockPayload, action: string): Promise<ApiResult> => {
  const bearer: string = await requireBearer()
  return await sendExpectingStatus(200, apiRequest("POST", `${apiUrl}/deleteBlock/${block._id}/${action}`, bearer, block))
}

/**
 * @param requestor The UPN of the user requesting permission
 * @param teacher The UPN of the teacher to be edited
 * @param sessionId The sessionId of the impersonation
 */
export const validatePermission = async (requestor: string, teacher: string, sessionId: string): Promise<ApiResponse<unknown> | ApiErrorResult | Error> => {
  if (!requestor || !teacher) {
    return {
      error: "No requestor or teacher provided"
    }
  }

  if (!sessionId) {
    return {
      error: "No sessionId provided"
    }
  }

  const bearer: string = await requireBearer()
  const permissionRequest = {
    requestorUPN: requestor,
    teacherToBeEditedUPN: teacher,
    sessionId
  }

  return await sendCatchingErrors(apiRequest("POST", `${apiUrl}/validatePermission`, bearer, permissionRequest))
}

/**
 * Fetches extended user information based on the provided UPN (User Principal Name)
 */
export const getExtendedUserInfo = async (upn: string): Promise<ApiResponse<unknown> | ApiErrorResult | Error> => {
  if (!upn) {
    return {
      error: "No upn provided"
    }
  }

  const bearer: string = await requireBearer()
  return await sendCatchingErrors(apiRequest("GET", `${apiUrl}/extendedUserInfo/${upn}`, bearer))
}

/**
 * Retrieves history based on teacher, course, and school parameters. At least one parameter must be provided.
 *
 * @param teacher The teacher's identifier. Example: 'teacher@county.no'
 * @param course The course's identifier. Example: 'POV-MAT101-Klasse'
 * @param school The school's identifier. Example: Porsgrunn videregående skole
 */
export const getHistory = async (teacher: string | null, course: string | null, school: string | null): Promise<ApiResponse<unknown> | ApiErrorResult | Error> => {
  if (!teacher && !course && !school) {
    return {
      error: "No parameters provided"
    }
  }

  const bearer: string = await requireBearer()
  const query: string = `${teacher || "null"}/${course || "null"}/${school || "null"}`

  return await sendCatchingErrors(apiRequest("GET", `${apiUrl}/history/${query}`, bearer))
}
