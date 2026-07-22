// Service worker mínimo para Red Iguazú.
// La app (HTML) SIEMPRE se baja fresca de la red; solo guardamos íconos para que sea instalable.
const CACHE = 'red-iguazu-v33';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

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
  // Supabase: siempre red (datos frescos)
  if (url.includes('supabase.co')) return;
  // HTML / navegación / index: SIEMPRE red, nunca cache (para que nunca quede una versión vieja)
  if (e.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match('./icon-192.png')));
    return;
  }
  // Íconos y manifest: cache rápido
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
