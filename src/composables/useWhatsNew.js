import { APP_VERSION } from '@/config/app'
import { readTextStorage, writeTextStorage } from '@/utils/storage'

export const WHATS_NEW_SEEN_KEY = 'eureciclo_whats_new_seen_version'

export function shouldShowWhatsNew() {
  return readTextStorage(WHATS_NEW_SEEN_KEY, '') !== APP_VERSION
}

export function markWhatsNewSeen() {
  return writeTextStorage(WHATS_NEW_SEEN_KEY, APP_VERSION)
}
