export const prettyPrintStatus = (status) => {
	if (status === "pending") return "Fremtidig"
	if (status === "active") return "Aktiv"
}
