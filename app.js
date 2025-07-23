class WebShareTargetApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Web Share Target App の初期化を開始');
        
        this.checkSupport();
        this.setupEventListeners();
        this.handleSharedData();
        this.loadHistory();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        
        console.log('✅ Web Share Target App の初期化完了');
    }

    checkSupport() {
        const pwaSupport = 'serviceWorker' in navigator && 'PushManager' in window;
        const shareTargetSupport = 'share' in navigator;
        
        document.getElementById('pwa-support').textContent = pwaSupport ? '✅ サポート' : '❌ 非サポート';
        document.getElementById('pwa-support').className = pwaSupport ? 'status-value success' : 'status-value error';
        
        document.getElementById('share-target-support').textContent = shareTargetSupport ? '✅ サポート' : '❌ 非サポート';
        document.getElementById('share-target-support').className = shareTargetSupport ? 'status-value success' : 'status-value error';
        
        console.log('📊 ブラウザサポート状況:', { pwaSupport, shareTargetSupport });
    }

    setupEventListeners() {
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('test-share-btn').addEventListener('click', () => {
            this.handleTestShare();
        });
        
        document.getElementById('install-btn').addEventListener('click', () => {
            this.installApp();
        });
    }

    handleSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedUrl = urlParams.get('url');
        const sharedTitle = urlParams.get('title');
        const sharedText = urlParams.get('text');
        
        if (sharedUrl || sharedTitle || sharedText) {
            console.log('📥 共有データを受信:', { sharedUrl, sharedTitle, sharedText });
            
            const sharedData = {
                url: sharedUrl || '',
                title: sharedTitle || '',
                text: sharedText || '',
                timestamp: new Date(),
                platform: this.identifyPlatform(sharedUrl || ''),
                id: this.generateId()
            };
            
            this.displaySharedData(sharedData);
            this.saveToHistory(sharedData);
            
            // URLパラメータをクリーンアップ
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            console.log('ℹ️ 共有データなし - 通常のアクセス');
        }
    }

    identifyPlatform(url) {
        if (!url) return 'other';
        
        const domain = url.toLowerCase();
        
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return 'youtube';
        } else if (domain.includes('twitter.com')) {
            return 'twitter';
        } else if (domain.includes('x.com')) {
            return 'x';
        } else if (domain.includes('tiktok.com')) {
            return 'tiktok';
        } else {
            return 'other';
        }
    }

    displaySharedData(data) {
        const container = document.getElementById('shared-data-display');
        
        const sharedItem = document.createElement('div');
        sharedItem.className = 'shared-item';
        
        const platformBadge = `<span class="platform-badge platform-${data.platform}">${this.getPlatformName(data.platform)}</span>`;
        
        sharedItem.innerHTML = `
            <h3>${data.title || 'タイトルなし'}</h3>
            ${data.url ? `<a href="${data.url}" target="_blank" rel="noopener" class="url">${data.url}</a>` : ''}
            ${data.text ? `<p>${data.text}</p>` : ''}
            <div class="meta">
                <span>${platformBadge}</span>
                <span>📅 ${data.timestamp.toLocaleString('ja-JP')}</span>
            </div>
        `;
        
        container.innerHTML = '';
        container.appendChild(sharedItem);
        
        console.log('✅ 共有データを表示しました');
    }

    getPlatformName(platform) {
        const platformNames = {
            youtube: 'YouTube',
            twitter: 'Twitter',
            x: 'X',
            tiktok: 'TikTok',
            other: 'その他'
        };
        return platformNames[platform] || 'その他';
    }

    saveToHistory(data) {
        const history = this.getHistory();
        history.unshift(data);
        
        // 履歴は最大50件まで保持
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('shareHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
        
        console.log('💾 履歴に保存しました:', data);
    }

    getHistory() {
        try {
            const history = localStorage.getItem('shareHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('❌ 履歴の読み込みに失敗:', error);
            return [];
        }
    }

    loadHistory() {
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const history = this.getHistory();
        const container = document.getElementById('history-list');
        
        if (history.length === 0) {
            container.innerHTML = '<p class="placeholder">まだ履歴がありません</p>';
            return;
        }
        
        container.innerHTML = history.map(item => {
            const platformBadge = `<span class="platform-badge platform-${item.platform}">${this.getPlatformName(item.platform)}</span>`;
            const timestamp = new Date(item.timestamp);
            
            return `
                <div class="shared-item">
                    <h3>${item.title || 'タイトルなし'}</h3>
                    ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="url">${item.url}</a>` : ''}
                    ${item.text ? `<p>${item.text}</p>` : ''}
                    <div class="meta">
                        <span>${platformBadge}</span>
                        <span>📅 ${timestamp.toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        if (confirm('履歴をすべて削除しますか？')) {
            localStorage.removeItem('shareHistory');
            this.updateHistoryDisplay();
            console.log('🗑️ 履歴をクリアしました');
        }
    }

    handleTestShare() {
        const testUrl = document.getElementById('test-url').value;
        const testTitle = document.getElementById('test-title').value;
        
        if (!testUrl) {
            alert('テスト用URLを入力してください');
            return;
        }
        
        const testData = {
            url: testUrl,
            title: testTitle || 'テスト共有',
            text: 'テスト機能からの共有',
            timestamp: new Date(),
            platform: this.identifyPlatform(testUrl),
            id: this.generateId()
        };
        
        this.displaySharedData(testData);
        this.saveToHistory(testData);
        
        // フォームをクリア
        document.getElementById('test-url').value = '';
        document.getElementById('test-title').value = '';
        
        console.log('🧪 テスト共有を実行しました:', testData);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('✅ Service Worker登録成功:', registration.scope);
                
                document.getElementById('install-status').textContent = '✅ Service Worker登録済み';
                document.getElementById('install-status').className = 'status-value success';
            } catch (error) {
                console.error('❌ Service Worker登録失敗:', error);
                
                document.getElementById('install-status').textContent = '❌ Service Worker未登録';
                document.getElementById('install-status').className = 'status-value error';
            }
        } else {
            console.log('⚠️ Service Workerがサポートされていません');
            
            document.getElementById('install-status').textContent = '❌ 非サポート';
            document.getElementById('install-status').className = 'status-value error';
        }
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        // ユーザーエンゲージメントを追跡
        this.trackUserEngagement();
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('install-prompt').style.display = 'block';
            console.log('📱 PWAインストールプロンプトが表示可能です');
            
            // エンゲージメント条件をチェック
            this.checkEngagementConditions();
        });
        
        document.getElementById('install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`📱 PWAインストール結果: ${outcome}`);
                deferredPrompt = null;
                document.getElementById('install-prompt').style.display = 'none';
            } else {
                // 手動インストール指示を表示
                this.showManualInstallInstructions();
            }
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWAがインストールされました');
            document.getElementById('install-prompt').style.display = 'none';
            document.getElementById('install-status').textContent = '✅ インストール済み';
            document.getElementById('install-status').className = 'status-value success';
        });
        
        // 定期的にインストール条件をチェック
        setTimeout(() => this.forceInstallCheck(), 10000); // 10秒後
        setTimeout(() => this.forceInstallCheck(), 30000); // 30秒後
    }

    trackUserEngagement() {
        let interactionCount = parseInt(localStorage.getItem('userInteractions') || '0');
        const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
        
        localStorage.setItem('pageViews', pageViews.toString());
        localStorage.setItem('lastVisit', new Date().toISOString());
        
        // ユーザーインタラクションを記録
        ['click', 'scroll', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                localStorage.setItem('userInteractions', interactionCount.toString());
            }, { once: false, passive: true });
        });
        
        console.log(`📊 ページビュー: ${pageViews}, インタラクション: ${interactionCount}`);
    }

    checkEngagementConditions() {
        const pageViews = parseInt(localStorage.getItem('pageViews') || '0');
        const interactions = parseInt(localStorage.getItem('userInteractions') || '0');
        
        if (pageViews >= 2 || interactions >= 5) {
            console.log('✅ エンゲージメント条件を満たしています');
            return true;
        }
        
        console.log('⚠️ エンゲージメント条件が不足しています');
        return false;
    }

    forceInstallCheck() {
        console.log('🔍 強制的にインストール条件をチェック中...');
        
        const engagement = this.checkEngagementConditions();
        const hasServiceWorker = 'serviceWorker' in navigator;
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
        
        if (engagement && hasServiceWorker && isSecure) {
            console.log('💡 インストール条件を満たしていますが、beforeinstallpromptが発火していません');
            this.showAlternativeInstallPrompt();
        }
    }

    showAlternativeInstallPrompt() {
        const installSection = document.getElementById('install-prompt');
        if (installSection.style.display === 'block') return; // 既に表示中
        
        installSection.innerHTML = `
            <h2>📱 アプリをインストール</h2>
            <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 16px; border-radius: 8px; margin: 12px 0;">
                <p><strong>✅ このサイトをアプリとしてインストールできます！</strong></p>
                <p>ホーム画面に追加して、より便利にご利用ください。</p>
                <button id="manual-install-btn" class="btn btn-primary" style="margin: 8px 4px;">
                    📱 インストール方法を見る
                </button>
                <button id="close-prompt-btn" class="btn btn-secondary" style="margin: 8px 4px;">
                    後で
                </button>
            </div>
        `;
        
        installSection.style.display = 'block';
        
        document.getElementById('manual-install-btn').addEventListener('click', () => {
            this.showManualInstallInstructions();
        });
        
        document.getElementById('close-prompt-btn').addEventListener('click', () => {
            installSection.style.display = 'none';
        });
    }

    showManualInstallInstructions() {
        const instructions = `📱 PWAインストール方法:

🤖 Android Chrome:
1. 画面右上のメニュー (⋮) をタップ
2. "アプリをインストール" または "ホーム画面に追加" を選択
3. 確認ダイアログで "インストール" をタップ

🍎 iPhone Safari:
1. 画面下部の共有ボタン (□↗) をタップ
2. "ホーム画面に追加" を選択
3. "追加" をタップ

💻 デスクトップ Chrome:
1. アドレスバー右側のインストールアイコンをクリック
2. または設定メニュー > "アプリをインストール"

💡 ヒント: アプリをインストールすると、ホーム画面から素早くアクセスでき、共有機能も利用できるようになります！`;

        alert(instructions);
        console.log(instructions);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new WebShareTargetApp();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('❌ JavaScriptエラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ 未処理のPromise拒否:', event.reason);
});