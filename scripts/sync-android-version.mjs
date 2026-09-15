import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const [major = 0, minor = 0, patch = 0] = pkg.version.split('.').map(Number)
const versionCode = major * 10000 + minor * 100 + patch
const gradlePath = resolve('android/app/build.gradle')

if (!existsSync(gradlePath)) {
  console.error('android/app/build.gradle não encontrado. Execute cap add/sync android primeiro.')
  process.exit(1)
}

let gradle = readFileSync(gradlePath, 'utf8')
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
gradle = gradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${pkg.version}"`)
writeFileSync(gradlePath, gradle)
console.log(`Android sincronizado: versionName=${pkg.version}, versionCode=${versionCode}`)
