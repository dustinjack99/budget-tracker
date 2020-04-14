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

//Initializing Cache Installation
self.addEventListener("install", function (event) {
  event.waitUntil(
    //Opening and naming cache
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files pre-cached.");
      //Adding all files to cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

//Removal of Old Cache, replaces it with New Cache
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      //Promise.all takes an array of promises - won't resolve until all promises are done
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

  self.clients.claim();
});
