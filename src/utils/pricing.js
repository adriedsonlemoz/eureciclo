export function isSuspiciousSetupPrice(price, referencePrice) {
  const entered = Number(price)
  const reference = Number(referencePrice)
  if (!Number.isFinite(entered) || entered <= 0 || !Number.isFinite(reference) || reference <= 0) return false
  return entered >= Math.max(100, reference * 10)
}
