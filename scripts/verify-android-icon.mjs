import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { inflateSync } from 'node:zlib'
import { join } from 'node:path'

const canonicalLegacy = 'resources/android/mipmap-xxxhdpi/ic_launcher.png'
const canonicalForeground = 'resources/android/drawable/ic_launcher_foreground.png'
const generatedRoot = 'android/app/src/main'

function fail(message) {
  console.error(`ERRO: ${message}`)
  process.exit(1)
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

function readPngPixels(buffer, label) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)) fail(`${label} não é um PNG válido`)

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = -1
  let interlace = -1
  const idat = []
  let palette = null
  let transparency = null

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    if (dataEnd + 4 > buffer.length) fail(`${label} possui chunk PNG truncado`)
    const data = buffer.subarray(dataStart, dataEnd)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'PLTE') {
      palette = Buffer.from(data)
    } else if (type === 'tRNS') {
      transparency = Buffer.from(data)
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
    offset = dataEnd + 4
  }

  if (!width || !height || !idat.length) fail(`${label} não possui estrutura PNG completa`)
  if (bitDepth !== 8) fail(`${label} usa bit depth ${bitDepth}; esperado 8`)
  if (interlace !== 0) fail(`${label} usa PNG entrelaçado; não suportado pela validação`)

  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 })[colorType]
  if (!channels) fail(`${label} usa color type PNG ${colorType} não suportado`)
  if (colorType === 3 && !palette) fail(`${label} usa paleta sem PLTE`)

  const rowBytes = width * channels
  const raw = inflateSync(Buffer.concat(idat))
  const expected = height * (rowBytes + 1)
  if (raw.length !== expected) fail(`${label} possui tamanho de pixels inesperado`)

  const unfiltered = Buffer.alloc(height * rowBytes)
  let src = 0
  let dst = 0
  for (let y = 0; y < height; y += 1) {
    const filter = raw[src++]
    for (let x = 0; x < rowBytes; x += 1) {
      const value = raw[src++]
      const left = x >= channels ? unfiltered[dst + x - channels] : 0
      const up = y > 0 ? unfiltered[dst + x - rowBytes] : 0
      const upLeft = y > 0 && x >= channels ? unfiltered[dst + x - rowBytes - channels] : 0
      let out
      if (filter === 0) out = value
      else if (filter === 1) out = (value + left) & 0xff
      else if (filter === 2) out = (value + up) & 0xff
      else if (filter === 3) out = (value + Math.floor((left + up) / 2)) & 0xff
      else if (filter === 4) {
        const p = left + up - upLeft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upLeft)
        const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
        out = (value + predictor) & 0xff
      } else fail(`${label} usa filtro PNG desconhecido ${filter}`)
      unfiltered[dst + x] = out
    }
    dst += rowBytes
  }

  const rgba = Buffer.alloc(width * height * 4)
  let p = 0
  for (let i = 0; i < width * height; i += 1) {
    if (colorType === 6) {
      rgba[p++] = unfiltered[i * 4]
      rgba[p++] = unfiltered[i * 4 + 1]
      rgba[p++] = unfiltered[i * 4 + 2]
      rgba[p++] = unfiltered[i * 4 + 3]
    } else if (colorType === 2) {
      rgba[p++] = unfiltered[i * 3]
      rgba[p++] = unfiltered[i * 3 + 1]
      rgba[p++] = unfiltered[i * 3 + 2]
      rgba[p++] = 255
    } else if (colorType === 0) {
      const gray = unfiltered[i]
      rgba[p++] = gray
      rgba[p++] = gray
      rgba[p++] = gray
      rgba[p++] = 255
    } else if (colorType === 4) {
      const gray = unfiltered[i * 2]
      rgba[p++] = gray
      rgba[p++] = gray
      rgba[p++] = gray
      rgba[p++] = unfiltered[i * 2 + 1]
    } else if (colorType === 3) {
      const index = unfiltered[i]
      const paletteOffset = index * 3
      if (paletteOffset + 2 >= palette.length) fail(`${label} possui índice de paleta inválido`)
      rgba[p++] = palette[paletteOffset]
      rgba[p++] = palette[paletteOffset + 1]
      rgba[p++] = palette[paletteOffset + 2]
      rgba[p++] = transparency && index < transparency.length ? transparency[index] : 255
    }
  }

  return { width, height, pixelHash: sha256(rgba), rgba }
}


