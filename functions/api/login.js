import { json, verifyPassword, newToken } from './_utils.js'
const DAYS30 = 30 * 24 * 60 * 60 * 1000
export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json()
    const e = (email || '').trim().toLowerCase()
    const u = await env.DB.prepare('SELECT id, pass_hash, tradicao FROM users WHERE email = ?').bind(e).first()
    if (!u || !(await verifyPassword(password, u.pass_hash))) return json({ error: 'E-mail ou senha inválidos.' }, 401)
    const token = newToken()
    await env.DB.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?,?,?)').bind(token, u.id, Date.now() + DAYS30).run()
    return json({ token, user: { email: e, tradicao: u.tradicao } })
  } catch { return json({ error: 'Falha no login.' }, 500) }
}
