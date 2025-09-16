import { promises as fs } from 'fs'
import crypto from 'crypto'
import path from 'path'
import 'server-only'

// Path mapping utilities
const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'path_mappings.json')

export async function hashPath(realPath: string): Promise<string> {
  const salt = process.env.PATH_HASH_SALT || 'default_salt'
  return crypto.createHash('sha256').update(realPath + salt).digest('hex')
}

export async function storePathMapping(hash: string, realPath: string): Promise<void> {
  try {
    let mappings: Record<string, string> = {}
    try {
      const data = await fs.readFile(MAPPINGS_FILE, 'utf-8')
      mappings = JSON.parse(data)
    } catch {
      // File doesn't exist or is empty, start with empty object
    }

    mappings[hash] = realPath
    await fs.writeFile(MAPPINGS_FILE, JSON.stringify(mappings, null, 2))
  } catch (error) {
    console.error('Error storing path mapping:', error)
    throw new Error('Failed to store path mapping')
  }
}

export async function getRealPath(hash: string): Promise<string | null> {
  try {
    const data = await fs.readFile(MAPPINGS_FILE, 'utf-8')
    const mappings = JSON.parse(data)
    return mappings[hash] || null
  } catch (error) {
    console.error('Error retrieving path mapping:', error)
    return null
  }
}

export async function removePathMapping(hash: string): Promise<void> {
  try {
    let mappings: Record<string, string> = {}
    try {
      const data = await fs.readFile(MAPPINGS_FILE, 'utf-8')
      mappings = JSON.parse(data)
    } catch {
      // File doesn't exist or is empty, nothing to remove
      return
    }

    delete mappings[hash]
    await fs.writeFile(MAPPINGS_FILE, JSON.stringify(mappings, null, 2))
  } catch (error) {
    console.error('Error removing path mapping:', error)
    throw new Error('Failed to remove path mapping')
  }
}