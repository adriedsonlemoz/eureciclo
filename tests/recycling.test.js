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
