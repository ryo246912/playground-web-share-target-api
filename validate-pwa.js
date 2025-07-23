/**
 * PWA検証スクリプト
 * GitHub Pages配信後にブラウザのコンソールで実行して動作確認
 */

class PWAValidator {
    constructor() {
        this.results = {};
        this.init();
    }

    async init() {
        console.log('🚀 PWA検証を開始します...');
        
        await this.checkServiceWorker();
        await this.checkManifest();
        await this.checkHTTPS();
        await this.checkInstallability();
        await this.checkShareTarget();
        
        this.showResults();
    }

    async checkServiceWorker() {
        console.log('🔍 Service Worker をチェック中...');
        
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    this.results.serviceWorker = {
                        status: '✅ 登録済み',
                        scope: registration.scope,
                        updatefound: registration.updatefound
                    };
                } else {
                    this.results.serviceWorker = {
                        status: '⚠️ 未登録',
                        message: 'Service Workerが登録されていません'
                    };
                }
            } catch (error) {
                this.results.serviceWorker = {
                    status: '❌ エラー',
                    error: error.message
                };
            }
        } else {
            this.results.serviceWorker = {
                status: '❌ 非サポート',
                message: 'このブラウザはService Workerをサポートしていません'
            };
        }
    }

    async checkManifest() {
        console.log('🔍 Manifest をチェック中...');
        
        try {
            const response = await fetch('./manifest.json');
            if (response.ok) {
                const manifest = await response.json();
                
                const requiredFields = ['name', 'start_url', 'display', 'icons', 'share_target'];
                const missingFields = requiredFields.filter(field => !manifest[field]);
                
                if (missingFields.length === 0) {
                    this.results.manifest = {
                        status: '✅ 有効',
                        name: manifest.name,
                        shareTarget: manifest.share_target ? '✅ 設定済み' : '❌ 未設定'
                    };
                } else {
                    this.results.manifest = {
                        status: '⚠️ 不完全',
                        missingFields: missingFields
                    };
                }
            } else {
                this.results.manifest = {
                    status: '❌ 取得失敗',
                    statusCode: response.status
                };
            }
        } catch (error) {
            this.results.manifest = {
                status: '❌ エラー',
                error: error.message
            };
        }
    }

    checkHTTPS() {
        console.log('🔍 HTTPS をチェック中...');
        
        if (location.protocol === 'https:') {
            this.results.https = {
                status: '✅ HTTPS',
                protocol: location.protocol
            };
        } else {
            this.results.https = {
                status: '❌ HTTP',
                protocol: location.protocol,
                message: 'PWAにはHTTPS接続が必要です'
            };
        }
    }

    async checkInstallability() {
        console.log('🔍 インストール可能性をチェック中...');
        
        // beforeinstallpromptイベントをリッスン
        let installPromptEvent = null;
        
        const checkInstallPrompt = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 1000);
            
            window.addEventListener('beforeinstallprompt', (e) => {
                clearTimeout(timeout);
                installPromptEvent = e;
                resolve(true);
            });
        });
        
        const hasInstallPrompt = await checkInstallPrompt;
        
        if (hasInstallPrompt) {
            this.results.installability = {
                status: '✅ インストール可能',
                message: 'PWAとしてインストールできます'
            };
        } else {
            // すでにインストール済みかチェック
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
                this.results.installability = {
                    status: '✅ インストール済み',
                    message: 'PWAとして実行中です'
                };
            } else {
                this.results.installability = {
                    status: '⚠️ インストール不可',
                    message: 'インストール条件を満たしていない可能性があります'
                };
            }
        }
    }

    checkShareTarget() {
        console.log('🔍 Share Target API をチェック中...');
        
        // URLパラメータをチェック
        const urlParams = new URLSearchParams(window.location.search);
        const hasSharedData = urlParams.has('url') || urlParams.has('title') || urlParams.has('text');
        
        if (hasSharedData) {
            this.results.shareTarget = {
                status: '✅ 動作中',
                receivedData: {
                    url: urlParams.get('url') || 'なし',
                    title: urlParams.get('title') || 'なし',
                    text: urlParams.get('text') || 'なし'
                }
            };
        } else {
            this.results.shareTarget = {
                status: '⚠️ 未テスト',
                message: '他のアプリから共有してテストしてください'
            };
        }
    }

    showResults() {
        console.log('\n📊 PWA検証結果:');
        console.log('='.repeat(50));
        
        Object.entries(this.results).forEach(([category, result]) => {
            console.log(`\n${category.toUpperCase()}:`);
            console.log(`Status: ${result.status}`);
            
            Object.entries(result).forEach(([key, value]) => {
                if (key !== 'status') {
                    console.log(`${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`);
                }
            });
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('検証完了！');
        
        // 結果をグローバル変数に保存
        window.pwaValidationResults = this.results;
    }
}

// ページ読み込み完了後に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PWAValidator();
    });
} else {
    new PWAValidator();
}