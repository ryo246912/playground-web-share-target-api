const CACHE_NAME = 'web-share-target-v1';
const urlsToCache = [
    '/playground-web-share-target-api/',
    '/playground-web-share-target-api/index.html',
    '/playground-web-share-target-api/styles.css',
    '/playground-web-share-target-api/app.js',
    '/playground-web-share-target-api/manifest.json',
    '/playground-web-share-target-api/icon-192.png',
    '/playground-web-share-target-api/icon-512.png'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: インストール中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: すべてのファイルをキャッシュしました');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: キャッシュ中にエラー:', error);
            })
    );
});

// Service Worker アクティベーション
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: アクティベーション中...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: 古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: アクティベーション完了');
            return self.clients.claim();
        })
    );
});

// リクエストの処理（キャッシュファーストストラテジー）
self.addEventListener('fetch', (event) => {
    // Share Target APIのリクエストを特別に処理
    const url = new URL(event.request.url);
    const hasShareParams = url.searchParams.has('title') || url.searchParams.has('url') || url.searchParams.has('text');
    
    if (hasShareParams && url.pathname.includes('playground-web-share-target-api')) {
        console.log('📥 Service Worker: Share Target リクエストを受信:', event.request.url);
        
        event.respondWith(
            handleShareTarget(event.request)
        );
        return;
    }
    
    // 通常のリクエストはキャッシュファーストで処理
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにある場合はそれを返す
                if (response) {
                    console.log('📦 Service Worker: キャッシュからレスポンス:', event.request.url);
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                console.log('🌐 Service Worker: ネットワークからフェッチ:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // レスポンスが有効な場合はキャッシュに保存
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker: フェッチエラー:', error);
                        
                        // オフラインページまたはデフォルトレスポンスを返す
                        if (event.request.destination === 'document') {
                            return caches.match('/playground-web-share-target-api/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Share Target APIの処理
async function handleShareTarget(request) {
    console.log('📤 Service Worker: Share Target処理開始:', request.url);
    
    try {
        // パラメータをそのまま維持して、通常のページ表示を行う
        const response = await caches.match('/playground-web-share-target-api/index.html');
        if (response) {
            console.log('✅ Service Worker: キャッシュからindex.htmlを返します');
            return response;
        }
        
        // キャッシュにない場合はネットワークから取得
        const networkResponse = await fetch('/playground-web-share-target-api/index.html');
        console.log('✅ Service Worker: ネットワークからindex.htmlを取得');
        return networkResponse;
        
    } catch (error) {
        console.error('❌ Service Worker: Share Target処理エラー:', error);
        
        // 最後の手段として、パラメータ付きでリダイレクト
        const url = new URL(request.url);
        const targetUrl = new URL('/playground-web-share-target-api/', self.location.origin);
        
        // パラメータをコピー
        for (const [key, value] of url.searchParams) {
            targetUrl.searchParams.set(key, value);
        }
        
        console.log('🔄 Service Worker: フォールバックリダイレクト:', targetUrl.toString());
        return Response.redirect(targetUrl.toString(), 302);
    }
}

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: バックグラウンド同期:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // バックグラウンド同期の処理をここに実装
            Promise.resolve()
        );
    }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
    console.log('📬 Service Worker: プッシュ通知を受信');
    
    const options = {
        body: event.data ? event.data.text() : 'デフォルトメッセージ',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'web-share-target',
        requireInteraction: true
    };
    
    event.waitUntil(
        self.registration.showNotification('Web Share Target', options)
    );
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Service Worker: 通知がクリックされました');
    
    event.notification.close();
    
    event.waitUntil(
        self.clients.openWindow('/playground-web-share-target-api/')
    );
});

// エラーハンドリング
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker: エラー:', event.error);
});

// 未処理のPromise拒否
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker: 未処理のPromise拒否:', event.reason);
    event.preventDefault();
});

console.log('🎯 Service Worker: スクリプトが読み込まれました');