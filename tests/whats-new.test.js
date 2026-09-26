import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const router = readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8')
const setup = readFileSync(new URL('../src/views/SetupView.vue', import.meta.url), 'utf8')
const whatsNew = readFileSync(new URL('../src/views/WhatsNewView.vue', import.meta.url), 'utf8')
const state = readFileSync(new URL('../src/composables/useWhatsNew.js', import.meta.url), 'utf8')


test('setup e novidades não reservam o espaço da navegação inferior', () => {
  assert.match(app, /showBottomNav/)
  assert.match(app, /\['setup', 'whats-new'\]/)
  assert.match(app, /'app-content': showBottomNav/)
  assert.match(setup, /min-h-dvh/)
})

test('novidades aparece uma vez por versão e pode seguir para o app', () => {
  assert.match(state, /eureciclo_whats_new_seen_version/)
  assert.match(state, /APP_VERSION/)
  assert.match(router, /shouldShowWhatsNew\(\)/)
  assert.match(router, /name: 'whats-new'/)
  assert.match(setup, /router\.replace\(\{ name: 'whats-new' \}\)/)
  assert.match(whatsNew, /markWhatsNewSeen\(\)/)
  assert.match(whatsNew, /Novidades e correções/)
})
