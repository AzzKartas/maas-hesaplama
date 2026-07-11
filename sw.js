// Basit önbellekleme service worker'ı — ana sayfaları offline erişilebilir yapar
const CACHE_ADI = 'hesap-cache-v1';
const ONBELLEK_DOSYALARI = [
  '/index.html',
  '/kredi-hesaplama.html',
  '/kidem-hesaplama.html',
  '/sss.html',
  '/rehber.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ADI).then((cache) => {
      return cache.addAll(ONBELLEK_DOSYALARI).catch(() => {
        // Bazı dosyalar yüklenemese bile kurulum devam etsin
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((isimler) => {
      return Promise.all(
        isimler.filter((isim) => isim !== CACHE_ADI).map((isim) => caches.delete(isim))
      );
    })
  );
  self.clients.claim();
});

// Network-first strateji: önce internetten dene, olmazsa önbellekten ver
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((yanit) => {
        const kopya = yanit.clone();
        caches.open(CACHE_ADI).then((cache) => cache.put(event.request, kopya));
        return yanit;
      })
      .catch(() => caches.match(event.request))
  );
});
