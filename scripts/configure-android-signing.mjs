import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const gradlePath = resolve('android/app/build.gradle')
const requiredEnv = [
  'ANDROID_KEYSTORE_PATH',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD'
]

for (const name of requiredEnv) {
  if (!process.env[name]?.trim()) {
    console.error(`Variável obrigatória ausente para assinatura Release: ${name}`)
    process.exit(1)
  }
}

if (!existsSync(gradlePath)) {
  console.error('android/app/build.gradle não encontrado. Execute android:prepare primeiro.')
  process.exit(1)
}

if (!existsSync(process.env.ANDROID_KEYSTORE_PATH)) {
  console.error('Arquivo de keystore não encontrado em ANDROID_KEYSTORE_PATH.')
  process.exit(1)
}

let gradle = readFileSync(gradlePath, 'utf8')

const markerStart = '// EU_RECICLO_RELEASE_SIGNING_BEGIN'
const markerEnd = '// EU_RECICLO_RELEASE_SIGNING_END'
const previousBlock = new RegExp(`\\n?\\s*${markerStart}[\\s\\S]*?${markerEnd}\\n?`, 'g')
gradle = gradle.replace(previousBlock, '\n')
gradle = gradle.replace(/\n[ \t]*\/\/ EU_RECICLO_RELEASE_SIGNING_CONFIG\r?\n[ \t]*signingConfig signingConfigs\.release[ \t]*(?=\r?\n)/g, '')

const signingBlock = `
    ${markerStart}
    signingConfigs {
        release {
            def keystorePath = System.getenv('ANDROID_KEYSTORE_PATH')
            def keystorePassword = System.getenv('ANDROID_KEYSTORE_PASSWORD')
            def keyAliasValue = System.getenv('ANDROID_KEY_ALIAS')
            def keyPasswordValue = System.getenv('ANDROID_KEY_PASSWORD')

            if (!keystorePath || !keystorePassword || !keyAliasValue || !keyPasswordValue) {
                throw new GradleException('Assinatura Release exige ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS e ANDROID_KEY_PASSWORD.')
            }

            storeFile file(keystorePath)
            storePassword keystorePassword
            keyAlias keyAliasValue
            keyPassword keyPasswordValue
        }
    }
    ${markerEnd}
`

const buildTypesPattern = /\n(\s*)buildTypes\s*\{/
if (!buildTypesPattern.test(gradle)) {
  console.error('Bloco buildTypes não encontrado em android/app/build.gradle.')
  process.exit(1)
}
gradle = gradle.replace(buildTypesPattern, `${signingBlock}\n    buildTypes {`)

const releasePattern = /(buildTypes\s*\{[\s\S]*?release\s*\{)/
if (!releasePattern.test(gradle)) {
  console.error('Bloco buildTypes.release não encontrado em android/app/build.gradle.')
  process.exit(1)
}
gradle = gradle.replace(
  releasePattern,
  `$1\n            // EU_RECICLO_RELEASE_SIGNING_CONFIG\n            signingConfig signingConfigs.release`
)

writeFileSync(gradlePath, gradle)
console.log('Assinatura Android Release configurada para usar exclusivamente o keystore informado pelo ambiente.')
