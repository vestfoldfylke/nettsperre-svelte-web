const STRING_STYLE = "color:green"
const NUMBER_STYLE = "color:darkorange"
const BOOLEAN_STYLE = "color:blue"
const NULL_STYLE = "color:magenta"
const KEY_STYLE = "color:red"
const JSON_FRAGMENT_PATTERN = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g

const escapeHtml = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const getFragmentStyle = (fragment: string): string => {
  if (/^"/.test(fragment)) {
    return /:$/.test(fragment) ? KEY_STYLE : STRING_STYLE
  }

  if (/true|false/.test(fragment)) {
    return BOOLEAN_STYLE
  }

  if (/null/.test(fragment)) {
    return NULL_STYLE
  }

  return NUMBER_STYLE
}

/**
 * Syntax-highlights a JSON object or string by wrapping each fragment in a `<span>` styled by its type.
 * The input is HTML-escaped first, so the result is safe to render with `{@html}`.
 */
export const syntaxHighlight = (json: unknown): string => {
  const jsonText: string = typeof json === "string" ? json : JSON.stringify(json, undefined, 2)

  return escapeHtml(jsonText).replace(JSON_FRAGMENT_PATTERN, (match: string): string => `<span style="${getFragmentStyle(match)}">${match}</span>`)
}
