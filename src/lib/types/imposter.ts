export type ImposterSession = {
  requestor: string
  teacher: Record<string, unknown>
}

export type ImposterState = ImposterSession | never[]
