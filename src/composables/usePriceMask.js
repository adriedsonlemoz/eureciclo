import { formatPriceInput, normalizeLocaleInput, parseLocaleNumber } from '@/utils/number'

export function centsToDisplay(cents) {
  return formatPriceInput((Number(cents) || 0) / 100)
}

export function displayToNumber(display) {
  return parseLocaleNumber(display, { allowDecimals: true, maxDecimals: 2 })
}

export function handlePriceInput(event, displayRef, valueRef) {
  const normalized = normalizeLocaleInput(event?.target?.value || '', { allowDecimals: true, maxDecimals: 2 })
  displayRef.value = normalized.display
  valueRef.value = normalized.value
  if (event?.target) event.target.value = normalized.display
}

export function numberToDisplay(value) {
  if (value === '' || value === null || value === undefined) return ''
  return formatPriceInput(value)
}
