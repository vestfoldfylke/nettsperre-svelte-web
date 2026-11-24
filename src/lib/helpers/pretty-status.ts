const statusLabels: Record<string, string> = {
  pending: "Fremtidig",
  active: "Aktiv"
}

export const prettyPrintStatus = (status: string): string | undefined => (Object.hasOwn(statusLabels, status) ? statusLabels[status] : undefined)
