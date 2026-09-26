import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const script = readFileSync(new URL('../scripts/apply-android-icon.mjs', import.meta.url), 'utf8')
const fullscreenScript = readFileSync(new URL('../scripts/apply-android-fullscreen.mjs', import.meta.url), 'utf8')
const verifyScript = readFileSync(new URL('../scripts/verify-android-icon.mjs', import.meta.url), 'utf8')
const workflow = readFileSync(new URL('../.github/workflows/build-apk.yml', import.meta.url), 'utf8')

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
  assert.match(script, /drawable-xxxhdpi/)
  assert.match(script, /readdirSync\(resRoot/)
  assert.match(script, /android:windowBackground/)
  assert.match(fullscreenScript, /SplashScreen\.installSplashScreen\(this\)/)
  assert.match(fullscreenScript, /androidx\.core\.splashscreen\.SplashScreen/)
})

test('splash background usa drawable válido em vez de cor literal no android:drawable', () => {
  assert.doesNotMatch(script, /android:drawable=["']#[0-9A-Fa-f]{6,8}["']/)
  assert.match(script, /<shape android:shape="rectangle">/)
  assert.match(script, /<solid android:color="#F8FBF9" \/>/)
})


test('build verifica a identidade visual do launcher dentro do APK', () => {
  assert.match(verifyScript, /aapt/)
  assert.match(verifyScript, /dump', 'badging'/)
  assert.match(verifyScript, /ic_launcher_foreground/)
  assert.match(verifyScript, /pixelHash/)
  assert.match(verifyScript, /com\.eureciclo\.app/)
  assert.match(workflow, /Verify generated launcher resources/)
  assert.match(workflow, /Verify launcher icon inside APK/)
  assert.match(workflow, /verify:apk-icon/)
})
