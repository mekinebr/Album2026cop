const CACHE = 'album-figurinhas-v1';
const ARQUIVOS = ['./','./index.html','./style.css','./app.js','./manifest.json','./icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
