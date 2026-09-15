function groupIntegerDigits(digits) {
  const clean = String(digits || '').replace(/^0+(?=\d)/, '') || '0'
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function analyzeNumberInput(raw, { allowDecimals = true, maxDecimals = 3 } = {}) {
  let text = String(raw ?? '').trim().replace(/\s+/g, '')
  text = text.replace(/[^\d.,]/g, '')
  if (!text) return { value: 0, display: '', hasDecimal: false, decimals: '' }

  if (!allowDecimals) {
    const digits = text.replace(/\D/g, '')
    return {
      value: Number(digits || 0),
      display: digits ? groupIntegerDigits(digits) : '',
      hasDecimal: false,
      decimals: ''
    }
  }

  const dots = [...text.matchAll(/\./g)].map(match => match.index)
  const commas = [...text.matchAll(/,/g)].map(match => match.index)
  let decimalSeparator = null
  let decimalIndex = -1

  if (dots.length && commas.length) {
    const lastDot = dots[dots.length - 1]
    const lastComma = commas[commas.length - 1]
    decimalIndex = Math.max(lastDot, lastComma)
    decimalSeparator = text[decimalIndex]
  } else if (commas.length) {
    if (commas.length === 1) {
      decimalSeparator = ','
      decimalIndex = commas[0]
    } else {
      const parts = text.split(',')
      const looksGrouped = parts.slice(1).every(part => part.length === 3)
      if (!looksGrouped) {
        decimalSeparator = ','
        decimalIndex = commas[commas.length - 1]
      }
    }
  } else if (dots.length) {
    if (dots.length === 1) {
      const idx = dots[0]
      const trailing = text.length - idx - 1
      const looksPtBrThousands = trailing === 3 && /^\d{1,3}\.\d{3}$/.test(text)
      if (!looksPtBrThousands && trailing <= maxDecimals) {
        decimalSeparator = '.'
        decimalIndex = idx
      }
    } else {
      const parts = text.split('.')
      const looksGrouped = parts.slice(1).every(part => part.length === 3)
      if (!looksGrouped) {
        decimalSeparator = '.'
        decimalIndex = dots[dots.length - 1]
      }
    }
  }

  let integerDigits = ''
  let decimalDigits = ''
  let hasDecimal = false

  if (decimalSeparator) {
    hasDecimal = true
    integerDigits = text.slice(0, decimalIndex).replace(/\D/g, '') || '0'
    decimalDigits = text.slice(decimalIndex + 1).replace(/\D/g, '').slice(0, maxDecimals)
  } else {
    integerDigits = text.replace(/\D/g, '') || '0'
  }

  const normalized = `${integerDigits || '0'}${hasDecimal && decimalDigits ? `.${decimalDigits}` : ''}`
  const value = Number(normalized)
  const display = `${groupIntegerDigits(integerDigits)}${hasDecimal ? `,${decimalDigits}` : ''}`

  return {
    value: Number.isFinite(value) ? value : 0,
    display,
    hasDecimal,
    decimals: decimalDigits
  }
}

export function normalizeLocaleInput(raw, options = {}) {
  return analyzeNumberInput(raw, options)
}

export function parseLocaleNumber(raw, options = {}) {
  return analyzeNumberInput(raw, options).value
}

export function formatLocaleNumber(value, {
  minimumFractionDigits = 0,
  maximumFractionDigits = 3
} = {}) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return number.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits })
}

export function formatLocaleCurrency(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatPriceInput(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return formatLocaleNumber(number, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
