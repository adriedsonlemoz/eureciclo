import { existsSync, mkdirSync, copyFileSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const resRoot = 'android/app/src/main/res'
const sourceRoot = 'resources/android'
const manifestPath = 'android/app/src/main/AndroidManifest.xml'
const stylesPath = join(resRoot, 'values', 'styles.xml')

if (!existsSync(resRoot)) {
  console.error('Recursos Android não encontrados. Execute cap add/sync android primeiro.')
  process.exit(1)
}
if (!existsSync(sourceRoot)) {
  console.error('Recursos do ícone não encontrados em resources/android.')
  process.exit(1)
}

// O template do Capacitor traz seu próprio launcher. Removemos qualquer variante
// anterior antes de copiar a identidade do Eu Reciclo para impedir que o APK
// mantenha o robô padrão por resolução, formato redondo ou adaptive icon.
for (const directory of readdirSync(resRoot, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue
  if (!/^(mipmap|drawable)/.test(directory.name)) continue
  const target = join(resRoot, directory.name)
  for (const name of [
    'ic_launcher.png', 'ic_launcher.webp',
    'ic_launcher_round.png', 'ic_launcher_round.webp',
    'ic_launcher_foreground.png', 'ic_launcher_foreground.webp',
    'ic_launcher_monochrome.png', 'ic_launcher_monochrome.webp',
    'ic_launcher.xml', 'ic_launcher_round.xml'
  ]) {
    const oldPath = join(target, name)
    if (existsSync(oldPath)) rmSync(oldPath)
  }
}

// PNGs legacy cobrem Androids anteriores ao adaptive icon e launchers/OEMs que ainda os solicitam.
const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
for (const density of densities) {
  const target = join(resRoot, `mipmap-${density}`)
  mkdirSync(target, { recursive: true })
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
    copyFileSync(join(sourceRoot, `mipmap-${density}`, name), join(target, name))
  }
}

// 432 px em xxxhdpi = 108 dp, dimensão nativa de uma camada adaptive icon.
// Mantê-lo em drawable-xxxhdpi evita que o PNG seja interpretado como 432 dp.
const foregroundDir = join(resRoot, 'drawable-xxxhdpi')
mkdirSync(foregroundDir, { recursive: true })
copyFileSync(join(sourceRoot, 'drawable', 'ic_launcher_foreground.png'), join(foregroundDir, 'ic_launcher_foreground.png'))

const drawable = join(resRoot, 'drawable')
mkdirSync(drawable, { recursive: true })
copyFileSync(join(sourceRoot, 'drawable', 'splash_logo.png'), join(drawable, 'splash_logo.png'))
writeFileSync(join(drawable, 'splash_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#F8FBF9" />
        </shape>
    </item>
    <item android:gravity="center">
        <bitmap android:src="@drawable/splash_logo" android:gravity="center" />
    </item>
</layer-list>
`)

// Android 8.0/API 26+ usa adaptive icon; o sistema aplica a máscara do launcher.
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

const values = join(resRoot, 'values')
mkdirSync(values, { recursive: true })
const legacyCustomColor = join(values, 'eu_reciclo_icon.xml')
if (existsSync(legacyCustomColor)) rmSync(legacyCustomColor)
writeFileSync(
  join(values, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#15803D</color>\n</resources>\n`
)

function setAndroidAttribute(tag, attribute, value) {
  const pattern = new RegExp(`\\s${attribute}="[^"]*"`)
  if (pattern.test(tag)) return tag.replace(pattern, ` ${attribute}="${value}"`)
  return tag.replace(/>$/, ` ${attribute}="${value}">`)
}

if (existsSync(manifestPath)) {
  let manifest = readFileSync(manifestPath, 'utf8')
  manifest = manifest.replace(/<application\b[^>]*>/, tag => {
    let next = setAndroidAttribute(tag, 'android:icon', '@mipmap/ic_launcher')
    next = setAndroidAttribute(next, 'android:roundIcon', '@mipmap/ic_launcher_round')
    return next
  })
  manifest = manifest.replace(/<activity\b[^>]*android:name="\.MainActivity"[^>]*>/, tag =>
    setAndroidAttribute(tag, 'android:theme', '@style/AppTheme.NoActionBarLaunch')
  )
  writeFileSync(manifestPath, manifest)
}

if (existsSync(stylesPath)) {
  let styles = readFileSync(stylesPath, 'utf8')
  const launchStyle = `    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n        <item name="android:windowBackground">@drawable/splash_background</item>\n        <item name="windowSplashScreenBackground">#F8FBF9</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>\n        <item name="windowSplashScreenIconBackgroundColor">#F8FBF9</item>\n        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>\n    </style>`
  const pattern = /\s*<style\s+name="AppTheme\.NoActionBarLaunch"[\s\S]*?<\/style>/
  if (pattern.test(styles)) styles = styles.replace(pattern, `\n${launchStyle}`)
  else styles = styles.replace(/<\/resources>\s*$/, `${launchStyle}\n</resources>\n`)
  writeFileSync(stylesPath, styles)
}

console.log('Novo launcher do Eu Reciclo aplicado: PNG legacy + roundIcon + adaptive icon API 26+, sem bordas pretas.')
