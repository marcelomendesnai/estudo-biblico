import { json, getUser, tradOk } from './_utils.js'
export async function onRequestPost({ request, env }) {
  const u = await getUser(request, env)
  if (!u) return json({ error: 'Não autenticado.' }, 401)
  const { tradicao } = await request.json()
  if (!tradOk(tradicao)) return json({ error: 'Tradição inválida.' }, 400)
  await env.DB.prepare('UPDATE users SET tradicao = ? WHERE id = ?').bind(tradicao, u.id).run()
  return json({ ok: true, tradicao })
}
