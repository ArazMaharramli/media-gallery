import { execSync } from 'child_process'
import { existsSync, mkdirSync, chmodSync } from 'fs'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

const PRISMA_VERSION = 'c2990dca591cba766e3b7ef5d9e8a84796e47ab7'
const BASE_URL = `https://binaries.prisma.sh/all_commits/${PRISMA_VERSION}`

const PLATFORM = process.platform === 'darwin'
  ? process.arch === 'arm64' ? 'darwin-arm64' : 'darwin'
  : process.platform === 'linux'
  ? process.arch === 'arm64' ? 'linux-arm64-openssl-3.0.x' : 'debian-openssl-3.0.x'
  : 'windows'

const ENGINES_DIR = join(process.cwd(), 'node_modules', '@prisma', 'engines')

const binaries = [
  { name: 'schema-engine', ext: '' },
  { name: 'libquery_engine', ext: process.platform === 'darwin' ? '.dylib.node' : process.platform === 'win32' ? '.dll.node' : '.so.node' }
]

async function downloadFile(url, dest) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download: ${url}`)

  const tempDest = dest + '.gz'
  const fileStream = createWriteStream(tempDest)
  await pipeline(response.body, fileStream)

  // Decompress
  const { createReadStream } = await import('fs')
  const gunzip = createGunzip()
  const source = createReadStream(tempDest)
  const destStream = createWriteStream(dest)
  await pipeline(source, gunzip, destStream)

  // Cleanup and make executable
  const { unlinkSync } = await import('fs')
  unlinkSync(tempDest)
  chmodSync(dest, 0o755)
}

async function main() {
  console.log('Setting up Prisma binaries...')

  if (!existsSync(ENGINES_DIR)) {
    mkdirSync(ENGINES_DIR, { recursive: true })
  }

  for (const binary of binaries) {
    const filename = `${binary.name}-${PLATFORM}${binary.ext}`
    const destPath = join(ENGINES_DIR, filename)

    if (existsSync(destPath)) {
      console.log(`  ${filename} already exists, skipping`)
      continue
    }

    const url = `${BASE_URL}/${PLATFORM}/${binary.name}${binary.ext}.gz`
    console.log(`  Downloading ${filename}...`)

    try {
      await downloadFile(url, destPath)
      console.log(`  Downloaded ${filename}`)
    } catch (error) {
      console.error(`  Failed to download ${filename}: ${error.message}`)
      process.exit(1)
    }
  }

  console.log('Generating Prisma client...')
  execSync('npx prisma generate', { stdio: 'inherit' })

  console.log('Prisma setup complete!')
}

main().catch(console.error)
