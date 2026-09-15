export function normalizeSaleRecord(sale) {
  if (!sale || typeof sale !== 'object') return null
  const legacyTotal = Number(sale.total || 0)
  const estimatedTotal = Number.isFinite(Number(sale.estimatedTotal)) ? Number(sale.estimatedTotal) : legacyTotal
  const receivedTotal = Number.isFinite(Number(sale.receivedTotal)) ? Number(sale.receivedTotal) : legacyTotal
  return {
    ...sale,
    estimatedTotal: Math.max(0, estimatedTotal),
    receivedTotal: Math.max(0, receivedTotal),
    total: Math.max(0, receivedTotal),
    buyer: typeof sale.buyer === 'string' ? sale.buyer : '',
    items: Array.isArray(sale.items) ? sale.items : [],
    totalKg: Number(sale.totalKg || 0)
  }
}

export function createSaleRecord({ id, date, items, total, estimatedTotal, receivedTotal, buyer = '', totalKg }) {
  const estimate = Number.isFinite(Number(estimatedTotal)) ? Number(estimatedTotal) : Number(total || 0)
  const received = Number.isFinite(Number(receivedTotal)) ? Number(receivedTotal) : Number(total || estimate || 0)
  return normalizeSaleRecord({
    id,
    date,
    items: Array.isArray(items) ? items.map(item => ({ ...item })) : [],
    estimatedTotal: estimate,
    receivedTotal: received,
    total: received,
    buyer: String(buyer || '').trim(),
    totalKg: Number(totalKg) || 0
  })
}