function assertNoOpaqueBlackCorners(path, label = path) {
  const parsed = readPngPixels(readFileSync(path), label)
  const points = [
    [0, 0],
    [parsed.width - 1, 0],
    [0, parsed.height - 1],
    [parsed.width - 1, parsed.height - 1]
  ]
  for (const [x, y] of points) {
    const offset = (y * parsed.width + x) * 4
    const r = parsed.rgba[offset]
    const g = parsed.rgba[offset + 1]
    const b = parsed.rgba[offset + 2]
    const a = parsed.rgba[offset + 3]
    if (a >= 224 && r < 40 && g < 40 && b < 40) {
      fail(`${label} contém canto preto opaco em ${x},${y}`)
    }
  }
}

function pixelSignature(path) {
  const parsed = readPngPixels(readFileSync(path), path)
  return `${parsed.width}x${parsed.height}:${parsed.pixelHash}`
}

function assertSamePixels(expectedPath, actualBuffer, actualLabel) {
  const expected = readPngPixels(readFileSync(expectedPath), expectedPath)
  const actual = readPngPixels(actualBuffer, actualLabel)
  if (expected.width !== actual.width || expected.height !== actual.height || expected.pixelHash !== actual.pixelHash) {
    fail(`${actualLabel} não corresponde visualmente ao ícone oficial do projeto`)
  }
  return actual
}

function verifyProject() {
  const manifestPath = join(generatedRoot, 'AndroidManifest.xml')
  const adaptivePath = join(generatedRoot, 'res/mipmap-anydpi-v26/ic_launcher.xml')
  const roundAdaptivePath = join(generatedRoot, 'res/mipmap-anydpi-v26/ic_launcher_round.xml')
  const foregroundPath = join(generatedRoot, 'res/drawable-xxxhdpi/ic_launcher_foreground.png')
  const masterPath = 'resources/android/source/app-icon-master.png'

  for (const path of [canonicalLegacy, canonicalForeground, masterPath, manifestPath, adaptivePath, roundAdaptivePath, foregroundPath]) {
    if (!existsSync(path)) fail(`recurso obrigatório ausente: ${path}`)
  }

  const manifest = readFileSync(manifestPath, 'utf8')
  if (!/android:icon="@mipmap\/ic_launcher"/.test(manifest)) fail('AndroidManifest.xml não aponta para @mipmap/ic_launcher')
  if (!/android:roundIcon="@mipmap\/ic_launcher_round"/.test(manifest)) fail('AndroidManifest.xml não aponta para @mipmap/ic_launcher_round')

  for (const path of [adaptivePath, roundAdaptivePath]) {
    const xml = readFileSync(path, 'utf8')
    if (!xml.includes('@color/ic_launcher_background')) fail(`${path} não usa o fundo oficial`)
    if (!xml.includes('@drawable/ic_launcher_foreground')) fail(`${path} não usa o foreground oficial`)
  }

  assertNoOpaqueBlackCorners(canonicalLegacy, 'launcher principal oficial')
  assertNoOpaqueBlackCorners(masterPath, 'arquivo mestre do ícone')

  const canonicalForegroundBytes = readFileSync(canonicalForeground)
  assertNoOpaqueBlackCorners(canonicalForeground, 'foreground adaptive oficial')
  if (!readFileSync(foregroundPath).equals(canonicalForegroundBytes)) fail('foreground Android gerado difere do recurso oficial')

  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
  for (const density of densities) {
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      const source = `resources/android/mipmap-${density}/${name}`
      const generated = join(generatedRoot, `res/mipmap-${density}/${name}`)
      if (!existsSync(source) || !existsSync(generated)) fail(`launcher ${density}/${name} ausente`)
      if (!readFileSync(source).equals(readFileSync(generated))) fail(`launcher Android gerado difere da fonte: ${density}/${name}`)
    }
  }

  const icon = readPngPixels(readFileSync(canonicalLegacy), canonicalLegacy)
  const foreground = readPngPixels(canonicalForegroundBytes, canonicalForeground)
  console.log(`Projeto Android usa o novo ícone oficial sem cantos pretos: legacy ${icon.width}x${icon.height}, adaptive ${foreground.width}x${foreground.height}.`)
}

function unzipList(apkPath) {
  const result = spawnSync('unzip', ['-Z1', apkPath], { encoding: 'utf8' })
  if (result.status !== 0) fail(`não foi possível listar o APK: ${result.stderr || result.stdout}`)
  return result.stdout.split(/\r?\n/).filter(Boolean)
}

function unzipEntry(apkPath, entry) {
  const result = spawnSync('unzip', ['-p', apkPath, entry], { encoding: null, maxBuffer: 20 * 1024 * 1024 })
  if (result.status !== 0) fail(`não foi possível extrair ${entry} do APK`)
  return result.stdout
}

