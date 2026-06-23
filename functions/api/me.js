import { json, getUser } from './_utils.js'
export async function onRequestGet({ request, env }) {
  const u = await getUser(request, env)
  if (!u) return json({ error: 'Não autenticado.' }, 401)
  return json({ user: { email: u.email, tradicao: u.tradicao } })
}
