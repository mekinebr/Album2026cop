const CACHE = 'album-copa2026-whatsapp-bandeiras-pan1';
const ASSETS = ['./','./index.html','./style.css','./app.js','./firebase.js','./firebase-trades.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE ? caches.delete(key) : null))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') || url.hostname.includes('google') || url.hostname.includes('gstatic') || url.hostname.includes('googleapis')) { event.respondWith(fetch(event.request)); return; }
  if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});return response;}).catch(()=>caches.match('./index.html'))); return; }
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});return response;}).catch(()=>caches.match(event.request)));
});
