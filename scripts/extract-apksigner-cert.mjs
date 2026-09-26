import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function extractApkCertificateSha256(report) {
  const matches = [...String(report).matchAll(/certificate SHA-256 digest:\s*([0-9a-fA-F]{64})\b/g)]
  const unique = [...new Set(matches.map(match => match[1].toLowerCase()))]

  if (unique.length === 0) {
    throw new Error('Nenhum SHA-256 de certificado foi encontrado na saída do apksigner.')
  }
  if (unique.length > 1) {
    throw new Error(`Mais de um certificado SHA-256 foi encontrado no APK: ${unique.join(', ')}`)
  }
  return unique[0]
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const reportPath = process.argv[2]
  if (!reportPath) {
    console.error('Uso: node scripts/extract-apksigner-cert.mjs <apksigner-report.txt>')
    process.exit(2)
  }

  try {
    const report = readFileSync(reportPath, 'utf8')
    process.stdout.write(`${extractApkCertificateSha256(report)}\n`)
  } catch (error) {
    console.error(`ERRO: ${error.message}`)
    process.exit(1)
  }
}