function findAapt() {
  if (!process.env.ANDROID_SDK_ROOT && !process.env.ANDROID_HOME) return null
  const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME
  const result = spawnSync('bash', ['-lc', `find "${sdk}/build-tools" -type f -name aapt -perm -111 | sort -V | tail -n 1`], { encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : null
}

function runAapt(aapt, args, label) {
  const result = spawnSync(aapt, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  if (result.status !== 0) fail(`aapt não conseguiu ${label}: ${result.stderr || result.stdout}`)
  return result.stdout
}

function getApplicationAttributeResourceId(xmlTree, attribute) {
  const lines = xmlTree.split(/\r?\n/)
  const applicationIndex = lines.findIndex(line => /^\s*E: application\b/.test(line))
  if (applicationIndex < 0) fail('AndroidManifest.xml empacotado não contém <application>')

  const applicationIndent = lines[applicationIndex].match(/^\s*/)?.[0].length ?? 0
  for (let i = applicationIndex + 1; i < lines.length; i += 1) {
    const line = lines[i]
    const indent = line.match(/^\s*/)?.[0].length ?? 0
    if (/^\s*E: /.test(line) && indent <= applicationIndent) break
    if (/^\s*E: /.test(line) && indent > applicationIndent) break
    const match = line.match(new RegExp(`android:${attribute}\\(0x[0-9a-f]+\\)=@(0x[0-9a-f]+)`, 'i'))
    if (match) return match[1].toLowerCase()
  }
  return null
}

function findResourceNameLine(resources, resourceId, expectedType, expectedName) {
  if (!resourceId) return null
  const escapedId = resourceId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expected = new RegExp(`(?:spec\\s+)?resource\\s+${escapedId}\\s+com\\.eureciclo\\.app:${expectedType}/${expectedName}(?::|\\s)`, 'i')
  return resources.split(/\r?\n/).find(line => expected.test(line)) || null
}

function assertResourceIdName(resources, resourceId, expectedType, expectedName, attribute) {
  if (!resourceId) fail(`Manifest empacotado não declara android:${attribute}`)
  const matchedLine = findResourceNameLine(resources, resourceId, expectedType, expectedName)
  if (!matchedLine) {
    const resourceLine = resources.split(/\r?\n/).find(line => line.toLowerCase().includes(resourceId)) || '(recurso não localizado)'
    fail(`android:${attribute} não aponta para @${expectedType}/${expectedName}; ${resourceLine.trim()}`)
  }
  return matchedLine.trim()
}

function findResourceIdByName(resources, type, name) {
  const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(?:spec\\s+)?resource\\s+(0x[0-9a-f]+)\\s+com\\.eureciclo\\.app:${escapedType}/${escapedName}(?::|\\s)`, 'i')
  for (const line of resources.split(/\r?\n/)) {
    const match = line.match(pattern)
    if (match) return match[1].toLowerCase()
  }
  return null
}

function assertCompiledResource(resources, type, name) {
  const id = findResourceIdByName(resources, type, name)
  if (!id) fail(`recurso compilado @${type}/${name} não foi encontrado em resources.arsc`)
  return id
}

function findResourcePaths(resources, resourceId) {
  const lines = resources.split(/\r?\n/)
  const paths = new Set()
  const idPattern = new RegExp(`^\\s*resource\\s+${resourceId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  const pathPattern = /(?:"|')?(res\/[A-Za-z0-9_./-]+\.(?:png|webp|xml))(?:"|')?/gi

  for (let i = 0; i < lines.length; i += 1) {
    if (!idPattern.test(lines[i]) || /^\s*spec\s+resource\s+/i.test(lines[i])) continue
    for (let j = i; j < Math.min(lines.length, i + 12); j += 1) {
      if (j > i && /^\s*(?:spec\s+)?resource\s+0x[0-9a-f]+\b/i.test(lines[j])) break
      for (const match of lines[j].matchAll(pathPattern)) paths.add(match[1])
    }
  }
  return [...paths]
}

function canonicalLauncherSignatures(kind) {
  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
  const name = kind === 'round' ? 'ic_launcher_round.png' : 'ic_launcher.png'
  return new Set(densities.map(density => pixelSignature(`resources/android/mipmap-${density}/${name}`)))
}

function verifyReferencedPngsIfVisible({ apkPath, entries, resources, resourceId, canonicalSignatures, label }) {
  const paths = findResourcePaths(resources, resourceId)
  const pngPaths = paths.filter(path => path.toLowerCase().endsWith('.png') && entries.has(path))
  if (!pngPaths.length) {
    console.log(`${label}: caminhos físicos foram encurtados/omitidos pelo otimizador; identidade confirmada semanticamente em resources.arsc.`)
    return false
  }

  let checked = 0
  for (const path of pngPaths) {
    const parsed = readPngPixels(unzipEntry(apkPath, path), path)
    const signature = `${parsed.width}x${parsed.height}:${parsed.pixelHash}`
    if (!canonicalSignatures.has(signature)) fail(`${label}: ${path} não corresponde aos pixels oficiais do projeto`)
    checked += 1
  }
  console.log(`${label}: ${checked} PNG(s) referenciado(s) pelo APK conferido(s) por pixels.`)
  return true
}

function verifyApk(apkPath) {
  if (!apkPath || !existsSync(apkPath)) fail(`APK não encontrado: ${apkPath || '(não informado)'}`)
  const aapt = findAapt()
  if (!aapt) fail('aapt não encontrado no Android SDK; não é possível conferir o launcher do APK')

  const badging = runAapt(aapt, ['dump', 'badging', apkPath], 'ler o badging do APK')
  if (!/package: name='com\.eureciclo\.app'/.test(badging)) fail('APK verificado não pertence ao package com.eureciclo.app')

  // Release builds podem encurtar fisicamente nomes de arquivos em res/ (por
  // exemplo, res/a.png). Portanto a prova principal não depende do nome do ZIP:
  // usamos o Manifest binário + resources.arsc, que preservam os IDs e nomes
  // semânticos @mipmap/ic_launcher e @mipmap/ic_launcher_round.
  const xmlTree = runAapt(aapt, ['dump', 'xmltree', apkPath, 'AndroidManifest.xml'], 'ler o AndroidManifest.xml do APK')
  const resources = runAapt(aapt, ['dump', 'resources', apkPath], 'ler a tabela de recursos do APK')
  const iconResourceId = getApplicationAttributeResourceId(xmlTree, 'icon')
  const roundIconResourceId = getApplicationAttributeResourceId(xmlTree, 'roundIcon')
  const iconResourceLine = assertResourceIdName(resources, iconResourceId, 'mipmap', 'ic_launcher', 'icon')
  const roundIconResourceLine = assertResourceIdName(resources, roundIconResourceId, 'mipmap', 'ic_launcher_round', 'roundIcon')
  const foregroundResourceId = assertCompiledResource(resources, 'drawable', 'ic_launcher_foreground')
  assertCompiledResource(resources, 'color', 'ic_launcher_background')

  console.log(`Manifest do APK: android:icon=${iconResourceId} -> @mipmap/ic_launcher`)
  console.log(`Manifest do APK: android:roundIcon=${roundIconResourceId} -> @mipmap/ic_launcher_round`)
  console.log(`Tabela de recursos: ${iconResourceLine}`)
  console.log(`Tabela de recursos: ${roundIconResourceLine}`)
  console.log(`Adaptive icon compilado: @drawable/ic_launcher_foreground=${foregroundResourceId} + @color/ic_launcher_background`)

  const entries = new Set(unzipList(apkPath))
  const legacyChecked = verifyReferencedPngsIfVisible({
    apkPath,
    entries,
    resources,
    resourceId: iconResourceId,
    canonicalSignatures: canonicalLauncherSignatures('legacy'),
    label: 'Launcher principal'
  })
  const roundChecked = verifyReferencedPngsIfVisible({
    apkPath,
    entries,
    resources,
    resourceId: roundIconResourceId,
    canonicalSignatures: canonicalLauncherSignatures('round'),
    label: 'Launcher redondo'
  })

  const foregroundPaths = findResourcePaths(resources, foregroundResourceId)
  const foregroundPng = foregroundPaths.find(path => path.toLowerCase().endsWith('.png') && entries.has(path))
  if (foregroundPng) {
    const foreground = assertSamePixels(canonicalForeground, unzipEntry(apkPath, foregroundPng), foregroundPng)
    console.log(`Foreground adaptive conferido por pixels: ${foreground.width}x${foreground.height}.`)
  } else {
    console.log('Foreground adaptive: caminho físico encurtado/omitido pelo otimizador; recurso compilado confirmado em resources.arsc.')
  }

  const mode = legacyChecked || roundChecked || foregroundPng ? 'semântica + pixels disponíveis' : 'semântica pós-otimização'
  console.log(`APK confirmado com o launcher oficial do Eu Reciclo (${mode}): Manifest e resources.arsc apontam para os recursos oficiais.`)
}

const args = process.argv.slice(2)
const apkIndex = args.indexOf('--apk')
if (apkIndex >= 0) verifyApk(args[apkIndex + 1])
else verifyProject()
