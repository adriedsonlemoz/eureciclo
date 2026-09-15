import { formatLocaleNumber, normalizeLocaleInput, parseLocaleNumber } from '@/utils/number'

export function useFormatNumber() {
  function formatThousands(raw, options = {}) {
    return normalizeLocaleInput(raw, { allowDecimals: true, maxDecimals: 3, ...options }).display
  }

  function parseThousands(formatted, options = {}) {
    return parseLocaleNumber(formatted, { allowDecimals: true, maxDecimals: 3, ...options })
  }

  return { formatThousands, parseThousands, formatLocaleNumber, normalizeLocaleInput }
}
