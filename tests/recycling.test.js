import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateMaterialValue, getPricePerUnitValue, createMaterialId } from '../src/utils/recycling.js'
import { validateBackupPayload } from '../src/utils/backup.js'

test('70 latas a R$ 6/kg valem R$ 6', () => {
  const material = { unitType: 'units', unitsPerKg: 70, pricePerKg: 6 }
  assert.equal(calculateMaterialValue(material, 70), 6)
})

test('25 PET a R$ 2,50/kg valem R$ 2,50', () => {
  const material = { unitType: 'units', unitsPerKg: 25, pricePerKg: 2.5 }
  assert.equal(calculateMaterialValue(material, 25), 2.5)
})

test('preço por unidade é calculado corretamente', () => {
  assert.equal(getPricePerUnitValue({ unitType: 'units', unitsPerKg: 70, pricePerKg: 7 }), 0.1)
})

test('quantidade ou conversão inválida não gera valor incorreto', () => {
  assert.equal(calculateMaterialValue({ unitType: 'units', unitsPerKg: 0, pricePerKg: 10 }, 10), 0)
  assert.equal(calculateMaterialValue({ unitType: 'weight', pricePerKg: 10 }, -2), 0)
})

test('novos IDs têm formato não incremental', () => {
  const a = createMaterialId()
  const b = createMaterialId()
  assert.notEqual(a, b)
  assert.equal(typeof a, 'string')
})

test('backup válido é aceito e backup de outro app é rejeitado', () => {
  const base = { app: 'Eu Reciclo', schemaVersion: 1, data: { materials: [], sales: [], quantities: {} } }
  assert.equal(validateBackupPayload(base).ok, true)
  assert.equal(validateBackupPayload({ ...base, app: 'Outro App' }).ok, false)
})

test('meta de R$ 33 com latas a R$ 6/kg e 70 latas/kg exige 385 latinhas', async () => {
  const { calculateRequiredQuantity, quantityToKg } = await import('../src/utils/recycling.js')
  const material = { unitType: 'units', unitsPerKg: 70, pricePerKg: 6 }
  assert.equal(calculateRequiredQuantity(material, 33), 385)
  assert.equal(quantityToKg(material, 385), 5.5)
})

test('meta por peso arredonda para cima em gramas para não ficar abaixo do valor', async () => {
  const { calculateRequiredQuantity, calculateMaterialValue } = await import('../src/utils/recycling.js')
  const material = { unitType: 'weight', pricePerKg: 3 }
  const qty = calculateRequiredQuantity(material, 10)
  assert.equal(qty, 3.334)
  assert.ok(calculateMaterialValue(material, qty) >= 10)
})

test('meta inválida ou material sem preço retorna zero', async () => {
  const { calculateRequiredQuantity } = await import('../src/utils/recycling.js')
  assert.equal(calculateRequiredQuantity({ unitType: 'weight', pricePerKg: 0 }, 10), 0)
  assert.equal(calculateRequiredQuantity({ unitType: 'units', unitsPerKg: 70, pricePerKg: 6 }, 0), 0)
})

test('entrada numérica aceita vírgula e ponto decimal e normaliza para pt-BR', async () => {
  const { normalizeLocaleInput, parseLocaleNumber } = await import('../src/utils/number.js')
  assert.equal(normalizeLocaleInput('3.25', { maxDecimals: 3 }).display, '3,25')
  assert.equal(normalizeLocaleInput('3,25', { maxDecimals: 3 }).display, '3,25')
  assert.equal(parseLocaleNumber('1.234,56', { maxDecimals: 2 }), 1234.56)
  assert.equal(parseLocaleNumber('1,234.56', { maxDecimals: 2 }), 1234.56)
})

test('quantidade por unidade não aceita decimal e recebe separador de milhar', async () => {
  const { normalizeLocaleInput } = await import('../src/utils/number.js')
  const result = normalizeLocaleInput('1250', { allowDecimals: false, maxDecimals: 0 })
  assert.equal(result.value, 1250)
  assert.equal(result.display, '1.250')
})

test('campos decimais aceitam 2,5 e 2.5 com o mesmo resultado', async () => {
  const { normalizeLocaleInput } = await import('../src/utils/number.js')
  const comma = normalizeLocaleInput('2,5', { allowDecimals: true, maxDecimals: 3 })
  const dot = normalizeLocaleInput('2.5', { allowDecimals: true, maxDecimals: 3 })
  assert.equal(comma.value, 2.5)
  assert.equal(dot.value, 2.5)
  assert.equal(comma.display, '2,5')
  assert.equal(dot.display, '2,5')
})

test('preços digitados com ponto são exibidos no padrão brasileiro', async () => {
  const { normalizeLocaleInput, formatPriceInput } = await import('../src/utils/number.js')
  const normalized = normalizeLocaleInput('1250.50', { allowDecimals: true, maxDecimals: 2 })
  assert.equal(normalized.value, 1250.5)
  assert.equal(normalized.display, '1.250,50')
  assert.equal(formatPriceInput(normalized.value), '1.250,50')
})



test('venda separa estimativa, valor recebido e comprador sem quebrar campo legado total', async () => {
  const { createSaleRecord, normalizeSaleRecord } = await import('../src/utils/sales.js')
  const sale = createSaleRecord({ id:'1', date:'2026-09-15T00:00:00Z', items:[], estimatedTotal:100, receivedTotal:92.5, buyer:' Ferro Velho Teste ', totalKg:10 })
  assert.equal(sale.estimatedTotal, 100)
  assert.equal(sale.receivedTotal, 92.5)
  assert.equal(sale.total, 92.5)
  assert.equal(sale.buyer, 'Ferro Velho Teste')
  const legacy = normalizeSaleRecord({ id:'old', total:55, items:[] })
  assert.equal(legacy.estimatedTotal, 55)
  assert.equal(legacy.receivedTotal, 55)
})


test('onboarding alerta preço muito acima da referência sem bloquear preço normal', async () => {
  const { isSuspiciousSetupPrice } = await import('../src/utils/pricing.js')
  assert.equal(isSuspiciousSetupPrice(7, 6), false)
  assert.equal(isSuspiciousSetupPrice(700, 6), true)
  assert.equal(isSuspiciousSetupPrice(300, 30), true)
  assert.equal(isSuspiciousSetupPrice(0, 6), false)
})
