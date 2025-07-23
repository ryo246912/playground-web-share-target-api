/**
 * PWAインストール条件チェッカー
 * Chrome DevToolsのコンソールで実行してください
 */

class PWAInstallChecker {
    constructor() {
        this.issues = [];
        this.checkAll();
    }

    async checkAll() {
        console.log('🔍 PWAインストール条件をチェック中...');
        
        await this.checkHTTPS();
        await this.checkManifest();
        await this.checkServiceWorker();
        await this.checkIcons();
        await this.checkDisplayMode();
        await this.checkStartUrl();
        await this.checkUserEngagement();
        await this.checkInstallCriteria();
        
        this.showResults();
    }

    checkHTTPS() {
        console.log('🔒 HTTPS確認中...');
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.issues.push('❌ HTTPSが必要です。現在のプロトコル: ' + location.protocol);
        } else {
            console.log('✅ HTTPS OK');
        }
    }

    async checkManifest() {
        console.log('📄 manifest.json確認中...');
        try {
            const response = await fetch('./manifest.json');
            if (!response.ok) {
                this.issues.push('❌ manifest.jsonが読み込めません: ' + response.status);
                return;
            }
            
            const manifest = await response.json();
            
            // 必須フィールドチェック
            const required = ['name', 'start_url', 'display', 'icons'];
            const missing = required.filter(field => !manifest[field]);
            if (missing.length > 0) {
                this.issues.push('❌ manifest.jsonに必須フィールドがありません: ' + missing.join(', '));
            }
            
            // display モードチェック
            if (!['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
                this.issues.push('❌ manifest.display は standalone, fullscreen, minimal-ui のいずれかが必要');
            }
            
            console.log('✅ manifest.json OK');
            console.log('📋 manifest情報:', {
                name: manifest.name,
                display: manifest.display,
                start_url: manifest.start_url,
                icons: manifest.icons?.length + '個'
            });
            
        } catch (error) {
            this.issues.push('❌ manifest.json解析エラー: ' + error.message);
        }
    }

    async checkServiceWorker() {
        console.log('⚙️ Service Worker確認中...');
        if (!('serviceWorker' in navigator)) {
            this.issues.push('❌ このブラウザはService Workerをサポートしていません');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                this.issues.push('❌ Service Workerが登録されていません');
            } else {
                console.log('✅ Service Worker登録済み');
                console.log('🔧 Service Worker情報:', {
                    scope: registration.scope,
                    state: registration.active?.state
                });
            }
        } catch (error) {
            this.issues.push('❌ Service Worker確認エラー: ' + error.message);
        }
    }

    async checkIcons() {
        console.log('🖼️ アイコン確認中...');
        try {
            const response = await fetch('./manifest.json');
            const manifest = await response.json();
            
            if (!manifest.icons || manifest.icons.length === 0) {
                this.issues.push('❌ manifest.jsonにアイコンが定義されていません');
                return;
            }

            // 192x192以上のアイコンがあるかチェック
            const hasLargeIcon = manifest.icons.some(icon => {
                const sizes = icon.sizes.split('x');
                return parseInt(sizes[0]) >= 192 && parseInt(sizes[1]) >= 192;
            });
            
            if (!hasLargeIcon) {
                this.issues.push('❌ 192x192以上のアイコンが必要です');
            }

            // アイコンファイルの存在確認
            for (const icon of manifest.icons) {
                try {
                    const iconResponse = await fetch(icon.src);
                    if (!iconResponse.ok) {
                        this.issues.push(`❌ アイコンファイルが見つかりません: ${icon.src}`);
                    }
                } catch (error) {
                    this.issues.push(`❌ アイコンファイル確認エラー: ${icon.src}`);
                }
            }
            
            console.log('✅ アイコン OK');
            
        } catch (error) {
            this.issues.push('❌ アイコン確認エラー: ' + error.message);
        }
    }

    checkDisplayMode() {
        console.log('📱 表示モード確認中...');
        // すでにPWAとして実行されているかチェック
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('ℹ️ 既にPWAモードで実行中です');
        } else {
            console.log('📱 ブラウザモードで実行中');
        }
    }

    checkStartUrl() {
        console.log('🏠 start_url確認中...');
        // 現在のURLがstart_urlと一致するかチェック
        const currentPath = location.pathname;
        if (currentPath !== '/' && currentPath !== '/index.html') {
            this.issues.push('⚠️ start_urlと現在のURLが異なる可能性があります');
        }
    }

    checkUserEngagement() {
        console.log('👤 ユーザーエンゲージメント確認中...');
        // ページ訪問回数や滞在時間の推定
        const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
        localStorage.setItem('visitCount', visitCount.toString());
        
        if (visitCount < 2) {
            this.issues.push('⚠️ ユーザーエンゲージメントが不足している可能性があります（初回訪問）');
        }
        
        console.log(`📊 訪問回数: ${visitCount}回`);
    }

    async checkInstallCriteria() {
        console.log('📋 インストール基準確認中...');
        
        // beforeinstallpromptイベントの検出
        let installPromptFired = false;
        const timeout = new Promise(resolve => setTimeout(() => resolve(false), 2000));
        const promptPromise = new Promise(resolve => {
            window.addEventListener('beforeinstallprompt', () => {
                installPromptFired = true;
                resolve(true);
            });
        });
        
        const result = await Promise.race([promptPromise, timeout]);
        
        if (!result && !installPromptFired) {
            this.issues.push('❌ beforeinstallpromptイベントが発火していません');
        } else {
            console.log('✅ インストールプロンプト利用可能');
        }
    }

    showResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PWAインストール診断結果');
        console.log('='.repeat(60));
        
        if (this.issues.length === 0) {
            console.log('🎉 すべての条件をクリアしています！');
            console.log('💡 それでもインストールプロンプトが表示されない場合:');
            console.log('   1. ページを更新してみてください');
            console.log('   2. Chrome設定 > サイト設定 > 通知 を確認');
            console.log('   3. Chrome設定 > 詳細設定 > プライバシー > サイト設定');
            console.log('   4. 別のタブでページを開いてみてください');
        } else {
            console.log('⚠️ 以下の問題を修正してください:');
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        console.log('\n📋 追加の診断コマンド:');
        console.log('navigator.serviceWorker.getRegistrations() - Service Worker確認');
        console.log('window.addEventListener("beforeinstallprompt", e => console.log("インストール可能")) - イベント監視');
        console.log('='.repeat(60));
        
        // グローバル変数に結果を保存
        window.pwaInstallDiagnosis = {
            issues: this.issues,
            timestamp: new Date().toISOString()
        };
    }
}

// 自動実行
new PWAInstallChecker();