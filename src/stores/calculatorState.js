import { ref } from 'vue'
import { readJsonStorage, writeJsonStorage } from '@/utils/storage'

export const CALC_KEY = 'recicla_quantities'

function normalizeQuantities(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [id, raw] of Object.entries(value)) {
    const qty = Number(raw)
    if (Number.isFinite(qty) && qty > 0) out[id] = +qty.toFixed(3)
  }
  return out
}

export const quantities = ref(normalizeQuantities(readJsonStorage(CALC_KEY, {})))

export function persistQuantities() {
  return writeJsonStorage(CALC_KEY, quantities.value)
}

export function removeQuantityForMaterial(id) {
  const key = String(id)
  if (Object.prototype.hasOwnProperty.call(quantities.value, key)) {
    const next = { ...quantities.value }
    delete next[key]
    quantities.value = next
    persistQuantities()
  }
}
