/**
 * Formats a given date into a human-readable string based on the provided options.
 *
 * @param {Date|string|number} date - The date to format. Can be a Date object, a date string, or a timestamp.
 * @param {Object} [options] - Optional settings for formatting the date.
 * @param {boolean} [options.includeTime=false] - Whether to include the time in the formatted string.
 * @param {boolean} [options.shortMonth=false] - Whether to use the short month format.
 * @returns {string} The formatted date string.
 */
export const prettyPrintDate = (date, options) => {
	if (options?.includeTime) {
		return new Date(date).toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
	}

	if (options?.shortMonth) {
		return new Date(date).toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" })
	}

	return new Date(date).toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
