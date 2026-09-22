// PWA Service Worker for AI Resume & Portfolio Builder
const CACHE_NAME = 'resume-builder-v2';
const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/manifest.json',
    '/static/icons/icon-192.png',
    '/static/icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 1. 서비스 워커 설치 시 정적 자원 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. 서비스 워커 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. 네트워크 요청 가로채기 (Network First with Cache Fallback)
// AI 생성 API(/generate)는 캐시하지 않고 항상 네트워크로 통신
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API 요청은 캐싱 제외하고 항상 네트워크로 전송
    if (url.pathname === '/generate' || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 정상 응답이면 캐시 업데이트 후 반환
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 오프라인이거나 네트워크 실패 시 캐시 반환
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});
