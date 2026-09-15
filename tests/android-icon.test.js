import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const script = readFileSync(new URL('../scripts/apply-android-icon.mjs', import.meta.url), 'utf8')
const fullscreenScript = readFileSync(new URL('../scripts/apply-android-fullscreen.mjs', import.meta.url), 'utf8')

test('ícone Android usa apenas o recurso padrão de background', () => {
  assert.match(script, /ic_launcher_background\.xml/)
  assert.match(script, /eu_reciclo_icon\.xml/)
  assert.match(script, /rmSync\(legacyCustomColor\)/)
  assert.doesNotMatch(script, /writeFileSync\(join\(values, ['"]eu_reciclo_icon\.xml['"]\)/)
  assert.match(script, /AndroidManifest\.xml/)
  assert.match(script, /AppTheme\.NoActionBarLaunch/)
  assert.match(script, /windowSplashScreenAnimatedIcon/)
  assert.match(script, /splash_logo\.png/)
  assert.match(script, /splash_background\.xml/)
  assert.match(script, /android:windowBackground/)
  assert.match(fullscreenScript, /SplashScreen\.installSplashScreen\(this\)/)
  assert.match(fullscreenScript, /androidx\.core\.splashscreen\.SplashScreen/)
})
