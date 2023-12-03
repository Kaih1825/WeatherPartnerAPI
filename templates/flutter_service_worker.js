'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "503a086a76d24e38797c23a49c55b7a5",
"assets/AssetManifest.bin.json": "87a0052086b9b70805bd2b82c625a756",
"assets/AssetManifest.json": "3ee0b80d0fbbdc452d83bc417aa49507",
"assets/assets/00001.png": "ddfe0c7178e5ea0bf12c885792744121",
"assets/assets/00008.png": "ac129b4905254f93260dfd8b9295f65b",
"assets/assets/00023.jpg": "61613e34bcc157a5e3ec73728263baef",
"assets/assets/day_light.png": "aee424d97de0896748408abc0c6b4c45",
"assets/assets/day_night.png": "39c418d432a964f8c2eac111fec71591",
"assets/assets/logo.png": "f4b2c7f3ab5593c2ed3b20e04d7dd350",
"assets/assets/logo_rm.png": "d168a64562a773b0fa0d9ee6e6c273d6",
"assets/assets/logo_round.png": "0dcc0fbd138fa3012085aab05e4f999b",
"assets/assets/roc_cwa.png": "e9a2c0c62eacd7ceb2ae4c666c91440d",
"assets/assets/roc_cwa.svg": "33001b27e5f2549f19765fa9cc2af002",
"assets/assets/WeatherDescriptions.json": "2dda3bbe019e9f102bf146bacb3491bf",
"assets/FontManifest.json": "7c9b73b967957434d9db5d975c290b1c",
"assets/fonts/MaterialIcons-Regular.otf": "00abc36ad8d862af656b278af991b2eb",
"assets/NOTICES": "572bfc6680a2fc376ef7cc3ac875ae1b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/packages/material_symbols_icons/lib/fonts/MaterialSymbolsOutlined%255BFILL,GRAD,opsz,wght%255D.ttf": "1a58f36d5ca6ddbad6d1132d04ca4b2f",
"assets/packages/material_symbols_icons/lib/fonts/MaterialSymbolsRounded%255BFILL,GRAD,opsz,wght%255D.ttf": "4cfc24daa42633b56477bc561d09a510",
"assets/packages/material_symbols_icons/lib/fonts/MaterialSymbolsSharp%255BFILL,GRAD,opsz,wght%255D.ttf": "b04fe9737cef2b6eb89ecb5e1fb40518",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "64edb91684bdb3b879812ba2e48dd487",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "f87e541501c96012c252942b6b75d1ea",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "4124c42a73efa7eb886d3400a1ed7a06",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "1e0ec28f6a76fb77b521e1592b19e609",
"flutter.js": "59a12ab9d00ae8f8096fffc417b6e84f",
"icons/Icon-192.png": "5da23897b4397bddfb0f97dbb0d01355",
"icons/Icon-512.png": "10a731d31734ed86e79de1379a47b0c7",
"icons/Icon-maskable-192.png": "5da23897b4397bddfb0f97dbb0d01355",
"icons/Icon-maskable-512.png": "10a731d31734ed86e79de1379a47b0c7",
"index.html": "ba8a848146f8dd948910402c2f5c00a8",
"/": "ba8a848146f8dd948910402c2f5c00a8",
"main.dart.js": "90d2f36921af4ef83f8d13acfa180262",
"manifest.json": "45a2d99385ec20931d5ae5b92e06e44b",
"version.json": "acccf187c0aed99d2b0ab6a2c83f8116"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
