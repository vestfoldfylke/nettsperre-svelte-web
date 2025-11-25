/**
 * Syntax-highlights a JSON object or string by wrapping different types of tokens
 * in HTML `<span>` elements with classes representing their type (e.g., string, number, boolean).
 *
 * @param {Object|string} json - The JSON object or string to be highlighted.
 * @returns {string} An HTML string with syntax highlighting applied.
 */
export const syntaxHighlight = (json) => {
	if (typeof json !== "string") {
		json = JSON.stringify(json, undefined, 2)
	}

	const _string = "color:green"
	const _number = "color:darkorange"
	const _boolean = "color:blue"
	const _null = "color:magenta"
	const _key = "color:red"

	json = json.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">")
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
		let cls = _number
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = _key
			} else {
				cls = _string
			}
		} else if (/true|false/.test(match)) {
			cls = _boolean
		} else if (/null/.test(match)) {
			cls = _null
		}
		return `<span style="${cls}">${match}</span>`
	})
}
