import { existsSync, readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
const manager = JSON.parse(readFileSync(new URL('../github-manager.json', import.meta.url), 'utf8'))
const [major = 0, minor = 0, patch = 0] = pkg.version.split('.').map(Number)
const expectedCode = major * 10000 + minor * 100 + patch

const errors = []
if (lock.version !== pkg.version) errors.push(`package-lock.json version=${lock.version} difere de package.json=${pkg.version}`)
if (lock.packages?.['']?.version !== pkg.version) errors.push(`package-lock raiz=${lock.packages?.['']?.version} difere de package.json=${pkg.version}`)
if (manager.versionName !== pkg.version) errors.push(`github-manager.json versionName=${manager.versionName} difere de package.json=${pkg.version}`)
if (manager.versionCode !== expectedCode) errors.push(`github-manager.json versionCode=${manager.versionCode} deveria ser ${expectedCode}`)
if (manager.applicationId !== 'com.eureciclo.app') errors.push(`applicationId inesperado: ${manager.applicationId}`)
if (!Array.isArray(manager.features) || manager.features.length < 10) errors.push('github-manager.json precisa listar as funções principais em features')
if (!pkg.scripts?.['apply:android-icon']) errors.push('package.json precisa manter o script apply:android-icon')
if (!String(pkg.scripts?.['android:prepare'] || '').includes('apply:android-icon')) errors.push('android:prepare precisa aplicar o ícone Android')

for (const asset of [
  'src/assets/app-icon.png',
  'public/app-icon.png',
  'resources/android/mipmap-mdpi/ic_launcher.png',
  'resources/android/mipmap-xxxhdpi/ic_launcher.png',
  'resources/android/drawable/ic_launcher_foreground.png'
]) {
  if (!existsSync(new URL(`../${asset}`, import.meta.url))) errors.push(`recurso obrigatório ausente: ${asset}`)
}

if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`)
  process.exit(1)
}
console.log(`Versão consistente: ${pkg.version} / ${expectedCode} · ${manager.features.length} funções declaradas · ícone Android pronto`)
