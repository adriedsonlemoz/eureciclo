import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, chmodSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

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
  assert.match(verifyScript, /dump', 'xmltree'/)
  assert.match(verifyScript, /dump', 'resources'/)
  assert.match(verifyScript, /android:\$\{attribute\}/)
  assert.match(verifyScript, /ic_launcher_round/)
  assert.match(verifyScript, /ic_launcher_foreground/)
  assert.match(verifyScript, /pixelHash/)
  assert.match(verifyScript, /com\.eureciclo\.app/)
  assert.doesNotMatch(verifyScript, /application-icon-\\d\+.*ic_launcher\\\.png/)
  assert.match(workflow, /Verify generated launcher resources/)
  assert.match(workflow, /Verify launcher icon inside APK/)
  assert.match(workflow, /verify:apk-icon/)
})


test('validador aceita adaptive icon anunciado via Manifest binário sem depender de application-icon PNG', () => {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url))
  const temp = mkdtempSync(join(tmpdir(), 'eu-reciclo-icon-test-'))
  const sdk = join(temp, 'sdk')
  const buildTools = join(sdk, 'build-tools', '35.0.0')
  const bin = join(temp, 'bin')
  mkdirSync(buildTools, { recursive: true })
  mkdirSync(bin, { recursive: true })

  const aaptPath = join(buildTools, 'aapt')
  writeFileSync(aaptPath, `#!/usr/bin/env bash
set -e
case "$2" in
  badging)
    echo "package: name='com.eureciclo.app' versionCode='10408' versionName='1.4.8'"
    echo "application: label='Eu Reciclo' icon='res/mipmap-anydpi-v26/ic_launcher.xml'"
    ;;
  xmltree)
    cat <<'EOF'
E: manifest (line=2)
  E: application (line=8)
    A: android:icon(0x01010002)=@0x7f0d0001
    A: android:roundIcon(0x0101052c)=@0x7f0d0002
    E: activity (line=12)
EOF
    ;;
  resources)
    cat <<'EOF'
spec resource 0x7f0d0001 com.eureciclo.app:mipmap/ic_launcher: flags=0x00000000
resource 0x7f0d0001 com.eureciclo.app:mipmap/ic_launcher: t=0x03 d=0x00000000 (s=0x0008 r=0x00)
spec resource 0x7f0d0002 com.eureciclo.app:mipmap/ic_launcher_round: flags=0x00000000
resource 0x7f0d0002 com.eureciclo.app:mipmap/ic_launcher_round: t=0x03 d=0x00000000 (s=0x0008 r=0x00)
EOF
    ;;
  *) exit 2 ;;
esac
`)
  chmodSync(aaptPath, 0o755)

  const unzipPath = join(bin, 'unzip')
  writeFileSync(unzipPath, `#!/usr/bin/env bash
set -e
if [ "$1" = "-Z1" ]; then
  cat <<'EOF'
res/mipmap-xxxhdpi/ic_launcher.png
res/mipmap-xxxhdpi/ic_launcher_round.png
res/drawable-xxxhdpi/ic_launcher_foreground.png
res/mipmap-anydpi-v26/ic_launcher.xml
res/mipmap-anydpi-v26/ic_launcher_round.xml
EOF
  exit 0
fi
if [ "$1" = "-p" ]; then
  case "$3" in
    res/mipmap-xxxhdpi/ic_launcher.png|res/mipmap-xxxhdpi/ic_launcher_round.png)
      cat "$FAKE_PROJECT_ROOT/resources/android/mipmap-xxxhdpi/ic_launcher.png" ;;
    res/drawable-xxxhdpi/ic_launcher_foreground.png)
      cat "$FAKE_PROJECT_ROOT/resources/android/drawable/ic_launcher_foreground.png" ;;
    *) exit 3 ;;
  esac
  exit 0
fi
exit 4
`)
  chmodSync(unzipPath, 0o755)

  const fakeApk = join(temp, 'app-release.apk')
  writeFileSync(fakeApk, 'fixture')

  const result = spawnSync(process.execPath, ['scripts/verify-android-icon.mjs', '--apk', fakeApk], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      ANDROID_SDK_ROOT: sdk,
      FAKE_PROJECT_ROOT: projectRoot
    }
  })

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /Manifest -> @mipmap\/ic_launcher \/ @mipmap\/ic_launcher_round/)
  assert.match(result.stdout, /APK confirmado com o ícone oficial do Eu Reciclo/)
})
