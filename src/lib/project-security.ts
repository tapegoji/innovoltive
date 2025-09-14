import { cookies } from 'next/headers'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Simple encryption-based approach for project tokens
 */
const ENCRYPTION_KEY = process.env.PROJECT_ENCRYPTION_KEY || 'your-32-char-secret-key-here!!'
const ALGORITHM = 'aes-256-cbc'

export function encryptProjectData(projectId: string, userId: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  
  const data = JSON.stringify({ projectId, userId, timestamp: Date.now() })
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

export function decryptProjectData(encryptedData: string): { projectId: string; userId: string } | null {
  try {
    const [ivHex, encrypted] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    const data = JSON.parse(decrypted)
    
    // Check if token is not too old (24 hours)
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      return null
    }
    
    return { projectId: data.projectId, userId: data.userId }
  } catch (error) {
    console.error('Failed to decrypt project data:', error)
    return null
  }
}

/**
 * Session-based approach using cookies
 */
export async function setProjectSession(projectId: string, userId: string) {
  const cookieStore = await cookies()
  const sessionData = { projectId, userId, timestamp: Date.now() }
  
  cookieStore.set('project-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

export async function getProjectSession(): Promise<{ projectId: string; userId: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('project-session')
    
    if (!sessionCookie) return null
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is not expired
    if (Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000) {
      return null
    }
    
    return { projectId: sessionData.projectId, userId: sessionData.userId }
  } catch (error) {
    console.error('Failed to get project session:', error)
    return null
  }
}