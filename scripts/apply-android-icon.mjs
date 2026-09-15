import { existsSync, mkdirSync, copyFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const resRoot = 'android/app/src/main/res'
const sourceRoot = 'resources/android'
if (!existsSync(resRoot)) {
  console.error('Recursos Android não encontrados. Execute cap add/sync android primeiro.')
  process.exit(1)
}
if (!existsSync(sourceRoot)) {
  console.error('Recursos do ícone não encontrados em resources/android.')
  process.exit(1)
}

const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
for (const density of densities) {
  const target = join(resRoot, `mipmap-${density}`)
  mkdirSync(target, { recursive: true })
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
    for (const ext of ['png', 'webp']) {
      const oldPath = join(target, name.replace('.png', `.${ext}`))
      if (existsSync(oldPath)) rmSync(oldPath)
    }
    copyFileSync(join(sourceRoot, `mipmap-${density}`, name), join(target, name))
  }
}

const drawable = join(resRoot, 'drawable')
mkdirSync(drawable, { recursive: true })
copyFileSync(join(sourceRoot, 'drawable', 'ic_launcher_foreground.png'), join(drawable, 'ic_launcher_foreground.png'))

const adaptive = join(resRoot, 'mipmap-anydpi-v26')
mkdirSync(adaptive, { recursive: true })
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
writeFileSync(join(adaptive, 'ic_launcher.xml'), adaptiveXml)
writeFileSync(join(adaptive, 'ic_launcher_round.xml'), adaptiveXml)

// Capacitor já cria ic_launcher_background.xml. Reutilizamos o mesmo recurso
// em vez de declarar @color/ic_launcher_background em um segundo arquivo,
// o que faria o Android Resource Merger falhar com "Duplicate resources".
const values = join(resRoot, 'values')
mkdirSync(values, { recursive: true })
const legacyCustomColor = join(values, 'eu_reciclo_icon.xml')
if (existsSync(legacyCustomColor)) rmSync(legacyCustomColor)
writeFileSync(
  join(values, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#15803D</color>\n</resources>\n`
)

console.log('Ícone Eu Reciclo aplicado aos recursos Android sem recursos duplicados.')
