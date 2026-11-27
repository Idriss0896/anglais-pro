// Incrémente ce nom à chaque évolution majeure pour éviter de servir un
// ancien bundle CSS/JS aux utilisateurs déjà installés.
const CACHE_VERSION = "anglo-club-v6";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./favicon.svg",
  "./route-preload.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./fonts/material-symbols-rounded.woff2",
  "./fonts/inter-latin.woff2",
  "./fonts/manrope-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Navigation : le réseau d'abord pour toujours servir la dernière version de
 * l'application. Le cache ne sert que de secours hors ligne.
 */
async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put("./index.html", response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return (
      (await cache.match("./index.html")) ||
      (await cache.match("./")) ||
      new Response("ANGLO CLUB est indisponible hors ligne.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

/**
 * Fichier généré à chaque build (liste des chunks à précharger) : le réseau
 * d'abord pour rester aligné sur l'index HTML courant. Sans cela, un ancien
 * `route-preload.js` en cache demanderait des assets qui n'existent plus.
 */
async function networkFirstFile(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      new Response("", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

/** Assets versionnés (hash dans le nom) : immuables, donc cache d'abord. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

/** Polices, icônes, images : le cache répond vite puis se met à jour. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Les API ne doivent JAMAIS être servies depuis le cache : une session,
  // une progression ou un profil périmé serait un vrai problème de données.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Généré à chaque build : doit correspondre à l'index servi juste avant.
  if (url.pathname.endsWith("/route-preload.js")) {
    event.respondWith(networkFirstFile(request));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
