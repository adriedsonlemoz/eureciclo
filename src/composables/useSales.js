import { ref } from 'vue'
import { readJsonStorage, writeJsonStorage } from '@/utils/storage'
import { normalizeSaleRecord, createSaleRecord } from '@/utils/sales'

export const SALES_KEY = 'eureciclo_sales'

function normalizeSales(value) {
  return Array.isArray(value) ? value.map(normalizeSaleRecord).filter(Boolean) : []
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
  function addSale(data) {
    const newSale = createSaleRecord({
      ...data,
      id: createSaleId(),
      date: new Date().toISOString()
    })
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
