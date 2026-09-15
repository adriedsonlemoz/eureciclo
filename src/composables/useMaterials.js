import { ref, computed } from 'vue'
import { readJsonStorage, readTextStorage, writeJsonStorage, writeTextStorage } from '@/utils/storage'
import { createMaterialId, getPricePerUnitValue, calculateMaterialValue } from '@/utils/recycling'
import { formatLocaleCurrency, formatLocaleNumber } from '@/utils/number'
import { removeQuantityForMaterial } from '@/stores/calculatorState'

export const MATERIALS_KEY = 'recicla_materials'
export const MATERIALS_SCHEMA_KEY = 'eureciclo_materials_schema'
export const USER_KEY = 'recicla_user_name'
export const SETUP_KEY = 'recicla_setup_done'
export const MATERIALS_SCHEMA_VERSION = 2

export const defaultMaterials = [
  { id: 1,  name: 'Alumínio / Latas', category: 'metais', pricePerKg: 6.00, unitType: 'units', unitsPerKg: 70, icon: '🥫', accentColor: '#9ca3af', description: '70 latas = 1 kg' },
  { id: 2,  name: 'PET', category: 'plasticos', pricePerKg: 2.50, unitType: 'units', unitsPerKg: 25, icon: '🧴', accentColor: '#60a5fa', description: '25 garrafas = 1 kg' },
  { id: 3,  name: 'Cobre', category: 'metais', pricePerKg: 30.00, unitType: 'weight', unitsPerKg: null, icon: '⚡', accentColor: '#f59e0b', description: 'Fios, tubos e conexões' },
  { id: 4,  name: 'Latão', category: 'metais', pricePerKg: 30.00, unitType: 'weight', unitsPerKg: null, icon: '🔧', accentColor: '#d97706', description: 'Registros, torneiras e peças' },
  { id: 5,  name: 'Papelão', category: 'papel', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '📦', accentColor: '#fcd34d', description: 'Caixas e embalagens de papelão' },
  { id: 6,  name: 'Pilhas / Baterias pequenas', category: 'baterias', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🔋', accentColor: '#a78bfa', description: 'Cadastre o valor praticado no seu ponto de coleta' },
  { id: 7,  name: 'Vidro', category: 'vidro', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🫙', accentColor: '#5eead4', description: 'Garrafas e potes' },
  { id: 8,  name: 'Ferro / Aço', category: 'metais', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '🔩', accentColor: '#94a3b8', description: 'Sucata ferrosa' },
  { id: 9,  name: 'Plástico Misto', category: 'plasticos', pricePerKg: 3.00, unitType: 'weight', unitsPerKg: null, icon: '♻️', accentColor: '#86efac', description: 'Plásticos sem separação específica' },
  { id: 'default-inox', name: 'Inox', category: 'metais', pricePerKg: 0, unitType: 'weight', unitsPerKg: null, icon: '✨', accentColor: '#64748b', description: 'Preço a definir conforme sua região' },
  { id: 'default-pead', name: 'PEAD / HDPE', category: 'plasticos', pricePerKg: 0, unitType: 'weight', unitsPerKg: null, icon: '🧴', accentColor: '#38bdf8', description: 'Frascos e embalagens rígidas' },
  { id: 'default-pp', name: 'PP', category: 'plasticos', pricePerKg: 0, unitType: 'weight', unitsPerKg: null, icon: '♻️', accentColor: '#34d399', description: 'Polipropileno separado' },
  { id: 'default-papel', name: 'Papel', category: 'papel', pricePerKg: 0, unitType: 'weight', unitsPerKg: null, icon: '📄', accentColor: '#fbbf24', description: 'Papéis separados do papelão' },
  { id: 'default-bateria-auto', name: 'Bateria automotiva', category: 'baterias', pricePerKg: 0, unitType: 'weight', unitsPerKg: null, icon: '🔋', accentColor: '#8b5cf6', description: 'Preço a definir conforme comprador e região' }
]

const newV2MaterialIds = new Set(['default-inox', 'default-pead', 'default-pp', 'default-papel', 'default-bateria-auto'])

function cloneDefaults() {
  return defaultMaterials.map(material => ({ ...material }))
}

function legacyCategoryFor(material) {
  const name = String(material?.name || '').toLowerCase()
  const category = String(material?.category || '')
  if (name.includes('vidro')) return 'vidro'
  if (name.includes('pet') || name.includes('plástico') || name.includes('plastico') || name.includes('pead') || name === 'pp') return 'plasticos'
  if (name.includes('papel')) return 'papel'
  if (name.includes('bater') || name.includes('pilha')) return 'baterias'
  if (['aluminio', 'cobre'].includes(category) || name.includes('alum') || name.includes('cobre') || name.includes('latão') || name.includes('latao') || name.includes('ferro') || name.includes('aço') || name.includes('aco') || name.includes('inox')) return 'metais'
  if (['pet'].includes(category)) return 'plasticos'
  if (['papel'].includes(category)) return 'papel'
  if (['baterias'].includes(category)) return 'baterias'
  return ['metais', 'plasticos', 'papel', 'vidro', 'baterias', 'outros'].includes(category) ? category : 'outros'
}

function normalizeOne(material) {
  const normalized = {
    ...material,
    category: legacyCategoryFor(material),
    pricePerKg: Number.isFinite(Number(material?.pricePerKg)) ? Math.max(0, Number(material.pricePerKg)) : 0,
    unitType: material?.unitType === 'units' ? 'units' : 'weight',
    unitsPerKg: material?.unitType === 'units' && Number(material?.unitsPerKg) > 0 ? Number(material.unitsPerKg) : null
  }

  if (String(normalized.name || '').toLowerCase() === 'papel / papelão') {
    normalized.name = 'Papelão'
    normalized.description = normalized.description || 'Caixas e embalagens de papelão'
  }
  if (String(normalized.name || '').toLowerCase() === 'baterias') {
    normalized.name = 'Pilhas / Baterias pequenas'
  }
  return normalized
}

function normalizeMaterials(value) {
  if (!Array.isArray(value)) return cloneDefaults()
  const valid = value
    .filter(material => material && (typeof material.id === 'string' || typeof material.id === 'number') && typeof material.name === 'string')
    .map(normalizeOne)
  return valid.length ? valid : cloneDefaults()
}

function migrateMaterialsIfNeeded(list) {
  const storedSchema = Number(readTextStorage(MATERIALS_SCHEMA_KEY, '0')) || 0
  let next = list.map(normalizeOne)
  if (storedSchema < MATERIALS_SCHEMA_VERSION) {
    const existingNames = new Set(next.map(material => material.name.toLowerCase()))
    for (const defaultMaterial of defaultMaterials) {
      if (!newV2MaterialIds.has(defaultMaterial.id)) continue
      if (!existingNames.has(defaultMaterial.name.toLowerCase())) next.push({ ...defaultMaterial })
    }
    writeJsonStorage(MATERIALS_KEY, next)
    writeTextStorage(MATERIALS_SCHEMA_KEY, String(MATERIALS_SCHEMA_VERSION))
  }
  return next
}

function saveMaterials(mats) {
  return writeJsonStorage(MATERIALS_KEY, mats)
}

const initialMaterials = normalizeMaterials(readJsonStorage(MATERIALS_KEY, cloneDefaults()))
const materials = ref(migrateMaterialsIfNeeded(initialMaterials))

export function isSetupDone() {
  return readTextStorage(SETUP_KEY, '') === 'true'
}

export function getUserName() {
  return readTextStorage(USER_KEY, '')
}

export function applySetup({ userName, pricesByMaterial = {} }) {
  writeTextStorage(USER_KEY, userName?.trim() || 'Usuário')
  materials.value = materials.value.map(material => {
    const candidate = Number(pricesByMaterial[String(material.id)])
    return {
      ...material,
      pricePerKg: Number.isFinite(candidate) && candidate >= 0 ? candidate : material.pricePerKg
    }
  })
  saveMaterials(materials.value)
  writeTextStorage(MATERIALS_SCHEMA_KEY, String(MATERIALS_SCHEMA_VERSION))
  writeTextStorage(SETUP_KEY, 'true')
}

export function useMaterials() {
  const categories = [
    { key: 'metais', label: 'Metais', icon: '🔩', shortLabel: 'Metais' },
    { key: 'plasticos', label: 'Plásticos', icon: '♻️', shortLabel: 'Plásticos' },
    { key: 'papel', label: 'Papel', icon: '📦', shortLabel: 'Papel' },
    { key: 'vidro', label: 'Vidro', icon: '🫙', shortLabel: 'Vidro' },
    { key: 'baterias', label: 'Baterias', icon: '🔋', shortLabel: 'Baterias' },
    { key: 'outros', label: 'Outros', icon: '🌿', shortLabel: 'Outros' }
  ]

  const byCategory = computed(() => {
    const groups = Object.fromEntries(categories.map(category => [category.key, []]))
    for (const material of materials.value) {
      const key = groups[material.category] ? material.category : 'outros'
      groups[key].push(material)
    }
    return groups
  })

  function getMaterial(id) {
    return materials.value.find(material => String(material.id) === String(id))
  }

  function addMaterial(data) {
    const material = {
      id: createMaterialId(),
      name: data.name?.trim(),
      category: data.category,
      pricePerKg: Math.max(0, Number(data.pricePerKg) || 0),
      unitType: data.unitType,
      unitsPerKg: data.unitType === 'units' ? Number(data.unitsPerKg) : null,
      icon: data.icon || '♻️',
      accentColor: data.accentColor || '#4ade80',
      description: data.description?.trim() || ''
    }
    materials.value.push(material)
    saveMaterials(materials.value)
    return material
  }

  function updateMaterial(id, data) {
    const index = materials.value.findIndex(material => String(material.id) === String(id))
    if (index === -1) return false
    materials.value[index] = {
      ...materials.value[index],
      name: data.name?.trim(),
      category: data.category,
      pricePerKg: Math.max(0, Number(data.pricePerKg) || 0),
      unitType: data.unitType,
      unitsPerKg: data.unitType === 'units' ? Number(data.unitsPerKg) : null,
      icon: data.icon || materials.value[index].icon,
      accentColor: data.accentColor || materials.value[index].accentColor,
      description: data.description?.trim() || ''
    }
    saveMaterials(materials.value)
    return true
  }

  function deleteMaterial(id) {
    const index = materials.value.findIndex(material => String(material.id) === String(id))
    if (index === -1) return false
    materials.value.splice(index, 1)
    removeQuantityForMaterial(id)
    saveMaterials(materials.value)
    return true
  }

  function getPricePerUnit(material) { return getPricePerUnitValue(material) }
  function calcValue(material, quantity) { return calculateMaterialValue(material, quantity) }
  function formatCurrency(value) { return formatLocaleCurrency(value) }
  function formatNumber(value, decimals = 3) {
    return formatLocaleNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
  }

  const categoryIcons = Object.fromEntries(categories.map(category => [category.key, category.icon]))
  const categoryColors = {
    metais: { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.28)', text: '#475569' },
    plasticos: { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', text: '#2563eb' },
    papel: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', text: '#b45309' },
    vidro: { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)', text: '#0f766e' },
    baterias: { bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', text: '#7c3aed' },
    outros: { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', text: '#15803d' }
  }

  return {
    materials, byCategory, categories, categoryIcons, categoryColors,
    getMaterial, addMaterial, updateMaterial, deleteMaterial,
    getPricePerUnit, calcValue, formatCurrency, formatNumber
  }
}
