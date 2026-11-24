import type { AccountInfo } from "@azure/msal-browser"

export type NettsperreUser = {
  upn: string
  name: string
  oid: string
  roles: string[]
}

export type NettsperreTokenClaims = {
  upn?: string
  name?: string
  oid?: string
  roles?: string[]
}

export type LoginAccount = Pick<AccountInfo, "username" | "name">

export type LoginResponse = {
  account: LoginAccount
  loginRequestUrl: string
}
