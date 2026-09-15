/**
 * useCalculator — estado global das quantidades da calculadora.
 * Persistido no localStorage para que HomeView leia a estimativa atual.
 */
import { computed } from 'vue'
import { useMaterials } from './useMaterials'
import { quantities, persistQuantities } from '@/stores/calculatorState'

export function useCalculator() {
  const { materials, calcValue } = useMaterials()

  function setQty(id, value) {
    const num = Number(value)
    const safe = Number.isFinite(num) ? Math.max(0, +num.toFixed(3)) : 0
    quantities.value[String(id)] = safe
    persistQuantities()
  }

  function increment(id, step) {
    const cur = quantities.value[String(id)] || 0
    setQty(id, cur + Number(step || 0))
  }

  function decrement(id, step) {
    const cur = quantities.value[String(id)] || 0
    setQty(id, cur - Number(step || 0))
  }

  function clearAll() {
    quantities.value = {}
    persistQuantities()
  }

  const totalEstimate = computed(() => {
    let total = 0
    for (const mat of materials.value) {
      const qty = quantities.value[String(mat.id)] || 0
      if (qty > 0) total += calcValue(mat, qty)
    }
    return total
  })

  const totalKg = computed(() => {
    let kg = 0
    for (const mat of materials.value) {
      const qty = quantities.value[String(mat.id)] || 0
      if (qty <= 0) continue
      if (mat.unitType === 'units') kg += qty / (mat.unitsPerKg || 1)
      else kg += qty
    }
    return kg
  })

  const totalItems = computed(() =>
    materials.value.filter(m => (quantities.value[String(m.id)] || 0) > 0).length
  )

  const filledMaterials = computed(() =>
    materials.value
      .filter(m => (quantities.value[String(m.id)] || 0) > 0)
      .map(m => {
        const qty = quantities.value[String(m.id)]
        const kgQty = m.unitType === 'units' ? qty / (m.unitsPerKg || 1) : qty
        return { ...m, qty, kgQty, value: calcValue(m, qty) }
      })
  )

  return {
    quantities,
    totalEstimate,
    totalKg,
    totalItems,
    filledMaterials,
    setQty,
    increment,
    decrement,
    clearAll
  }
}
