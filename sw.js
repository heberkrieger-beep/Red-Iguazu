// Service worker mínimo para que Red Iguazú sea instalable como app.
// No cachea datos sensibles (el padrón y registros vienen siempre frescos de la base).
const CACHE = 'red-iguazu-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Nunca cachear llamadas a Supabase (datos siempre frescos)
  if (url.includes('supabase.co')) return;
  // Para lo demás: red primero, cache como respaldo (offline)
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
