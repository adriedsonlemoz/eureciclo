import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { extractApkCertificateSha256 } from '../scripts/extract-apksigner-cert.mjs'

const workflow = readFileSync(new URL('../.github/workflows/build-apk.yml', import.meta.url), 'utf8')
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const signingScript = readFileSync(new URL('../scripts/configure-android-signing.mjs', import.meta.url), 'utf8')
const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8')

test('workflow de produção gera somente APK Release assinado', () => {
  assert.match(workflow, /assembleRelease/)
  assert.match(workflow, /build\/outputs\/apk\/release\/app-release\.apk/)
  assert.doesNotMatch(workflow, /assembleDebug/)
  assert.doesNotMatch(workflow, /app-debug\.apk/)
})

test('workflow exige os quatro secrets de assinatura permanente', () => {
  for (const name of [
    'ANDROID_KEYSTORE_BASE64',
    'ANDROID_KEYSTORE_PASSWORD',
    'ANDROID_KEY_ALIAS',
    'ANDROID_KEY_PASSWORD'
  ]) {
    assert.match(workflow, new RegExp(`secrets\\.${name}`))
  }
  assert.match(workflow, /base64 --decode/)
})

test('assinatura é validada contra o certificado do keystore', () => {
  assert.match(workflow, /\"\$APKSIGNER\" verify --verbose --print-certs/)
  assert.match(workflow, /keytool -exportcert/)
  assert.match(workflow, /extract-apksigner-cert\.mjs/)
  assert.match(workflow, /APK_CERT_SHA256/)
  assert.match(workflow, /KEYSTORE_CERT_SHA256/)
  assert.match(workflow, /Android Debug/)
})


test('extrator aceita saída atual do apksigner com V2 Signer', () => {
  const digest = 'ac4d833375b94bcebce4386077085825e561c03f7f1cd6864ed99d8fb2759906'
  const report = `Verifies
Number of signers: 1
V2 Signer: certificate DN: CN=Eu Reciclo
V2 Signer: certificate SHA-256 digest: ${digest}
V2 Signer: public key SHA-256 digest: a94e8d0c7751d5f3a5a6026d494399cbce8395f34302acf8ae0be015de0590c0
`
  assert.equal(extractApkCertificateSha256(report), digest)
})

test('extrator continua aceitando formato legado Signer #1', () => {
  const digest = 'AC4D833375B94BCEBCE4386077085825E561C03F7F1CD6864ED99D8FB2759906'
  const report = `Signer #1 certificate SHA-256 digest: ${digest}
`
  assert.equal(extractApkCertificateSha256(report), digest.toLowerCase())
})

test('extrator rejeita relatório sem digest de certificado', () => {
  assert.throws(() => extractApkCertificateSha256(`Verifies\nNumber of signers: 1\n`), /Nenhum SHA-256/)
})

test('script Gradle não possui fallback para assinatura debug', () => {
  assert.equal(packageJson.scripts['configure:android-signing'], 'node scripts/configure-android-signing.mjs')
  for (const name of [
    'ANDROID_KEYSTORE_PATH',
    'ANDROID_KEYSTORE_PASSWORD',
    'ANDROID_KEY_ALIAS',
    'ANDROID_KEY_PASSWORD'
  ]) {
    assert.match(signingScript, new RegExp(name))
  }
  assert.match(signingScript, /signingConfig signingConfigs\.release/)
  assert.match(signingScript, /GradleException/)
  assert.doesNotMatch(signingScript, /signingConfigs\.debug/)
})

test('arquivos de chave são ignorados pelo repositório', () => {
  assert.match(gitignore, /\*\.jks/)
  assert.match(gitignore, /\*\.keystore/)
  assert.match(gitignore, /key\.properties/)
})

test('configurador de assinatura é idempotente no build.gradle gerado', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { spawnSync } = await import('node:child_process')
  const { fileURLToPath } = await import('node:url')

  const root = mkdtempSync(join(tmpdir(), 'eu-reciclo-signing-'))
  const appDir = join(root, 'android', 'app')
  const keystore = join(root, 'release.jks')
  mkdirSync(appDir, { recursive: true })
  writeFileSync(keystore, 'fixture')
  writeFileSync(join(appDir, 'build.gradle'), `apply plugin: 'com.android.application'\nandroid {\n    buildTypes {\n        release {\n            minifyEnabled false\n        }\n    }\n}\n`)

  const scriptPath = fileURLToPath(new URL('../scripts/configure-android-signing.mjs', import.meta.url))
  const env = {
    ...process.env,
    ANDROID_KEYSTORE_PATH: keystore,
    ANDROID_KEYSTORE_PASSWORD: 'store-pass',
    ANDROID_KEY_ALIAS: 'release',
    ANDROID_KEY_PASSWORD: 'key-pass'
  }

  try {
    for (let i = 0; i < 2; i += 1) {
      const result = spawnSync(process.execPath, [scriptPath], { cwd: root, env, encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr || result.stdout)
    }
    const gradle = readFileSync(join(appDir, 'build.gradle'), 'utf8')
    assert.equal((gradle.match(/signingConfig signingConfigs\.release/g) || []).length, 1)
    assert.match(gradle, /signingConfig signingConfigs\.release\n\s+minifyEnabled false/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
