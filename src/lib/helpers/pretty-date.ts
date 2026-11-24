import type { PrettyDateOptions } from "../types/date.js"

const LOCALE = "nb-NO"

const LONG_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
}

const SHORT_MONTH_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric"
}

/**
 * Formats a date into a human-readable Norwegian string. Includes time unless `shortMonth` is set without `includeTime`.
 */
export const prettyPrintDate = (date: Date | string | number, options?: PrettyDateOptions): string => {
  const format: Intl.DateTimeFormatOptions = options?.shortMonth && !options.includeTime ? SHORT_MONTH_FORMAT : LONG_DATE_TIME_FORMAT

  return new Date(date).toLocaleDateString(LOCALE, format)
}
