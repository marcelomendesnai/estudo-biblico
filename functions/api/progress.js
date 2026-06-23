import { json, getUser } from './_utils.js'
async function ensure(env){ await env.DB.prepare('CREATE TABLE IF NOT EXISTS progress (user_id INTEGER NOT NULL, study_id TEXT NOT NULL, done_at INTEGER NOT NULL, PRIMARY KEY(user_id, study_id))').run() }
export async function onRequestGet({ request, env }) {
  const u = await getUser(request, env); if (!u) return json({ error: 'Não autenticado.' }, 401)
  await ensure(env)
  const r = await env.DB.prepare('SELECT study_id, done_at FROM progress WHERE user_id = ?').bind(u.id).all()
  const done = {}; (r.results||[]).forEach(x => done[x.study_id] = x.done_at)
  return json({ done })
}
export async function onRequestPost({ request, env }) {
  const u = await getUser(request, env); if (!u) return json({ error: 'Não autenticado.' }, 401)
  await ensure(env)
  const { id, done } = await request.json()
  if (done === false) { await env.DB.prepare('DELETE FROM progress WHERE user_id=? AND study_id=?').bind(u.id, id).run(); return json({ ok: true, removed: true }) }
  const now = Date.now()
  await env.DB.prepare('INSERT OR REPLACE INTO progress (user_id, study_id, done_at) VALUES (?,?,?)').bind(u.id, id, now).run()
  return json({ ok: true, done_at: now })
}
