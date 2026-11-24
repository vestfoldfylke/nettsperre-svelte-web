import { type AccountInfo, type Configuration, createStandardPublicClientApplication, type IPublicClientApplication } from "@azure/msal-browser"
import type { LoginResponse } from "../types/auth.js"

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID ?? "klientID",
    authority: import.meta.env.VITE_CLIENT_ISS ?? "autiruireuir",
    redirectUri: import.meta.env.VITE_REDIRECT_URI ?? "uriSomewhere"
  },
  cache: {
    cacheLocation: "sessionStorage"
  }
}

// Holdes i minne slik at getMsalClient gjenbruker klienten om den finnes
let msalClient: IPublicClientApplication | null = null

export const getMsalClient = async (): Promise<IPublicClientApplication> => {
  if (!msalClient) {
    msalClient = await createStandardPublicClientApplication(msalConfig)
  }

  if (msalClient.getActiveAccount()) {
    return msalClient
  }

  const accounts: AccountInfo[] = msalClient.getAllAccounts()
  const [firstAccount] = accounts
  if (firstAccount === undefined) {
    return msalClient
  }

  if (accounts.length > 1) {
    console.log("WOAHWOAHWOAH, flere enn en active bruker i MSAL HER! Åpne en ny fane a...")
  }

  msalClient.setActiveAccount(firstAccount)

  return msalClient
}

/**
 * @param forceLogin Forces a new login redirect even if the user is already logged in
 * @param loginRequestUrl Hvilken path logget brukeren inn fra
 * @returns The logged in account, or undefined when a login redirect has been started
 */
export const login = async (forceLogin: boolean = false, loginRequestUrl: string = "/"): Promise<LoginResponse | undefined> => {
  if (import.meta.env.VITE_MOCK_MSAL === "true") {
    return {
      account: {
        username: "demospøkelse@domene.no",
        name: "Demo Spøkelse"
      },
      loginRequestUrl
    }
  }

  const client: IPublicClientApplication = await getMsalClient()

  // Vi redirecter selv etter successful login - MSAL klarer det særdeles dårlig...
  const loginResponse = await client.handleRedirectPromise({ navigateToLoginRequestUrl: false })
  if (loginResponse && !forceLogin) {
    client.setActiveAccount(loginResponse.account)

    return {
      account: loginResponse.account,
      loginRequestUrl: loginResponse.state ?? loginRequestUrl
    }
  }

  const activeAccount: AccountInfo | null = client.getActiveAccount()
  if (activeAccount && !forceLogin) {
    return {
      account: activeAccount,
      loginRequestUrl
    }
  }

  // Url der det logges på sendes med i state, slik at den kommer med i loginResponse når det redirectes
  await client.loginRedirect({ scopes: ["User.Read"], state: loginRequestUrl })

  return undefined
}
