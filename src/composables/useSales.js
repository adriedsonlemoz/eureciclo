import { ref } from 'vue'
import { readJsonStorage, writeJsonStorage } from '@/utils/storage'

export const SALES_KEY = 'eureciclo_sales'

function normalizeSales(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const sales = ref(normalizeSales(readJsonStorage(SALES_KEY, [])))

function persistSales(list) {
  return writeJsonStorage(SALES_KEY, list)
}

function createSaleId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useSales() {
  function addSale({ items, total, totalKg }) {
    const newSale = {
      id: createSaleId(),
      date: new Date().toISOString(),
      items: Array.isArray(items) ? items.map(item => ({ ...item })) : [],
      total: Number(total) || 0,
      totalKg: Number(totalKg) || 0
    }
    sales.value.unshift(newSale)
    persistSales(sales.value)
    return newSale
  }

  function deleteSale(id) {
    const idx = sales.value.findIndex(s => String(s.id) === String(id))
    if (idx === -1) return false
    sales.value.splice(idx, 1)
    persistSales(sales.value)
    return true
  }

  function clearAllSales() {
    sales.value = []
    persistSales(sales.value)
  }

  return { sales, addSale, deleteSale, clearAllSales }
}
