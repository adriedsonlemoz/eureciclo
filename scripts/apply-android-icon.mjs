import { existsSync, mkdirSync, copyFileSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
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

// Capacitor cria este recurso por padrão. Reutilizamos o mesmo nome para evitar
// "Duplicate resources" e garantir que o adaptive icon use nossa identidade.
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

// Garante que o Manifest aponte explicitamente para os recursos substituídos.
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

// Android 12+ mostra a splash nativa antes da WebView. O Capacitor usa
// AppTheme.NoActionBarLaunch; substituímos apenas esse estilo para mostrar a
// marca do Eu Reciclo, sem depender do ícone/robô padrão do template Android.
if (existsSync(stylesPath)) {
  let styles = readFileSync(stylesPath, 'utf8')
  const launchStyle = `    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n        <item name="android:windowBackground">@drawable/splash_background</item>\n        <item name="windowSplashScreenBackground">#F8FBF9</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>\n        <item name="windowSplashScreenIconBackgroundColor">#F8FBF9</item>\n        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>\n    </style>`
  const pattern = /\s*<style\s+name="AppTheme\.NoActionBarLaunch"[\s\S]*?<\/style>/
  if (pattern.test(styles)) {
    styles = styles.replace(pattern, `\n${launchStyle}`)
  } else {
    styles = styles.replace(/<\/resources>\s*$/, `${launchStyle}\n</resources>\n`)
  }
  writeFileSync(stylesPath, styles)
}

console.log('Launcher e splash do Eu Reciclo aplicados aos recursos Android.')
