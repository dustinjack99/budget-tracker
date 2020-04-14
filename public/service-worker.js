const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Initializing Cache Installation
self.addEventListener("install", function (event) {
  event.waitUntil(
    // Opening and naming cache
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files pre-cached.");
      // Adding all files to cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Removal of Old Cache, replaces it with New Cache
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      // Promise.all takes an array of promises - won't resolve until all promises are done
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Old Cache Data Removed", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  // Let's new service worker take over after deletion of old data.
  self.clients.claim();
});

// Listening for offline fetch requests
self.addEventListener("fetch", function (event) {
  // Listens for call to an API
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((res) => {
              // If response succeeds, it is clonsed and stuffed into data cache.
              if (res.status === 200) {
                cache.put(event.request.url, res.clone());
              }

              return res;
            })
            .catch((err) => {
              // If network fails, retrieve data from its cache.
              return cache(match(event.request));
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
