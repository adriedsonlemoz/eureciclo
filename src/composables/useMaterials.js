import { ref, computed } from 'vue'
import { readJsonStorage, readTextStorage, writeJsonStorage, writeTextStorage } from '@/utils/storage'
import { createMaterialId, getPricePerUnitValue, calculateMaterialValue } from '@/utils/recycling'
import { removeQuantityForMaterial } from '@/stores/calculatorState'

export const MATERIALS_KEY = 'recicla_materials'
export const USER_KEY = 'recicla_user_name'
export const SETUP_KEY = 'recicla_setup_done'

export const DEFAULT_CATEGORY_PRICES = Object.freeze({
  aluminio: 6.00,
  pet: 2.50,
  cobre: 30.00,
  papel: 3.00,
  baterias: 3.00,
  outros: 3.00
})

export const defaultMaterials = [
  { id: 1, name: 'Alumínio / Latas', category: 'aluminio', pricePerKg: 6.00, unitType: 'units', unitsPerKg: 70, icon: '🥫', accentColor: '#9ca3af', description: '70 latas = 1 kg' },
  { id: 2, name: 'PET', category: 'pet', pricePerKg: 2.50, unitType: 'units', unitsPerKg: 25, icon: '🧴', accentColor: '#60a5fa', description: '25 garrafas = 1 kg' },
  { id: 3, name: 'Cobre', category: 'cobre', pricePerKg: 30.00, unitType: 'weight', unitsPerKg: null, icon: '⚡', accentColor: '#f59e0b', description: 'Fios, tubos e conexões' },
  { id: 4, name: 'Latão', category: 'cobre', pricePerKg: 30.00, unitType: 'weight', unitsPerKg: null, icon: '🔧', accentColor: '#d97706', description: 'Registro, torneiras' },
  { id: 5, name: 'Papel / Papelão', category: 'papel', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '📦', accentColor: '#fcd34d', description: 'Caixas e papéis' },
  { id: 6, name: 'Baterias', category: 'baterias', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🔋', accentColor: '#a78bfa', description: 'Pilhas e baterias usadas' },
  { id: 7, name: 'Vidro', category: 'outros', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🫙', accentColor: '#5eead4', description: 'Garrafas e potes' },
  { id: 8, name: 'Ferro / Aço', category: 'outros', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🔩', accentColor: '#94a3b8', description: 'Sucata ferrosa' },
  { id: 9, name: 'Plástico Misto', category: 'outros', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '♻️', accentColor: '#86efac', description: 'HDPE, PP e outros' }
]

function cloneDefaults() {
  return defaultMaterials.map(m => ({ ...m }))
}

function normalizeMaterials(value) {
  if (!Array.isArray(value)) return cloneDefaults()
  const valid = value.filter(m => m && (typeof m.id === 'string' || typeof m.id === 'number') && typeof m.name === 'string')
  return valid.length ? valid : cloneDefaults()
}

function saveMaterials(mats) {
  return writeJsonStorage(MATERIALS_KEY, mats)
}

const materials = ref(normalizeMaterials(readJsonStorage(MATERIALS_KEY, cloneDefaults())))

export function isSetupDone() {
  return readTextStorage(SETUP_KEY, '') === 'true'
}

export function getUserName() {
  return readTextStorage(USER_KEY, '')
}

export function applySetup({ userName, prices }) {
  writeTextStorage(USER_KEY, userName?.trim() || 'Usuário')

  const catPrice = Object.fromEntries(
    Object.entries(DEFAULT_CATEGORY_PRICES).map(([category, fallback]) => {
      const fieldMap = { aluminio: 'latas', pet: 'pet', cobre: 'cobre', papel: 'papel', baterias: 'baterias', outros: 'outros' }
      const candidate = Number(prices?.[fieldMap[category]])
      return [category, Number.isFinite(candidate) && candidate > 0 ? candidate : fallback]
    })
  )

  materials.value = materials.value.map(m => ({ ...m, pricePerKg: catPrice[m.category] ?? m.pricePerKg }))
  saveMaterials(materials.value)
  writeTextStorage(SETUP_KEY, 'true')
}

export function useMaterials() {
  const byCategory = computed(() => {
    const groups = { aluminio: [], pet: [], cobre: [], papel: [], baterias: [], outros: [] }
    for (const m of materials.value) {
      if (groups[m.category] !== undefined) groups[m.category].push(m)
      else groups.outros.push(m)
    }
    return groups
  })

  function getMaterial(id) {
    return materials.value.find(m => String(m.id) === String(id))
  }

  function addMaterial(data) {
    const mat = {
      id: createMaterialId(),
      name: data.name?.trim(),
      category: data.category,
      pricePerKg: Number(data.pricePerKg),
      unitType: data.unitType,
      unitsPerKg: data.unitType === 'units' ? Number(data.unitsPerKg) : null,
      icon: data.icon || '♻️',
      accentColor: data.accentColor || '#4ade80',
      description: data.description?.trim() || ''
    }
    materials.value.push(mat)
    saveMaterials(materials.value)
    return mat
  }

  function updateMaterial(id, data) {
    const idx = materials.value.findIndex(m => String(m.id) === String(id))
    if (idx === -1) return false
    materials.value[idx] = {
      ...materials.value[idx],
      name: data.name?.trim(),
      category: data.category,
      pricePerKg: Number(data.pricePerKg),
      unitType: data.unitType,
      unitsPerKg: data.unitType === 'units' ? Number(data.unitsPerKg) : null,
      icon: data.icon || materials.value[idx].icon,
      accentColor: data.accentColor || materials.value[idx].accentColor,
      description: data.description?.trim() || ''
    }
    saveMaterials(materials.value)
    return true
  }

  function deleteMaterial(id) {
    const idx = materials.value.findIndex(m => String(m.id) === String(id))
    if (idx === -1) return false
    materials.value.splice(idx, 1)
    removeQuantityForMaterial(id)
    saveMaterials(materials.value)
    return true
  }

  function getPricePerUnit(material) { return getPricePerUnitValue(material) }
  function calcValue(material, quantity) { return calculateMaterialValue(material, quantity) }

  function formatCurrency(value) {
    if (!Number.isFinite(Number(value))) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
  }

  function formatNumber(value, decimals = 3) {
    return Number(value).toFixed(decimals)
  }

  const categories = [
    { key: 'aluminio', label: 'Alumínio', icon: '🥫', shortLabel: 'Alumínio' },
    { key: 'pet', label: 'PET', icon: '🧴', shortLabel: 'PET' },
    { key: 'cobre', label: 'Cobre', icon: '⚡', shortLabel: 'Cobre' },
    { key: 'papel', label: 'Papel', icon: '📦', shortLabel: 'Papel' },
    { key: 'baterias', label: 'Baterias', icon: '🔋', shortLabel: 'Baterias' },
    { key: 'outros', label: 'Outros', icon: '♻️', shortLabel: 'Outros' }
  ]

  const categoryIcons = { aluminio: '🥫', pet: '🧴', cobre: '⚡', papel: '📦', baterias: '🔋', outros: '♻️' }
  const categoryColors = {
    aluminio: { bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', text: '#6b7280' },
    pet: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#3b82f6' },
    cobre: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#b45309' },
    papel: { bg: 'rgba(252,211,77,0.15)', border: 'rgba(252,211,77,0.3)', text: '#a16207' },
    baterias: { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#7c3aed' },
    outros: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', text: '#15803d' }
  }

  return { materials, byCategory, categories, categoryIcons, categoryColors, getMaterial, addMaterial, updateMaterial, deleteMaterial, getPricePerUnit, calcValue, formatCurrency, formatNumber }
}
