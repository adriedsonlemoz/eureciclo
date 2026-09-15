import { readFileSync } from 'node:fs'

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
if (!Array.isArray(manager.features) || manager.features.length < 6) errors.push('github-manager.json precisa listar as funções principais em features')

if (errors.length) {
  for (const error of errors) console.error(`ERRO: ${error}`)
  process.exit(1)
}
console.log(`Versão consistente: ${pkg.version} / ${expectedCode} · ${manager.features.length} funções declaradas`)
