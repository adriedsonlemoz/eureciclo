import { ref } from 'vue'
import { readJsonStorage, writeJsonStorage } from '@/utils/storage'

export const PURCHASE_GOALS_KEY = 'eureciclo_purchase_goals'

function normalizeGoals(value) {
  if (!Array.isArray(value)) return []
  return value.filter(goal => goal && goal.id && Array.isArray(goal.items))
}

const goals = ref(normalizeGoals(readJsonStorage(PURCHASE_GOALS_KEY, [])))

function persistGoals() {
  return writeJsonStorage(PURCHASE_GOALS_KEY, goals.value)
}

function createGoalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function usePurchaseGoals() {
  function saveGoal({ name, items, materialId }) {
    const cleanItems = Array.isArray(items)
      ? items
          .map(item => ({ name: String(item?.name || '').trim(), price: Number(item?.price) || 0 }))
          .filter(item => item.name && item.price > 0)
      : []

    if (!cleanItems.length) return null

    const newGoal = {
      id: createGoalId(),
      name: String(name || cleanItems.map(item => item.name).join(' + ')).trim(),
      items: cleanItems,
      materialId: String(materialId || ''),
      createdAt: new Date().toISOString()
    }

    goals.value.unshift(newGoal)
    persistGoals()
    return newGoal
  }

  function deleteGoal(id) {
    const idx = goals.value.findIndex(goal => String(goal.id) === String(id))
    if (idx === -1) return false
    goals.value.splice(idx, 1)
    persistGoals()
    return true
  }

  return { goals, saveGoal, deleteGoal }
}
