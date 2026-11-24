import { type Writable, writable } from "svelte/store"
import type { ImposterState } from "./types/imposter.js"

export const superUserImposter: Writable<ImposterState> = writable<ImposterState>([])
export const teachersStore: Writable<unknown[]> = writable<unknown[]>([])
export const superUserImposterSessionID: Writable<string> = writable<string>("")
