import type { AuthRecord, Session } from '../types'

const AUTH_KEY = 'zestwell.auth'
const SESSION_KEY = 'zestwell.session'

function bytesToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(digest)
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256(`zestwell:v1:${salt}:${pin}`)
}

export function loadAuth(): AuthRecord | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthRecord
    if (!parsed.username || !parsed.salt || !parsed.pinHash) return null
    return parsed
  } catch {
    return null
  }
}

export function saveAuth(record: AuthRecord): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(record))
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed.username) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function createAccount(username: string, pin: string): Promise<AuthRecord> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const pinHash = await hashPin(pin, salt)
  const record: AuthRecord = {
    username: username.trim(),
    salt,
    pinHash,
    createdAt: new Date().toISOString(),
  }
  saveAuth(record)
  saveSession({ username: record.username, loggedInAt: new Date().toISOString() })
  return record
}

export async function verifyPin(pin: string): Promise<boolean> {
  const auth = loadAuth()
  if (!auth) return false
  const hash = await hashPin(pin, auth.salt)
  if (hash !== auth.pinHash) return false
  saveSession({ username: auth.username, loggedInAt: new Date().toISOString() })
  return true
}

export function signOut(): void {
  clearSession()
}
