import { json, hashPassword, newToken, tradOk } from './_utils.js'
const DAYS30 = 30 * 24 * 60 * 60 * 1000
export async function onRequestPost({ request, env }) {
  try {
    const { email, password, tradicao } = await request.json()
    const e = (email || '').trim().toLowerCase()
    if (!e || !password || password.length < 6) return json({ error: 'E-mail e senha (mín. 6 caracteres) são obrigatórios.' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return json({ error: 'Digite um e-mail válido.' }, 400)
    if (!tradOk(tradicao)) return json({ error: 'Escolha uma tradição válida.' }, 400)
    if (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(e).first()) return json({ error: 'E-mail já cadastrado.' }, 409)
    const now = Date.now()
    const ins = await env.DB.prepare('INSERT INTO users (email, pass_hash, tradicao, created_at) VALUES (?,?,?,?)')
      .bind(e, await hashPassword(password), tradicao, now).run()
    const token = newToken()
    await env.DB.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?,?,?)').bind(token, ins.meta.last_row_id, now + DAYS30).run()
    return json({ token, user: { email: e, tradicao } })
  } catch { return json({ error: 'Falha no cadastro.' }, 500) }
}
