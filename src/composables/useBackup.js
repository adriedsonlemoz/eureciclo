import { APP_NAME, APP_VERSION } from '@/config/app'
import { BACKUP_SCHEMA_VERSION, validateBackupPayload } from '@/utils/backup'
import { getStorage, readJsonStorage, readTextStorage, writeJsonStorage, writeTextStorage } from '@/utils/storage'
import { MATERIALS_KEY, USER_KEY, SETUP_KEY, defaultMaterials } from '@/composables/useMaterials'
import { CALC_KEY } from '@/stores/calculatorState'
import { SALES_KEY } from '@/composables/useSales'
import { PURCHASE_GOALS_KEY } from '@/composables/usePurchaseGoals'

export function buildBackupPayload() {
  return {
    app: APP_NAME,
    appVersion: APP_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      materials: readJsonStorage(MATERIALS_KEY, defaultMaterials),
      quantities: readJsonStorage(CALC_KEY, {}),
      sales: readJsonStorage(SALES_KEY, []),
      purchaseGoals: readJsonStorage(PURCHASE_GOALS_KEY, []),
      userName: readTextStorage(USER_KEY, ''),
      setupDone: readTextStorage(SETUP_KEY, '') === 'true'
    }
  }
}

export function exportBackup() {
  const payload = buildBackupPayload()
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const day = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `eu-reciclo-backup-${day}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function importBackupFile(file) {
  if (!file) throw new Error('Selecione um arquivo de backup.')
  let payload
  try {
    payload = JSON.parse(await file.text())
  } catch {
    throw new Error('Não foi possível ler o JSON do backup.')
  }

  const validation = validateBackupPayload(payload)
  if (!validation.ok) throw new Error(validation.error)

  const storage = getStorage()
  if (!storage) throw new Error('Armazenamento local indisponível.')

  writeJsonStorage(MATERIALS_KEY, payload.data.materials)
  writeJsonStorage(CALC_KEY, payload.data.quantities)
  writeJsonStorage(SALES_KEY, payload.data.sales)
  writeJsonStorage(PURCHASE_GOALS_KEY, Array.isArray(payload.data.purchaseGoals) ? payload.data.purchaseGoals : [])
  writeTextStorage(USER_KEY, payload.data.userName || 'Usuário')
  writeTextStorage(SETUP_KEY, payload.data.setupDone ? 'true' : 'false')
  return payload
}
