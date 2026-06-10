const CACHE='album-copa2026-v5';

self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE).then(cache => {
return cache.addAll([
'./',
'./index.html',
'./style.css',
'./app.js',
'./manifest.json'
]);
})
);

self.skipWaiting();
});

self.addEventListener('activate', event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys.map(key => {
if (key !== CACHE) {
return caches.delete(key);
}
})
)
)
);

self.clients.claim();
});

self.addEventListener('fetch', event => {
event.respondWith(
fetch(event.request)
.then(response => {
const copy = response.clone();

```
    caches.open(CACHE).then(cache => {
      cache.put(event.request, copy);
    });

    return response;
  })
  .catch(() => caches.match(event.request))
```

);
});
