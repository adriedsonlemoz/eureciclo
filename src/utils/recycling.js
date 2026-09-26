export function createMaterialId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `mat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getPricePerUnitValue(material) {
  if (!material || material.unitType !== 'units' || !Number(material.unitsPerKg)) return null
  return Number(material.pricePerKg) / Number(material.unitsPerKg)
}

export function calculateMaterialValue(material, quantity) {
  const qty = Number(quantity)
  if (!material || !Number.isFinite(qty) || qty <= 0) return 0
  const price = Number(material.pricePerKg)
  if (!Number.isFinite(price) || price < 0) return 0

  if (material.unitType === 'units') {
    const unitsPerKg = Number(material.unitsPerKg)
    if (!Number.isFinite(unitsPerKg) || unitsPerKg <= 0) return 0
    return (qty / unitsPerKg) * price
  }
  return qty * price
}

/**
 * Calcula a quantidade mínima de um material necessária para atingir um valor-alvo.
 * Materiais por unidade são arredondados para cima para nunca faltar dinheiro.
 * Materiais por peso são arredondados para cima em gramas (0,001 kg).
 */
export function calculateRequiredQuantity(material, targetValue) {
  const target = Number(targetValue)
  const pricePerKg = Number(material?.pricePerKg)

  if (!material || !Number.isFinite(target) || target <= 0) return 0
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) return 0

  if (material.unitType === 'units') {
    const unitsPerKg = Number(material.unitsPerKg)
    if (!Number.isFinite(unitsPerKg) || unitsPerKg <= 0) return 0
    const pricePerUnit = pricePerKg / unitsPerKg
    return Math.ceil(target / pricePerUnit)
  }

  const kilograms = target / pricePerKg
  return Math.ceil(kilograms * 1000) / 1000
}

export function quantityToKg(material, quantity) {
  const qty = Number(quantity)
  if (!material || !Number.isFinite(qty) || qty <= 0) return 0
  if (material.unitType === 'units') {
    const unitsPerKg = Number(material.unitsPerKg)
    if (!Number.isFinite(unitsPerKg) || unitsPerKg <= 0) return 0
    return qty / unitsPerKg
  }
  return qty
}
