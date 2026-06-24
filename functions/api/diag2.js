import { json, getUser } from './_utils.js'
export async function onRequestGet({ request, env }) {
  const u = await getUser(request, env)
  let prog=[], users=[]
  try { const r = await env.DB.prepare('SELECT user_id, study_id FROM progress').all(); prog = r.results||[] } catch(e){}
  try { const r = await env.DB.prepare('SELECT id, email FROM users ORDER BY id DESC LIMIT 6').all(); users = r.results||[] } catch(e){}
  return json({ meId: u ? u.id : null, meEmail: u?u.email:null, progressRows: prog, recentUsers: users })
}
