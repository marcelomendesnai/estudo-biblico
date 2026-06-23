/* Service Worker — cache do app shell para funcionar offline */
const CACHE='estudo-biblico-v3';
const ASSETS=['./','index.html','estudos.js','manifest.json','icon-192.png','icon-512.png','icon-180.png','trilha.mp3'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
    const cp=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return resp;
  }).catch(()=>caches.match('index.html'))));
});
