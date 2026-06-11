const CACHE_NAME = "finora-v1";
// IMPORTANTE: Añade aquí todos los archivos críticos de tu app
// Si usas React build, suelen ser '/', '/index.html', '/static/js/...', etc.
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  // Añade tus CSS y JS principales si los conoces, o deja solo '/' para empezar
];

// 1. Instalación: Guardar archivos en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Archivos guardados en caché");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => console.error("Error al cachear:", err)),
  );
  // Forzar al SW a activarse inmediatamente sin esperar
  self.skipWaiting();
});

// 2. Activación: Limpiar cachés viejas si es necesario
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  // Tomar control inmediato de las páginas abiertas
  self.clients.claim();
});

// 3. Fetch: Servir desde caché o red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Si está en caché, lo devuelve. Si no, va a la red.
        return response || fetch(event.request);
      })
      .catch(() => {
        // Opcional: Devolver una página offline genérica si falla todo
        // return caches.match('/offline.html');
      }),
  );
});
