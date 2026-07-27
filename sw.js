// Red Iguazú — Service Worker v36
// Sube el número de versión en cada cambio de la app para que los celulares
// agarren la versión nueva y no queden con caché viejo.
const CACHE = 'red-iguazu-v36';

// Archivos del ecosistema que se guardan para que la app abra sin conexión.
const ARCHIVOS = [
  './',
  './index.html',
  './dashboard.html',
  './conductor.html',
  './pasajero.html',
  './buscame.html'
];

// Al instalar la versión nueva: guardar los archivos y activarse enseguida.
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // addAll falla si un archivo no existe; los agrego de a uno, tolerante.
      Promise.all(ARCHIVOS.map(a => c.add(a).catch(() => {})))
    )
  );
});

// Al activarse: borrar los cachés viejos (v33, v34...) y tomar control ya.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(claves =>
      Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia "red primero" para los HTML: siempre trae lo último si hay internet,
// y usa el caché solo cuando estás sin conexión. Así no volvés a quedar con datos viejos.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(resp => {
        // guardar copia fresca en caché
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia).catch(() => {}));
        return resp;
      })
      .catch(() => caches.match(req)) // sin internet: usar lo guardado
  );
});
