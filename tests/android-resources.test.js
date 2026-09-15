import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const assets = [
  'public/app-icon.png',
  'src/assets/app-icon.png',
  'resources/android/drawable/ic_launcher_foreground.png',
  ...['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'].flatMap(density => [
    `resources/android/mipmap-${density}/ic_launcher.png`,
    `resources/android/mipmap-${density}/ic_launcher_round.png`
  ])
]

test('pacote-fonte contém todos os recursos do launcher Android', () => {
  for (const relative of assets) {
    assert.equal(existsSync(join(root, relative)), true, `recurso ausente: ${relative}`)
  }
})

test('recursos do launcher são PNG reais, não placeholders vazios', () => {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  for (const relative of assets.filter(name => name.endsWith('.png'))) {
    const file = readFileSync(join(root, relative))
    assert.ok(file.length > 100, `arquivo muito pequeno: ${relative}`)
    assert.deepEqual(file.subarray(0, 8), pngSignature, `não é PNG válido: ${relative}`)
  }
})
