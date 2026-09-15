export const BACKUP_SCHEMA_VERSION = 1

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'Arquivo de backup inválido.' }
  if (payload.app !== 'Eu Reciclo') return { ok: false, error: 'Este backup não pertence ao Eu Reciclo.' }
  if (payload.schemaVersion !== BACKUP_SCHEMA_VERSION) return { ok: false, error: 'Versão de backup não suportada.' }
  if (!payload.data || typeof payload.data !== 'object') return { ok: false, error: 'Backup sem dados.' }
  if (!Array.isArray(payload.data.materials)) return { ok: false, error: 'Lista de materiais inválida.' }
  if (!Array.isArray(payload.data.sales)) return { ok: false, error: 'Histórico de vendas inválido.' }
  if (!payload.data.quantities || typeof payload.data.quantities !== 'object' || Array.isArray(payload.data.quantities)) return { ok: false, error: 'Quantidades inválidas.' }
  return { ok: true }
}
