// Helpers das Functions (auth, hash de senha, sessões em D1)
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
const enc = new TextEncoder()
const buf2hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const hex2buf = (hex) => { const a = new Uint8Array(hex.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16); return a }
export async function hashPassword(password, saltHex) {
  const salt = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  return buf2hex(salt) + ':' + buf2hex(bits)
}
export async function verifyPassword(password, stored) {
  const [saltHex] = (stored || '').split(':')
  if (!saltHex) return false
  return (await hashPassword(password, saltHex)) === stored
}
export const newToken = () => buf2hex(crypto.getRandomValues(new Uint8Array(32)))
export async function getUser(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const row = await env.DB.prepare(
    'SELECT u.id, u.email, u.tradicao, s.expires FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?'
  ).bind(token).first()
  if (!row) return null
  if (row.expires < Date.now()) { await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run(); return null }
  return { id: row.id, email: row.email, tradicao: row.tradicao }
}
const TRADS = ['catolica','evangelica','ambos']
export const tradOk = (t) => TRADS.includes(t)
