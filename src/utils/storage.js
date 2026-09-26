export function getStorage() {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

export function readTextStorage(key, fallback = '') {
  try {
    const storage = getStorage()
    if (!storage) return fallback
    const value = storage.getItem(key)
    return value ?? fallback
  } catch (error) {
    console.warn(`[Eu Reciclo] Falha ao ler ${key}:`, error)
    return fallback
  }
}

export function writeTextStorage(key, value) {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(key, String(value))
    return true
  } catch (error) {
    console.warn(`[Eu Reciclo] Falha ao salvar ${key}:`, error)
    return false
  }
}

export function readJsonStorage(key, fallback) {
  const raw = readTextStorage(key, '')
  if (!raw) return structuredFallback(fallback)
  try {
    return JSON.parse(raw)
  } catch (error) {
    try {
      const storage = getStorage()
      if (storage && raw) storage.setItem(`eureciclo_recovery_${key}`, raw)
    } catch {}
    console.warn(`[Eu Reciclo] Dados inválidos em ${key}; uma cópia de recuperação foi preservada e o fallback será usado.`, error)
    return structuredFallback(fallback)
  }
}

export function writeJsonStorage(key, value) {
  try {
    return writeTextStorage(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[Eu Reciclo] Falha ao serializar ${key}:`, error)
    return false
  }
}

export function removeStorageKey(key) {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`[Eu Reciclo] Falha ao remover ${key}:`, error)
    return false
  }
}

function structuredFallback(value) {
  if (Array.isArray(value)) return value.map(item => (item && typeof item === 'object' ? { ...item } : item))
  if (value && typeof value === 'object') return { ...value }
  return value
}
