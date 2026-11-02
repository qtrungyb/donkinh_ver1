// ============================================================================
// SERVICE WORKER - Chiến lược Hybrid (Network-first + Cache-first)
// ============================================================================
const CACHE_NAME = 'donkinh-v' + Date.now(); // Tự đổi mỗi lần deploy
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/don-kinh.html',
    '/css/style.css',
    '/js/main.js',
    '/js/config.js',
    '/js/store.js',
    '/js/utils.js',
    '/js/database.js',
    '/js/templates.js',
    '/chukyso.jpg',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// 1. INSTALL
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Đang cache phiên bản:', CACHE_NAME);
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Một vài asset không cache được (bỏ qua):', err);
            });
        })
    );
});

// 2. ACTIVATE — Xóa mọi cache không khớp CACHE_NAME hiện tại
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => {
                console.log('[SW] Xóa cache cũ:', n);
                return caches.delete(n);
            })
        ))
    );
});

// 3. FETCH — Hybrid strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    const url = new URL(event.request.url);
    const isCodeFile = /\.(html|js|css|json)$/.test(url.pathname) || url.pathname === '/';

    if (isCodeFile) {
        // Network-first cho code
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request).then(r => r || new Response('Offline', { status: 503 })))
        );
    } else {
        // Cache-first cho ảnh, fonts, icons
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
    }
});
