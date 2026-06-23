export async function onRequestGet({ env }) {
  const out = { hasDB: !!env.DB }
  try {
    const r = await env.DB.prepare('SELECT count(*) AS c FROM users').first()
    out.usersTable = 'ok'; out.users = r.c
  } catch (e) { out.err = String(e && e.message ? e.message : e) }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } })
}
