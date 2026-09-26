import { existsSync, readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
const manager = JSON.parse(readFileSync(new URL('../github-manager.json', import.meta.url), 'utf8'))
const [major = 0, minor = 0, patch = 0] = pkg.version.split('.').map(Number)
const expectedCode = major * 10000 + minor * 100 + patch

const workflowPath = new URL('../.github/workflows/build-apk.yml', import.meta.url)
const signingScriptPath = new URL('../scripts/configure-android-signing.mjs', import.meta.url)
const workflow = existsSync(workflowPath) ? readFileSync(workflowPath, 'utf8') : ''
const signingScript = existsSync(signingScriptPath) ? readFileSync(signingScriptPath, 'utf8') : ''

const errors = []
if (lock.version !== pkg.version) errors.push(`package-lock.json version=${lock.version} difere de package.json=${pkg.version}`)
if (lock.packages?.['']?.version !== pkg.version) errors.push(`package-lock raiz=${lock.packages?.['']?.version} difere de package.json=${pkg.version}`)
if (manager.versionName !== pkg.version) errors.push(`github-manager.json versionName=${manager.versionName} difere de package.json=${pkg.version}`)
if (manager.versionCode !== expectedCode) errors.push(`github-manager.json versionCode=${manager.versionCode} deveria ser ${expectedCode}`)
if (manager.applicationId !== 'com.eureciclo.app') errors.push(`applicationId inesperado: ${manager.applicationId}`)
if (!Array.isArray(manager.features) || manager.features.length < 10) errors.push('github-manager.json precisa listar as funções principais em features')
if (!pkg.scripts?.['apply:android-icon']) errors.push('package.json precisa manter o script apply:android-icon')
if (!pkg.scripts?.['verify:android-icon']) errors.push('package.json precisa manter o script verify:android-icon')
if (!pkg.scripts?.['verify:apk-icon']) errors.push('package.json precisa manter o script verify:apk-icon')
if (!String(pkg.scripts?.['android:prepare'] || '').includes('apply:android-icon')) errors.push('android:prepare precisa aplicar o ícone Android')

if (pkg.scripts?.['configure:android-signing'] !== 'node scripts/configure-android-signing.mjs') errors.push('package.json precisa manter configure:android-signing')
if (!workflow.includes('assembleRelease')) errors.push('workflow precisa gerar assembleRelease')
if (workflow.includes('assembleDebug') || workflow.includes('app-debug.apk')) errors.push('workflow de produção não pode publicar APK Debug')
for (const secret of ['ANDROID_KEYSTORE_BASE64', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD']) {
  if (!workflow.includes(`secrets.${secret}`)) errors.push(`workflow precisa usar o secret ${secret}`)
}
if (!workflow.includes('apksigner') || !workflow.includes('KEYSTORE_CERT_SHA256')) errors.push('workflow precisa validar o certificado do APK Release')
if (!workflow.includes('Verify launcher icon inside APK') || !workflow.includes('verify:apk-icon')) errors.push('workflow precisa validar o ícone dentro do APK final')
if (!signingScript.includes('signingConfig signingConfigs.release') || signingScript.includes('signingConfigs.debug')) errors.push('configuração Release precisa usar somente signingConfigs.release')

const requiredAssets = [
  'src/assets/app-icon.png',
  'public/app-icon.png',
  'resources/android/drawable/ic_launcher_foreground.png',
  'resources/android/drawable/splash_logo.png',
  ...['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'].flatMap(density => [
    `resources/android/mipmap-${density}/ic_launcher.png`,
    `resources/android/mipmap-${density}/ic_launcher_round.png`
  ])
]

for (const asset of requiredAssets) {
  if (!existsSync(new URL(`../${asset}`, import.meta.url))) errors.push(`recurso obrigatório ausente: ${asset}`)
}

if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`)
  process.exit(1)
}
console.log(`Versão consistente: ${pkg.version} / ${expectedCode} · ${manager.features.length} funções declaradas · ícone Android e assinatura Release prontos`)
