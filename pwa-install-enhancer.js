/**
 * PWAインストール条件を強化するスクリプト
 * ユーザーエンゲージメントを向上させ、beforeinstallpromptイベントを促進
 */

class PWAInstallEnhancer {
    constructor() {
        this.installPromptDeferred = null;
        this.userInteractionCount = 0;
        this.pageViewCount = this.getPageViewCount() + 1;
        this.init();
    }

    init() {
        console.log('🚀 PWAインストール条件を強化中...');
        
        // ページビュー数を記録
        this.recordPageView();
        
        // ユーザーインタラクションを追跡
        this.trackUserEngagement();
        
        // PWAインストールプロンプトの処理を強化
        this.enhanceInstallPrompt();
        
        // 手動インストールボタンを追加
        this.addManualInstallOption();
        
        // インストール条件チェックを定期実行
        this.scheduleInstallCheck();
        
        console.log(`📊 現在のページビュー数: ${this.pageViewCount}`);
    }

    recordPageView() {
        localStorage.setItem('pwaPageViews', this.pageViewCount.toString());
        localStorage.setItem('lastVisit', new Date().toISOString());
        
        // 訪問履歴を記録（最大10件）
        const visitHistory = this.getVisitHistory();
        visitHistory.push({
            timestamp: new Date().toISOString(),
            url: location.href,
            userAgent: navigator.userAgent.substring(0, 50)
        });
        
        if (visitHistory.length > 10) {
            visitHistory.shift();
        }
        
        localStorage.setItem('pwaVisitHistory', JSON.stringify(visitHistory));
    }

    getPageViewCount() {
        return parseInt(localStorage.getItem('pwaPageViews') || '0');
    }

    getVisitHistory() {
        try {
            return JSON.parse(localStorage.getItem('pwaVisitHistory') || '[]');
        } catch {
            return [];
        }
    }

    trackUserEngagement() {
        // クリック、スクロール、キー入力などを追跡
        const events = ['click', 'scroll', 'keydown', 'touchstart'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.userInteractionCount++;
                
                // 一定のインタラクション後にインストールチェック
                if (this.userInteractionCount === 5 || this.userInteractionCount === 15) {
                    setTimeout(() => this.checkInstallConditions(), 1000);
                }
                
                // インタラクション数を保存
                localStorage.setItem('userInteractions', this.userInteractionCount.toString());
            }, { once: false, passive: true });
        });

        // ページ滞在時間を追跡
        this.trackTimeOnPage();
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        
        // 30秒後にエンゲージメント向上を記録
        setTimeout(() => {
            const timeSpent = Date.now() - startTime;
            localStorage.setItem('timeOnPage', timeSpent.toString());
            console.log(`⏱️ ページ滞在時間: ${Math.round(timeSpent / 1000)}秒`);
            
            // 30秒以上滞在した場合、インストール条件をチェック
            if (timeSpent >= 30000) {
                this.checkInstallConditions();
            }
        }, 30000);
    }

    enhanceInstallPrompt() {
        // beforeinstallpromptイベントの処理を改善
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎉 beforeinstallpromptイベントが発火しました！');
            
            // デフォルトの動作を防止
            e.preventDefault();
            
            // イベントを保存
            this.installPromptDeferred = e;
            
            // カスタムインストールUIを表示
            this.showCustomInstallPrompt();
            
            // 統計を記録
            localStorage.setItem('installPromptShown', new Date().toISOString());
        });

        // アプリがインストールされた場合の処理
        window.addEventListener('appinstalled', (e) => {
            console.log('✅ PWAがインストールされました！');
            this.installPromptDeferred = null;
            
            // インストール成功を記録
            localStorage.setItem('pwaInstalled', new Date().toISOString());
            
            // UI更新
            this.updateInstallStatus('installed');
        });
    }

    showCustomInstallPrompt() {
        const existingPrompt = document.getElementById('custom-install-prompt');
        if (existingPrompt) {
            existingPrompt.style.display = 'block';
            return;
        }

        // カスタムインストールプロンプトを作成
        const promptDiv = document.createElement('div');
        promptDiv.id = 'custom-install-prompt';
        promptDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1976d2, #1565c0);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90vw;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideDown 0.3s ease-out;
        `;

        promptDiv.innerHTML = `
            <div style="margin-bottom: 12px;">
                <strong>📱 アプリをインストールしますか？</strong>
            </div>
            <div style="font-size: 14px; margin-bottom: 16px; opacity: 0.9;">
                ホーム画面に追加して、簡単にアクセスできます
            </div>
            <div>
                <button id="install-yes" style="
                    background: white;
                    color: #1976d2;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    margin: 0 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">インストール</button>
                <button id="install-no" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 8px 16px;
                    border-radius: 6px;
                    margin: 0 8px;
                    cursor: pointer;
                ">後で</button>
            </div>
        `;

        // アニメーション用CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(promptDiv);

        // ボタンイベント
        document.getElementById('install-yes').addEventListener('click', () => {
            this.triggerInstall();
            promptDiv.remove();
        });

        document.getElementById('install-no').addEventListener('click', () => {
            promptDiv.remove();
            localStorage.setItem('installPromptDismissed', new Date().toISOString());
        });

        // 10秒後に自動で閉じる
        setTimeout(() => {
            if (document.body.contains(promptDiv)) {
                promptDiv.remove();
            }
        }, 10000);
    }

    async triggerInstall() {
        if (!this.installPromptDeferred) {
            console.log('⚠️ インストールプロンプトが利用できません');
            this.showManualInstallInstructions();
            return;
        }

        try {
            // インストールプロンプトを表示
            this.installPromptDeferred.prompt();
            
            // ユーザーの選択を待つ
            const { outcome } = await this.installPromptDeferred.userChoice;
            
            console.log(`📱 インストール結果: ${outcome}`);
            
            if (outcome === 'accepted') {
                localStorage.setItem('installAccepted', new Date().toISOString());
            } else {
                localStorage.setItem('installDeclined', new Date().toISOString());
            }
            
            // プロンプトをクリア
            this.installPromptDeferred = null;
            
        } catch (error) {
            console.error('❌ インストールエラー:', error);
            this.showManualInstallInstructions();
        }
    }

    showManualInstallInstructions() {
        const instructions = `
            📱 手動インストール方法:
            
            Android Chrome:
            1. メニュー (⋮) をタップ
            2. "アプリをインストール" または "ホーム画面に追加" を選択
            
            iOS Safari:
            1. 共有ボタン (□↗) をタップ  
            2. "ホーム画面に追加" を選択
        `;
        
        alert(instructions);
        console.log(instructions);
    }

    addManualInstallOption() {
        // 既存のインストールセクションを取得または作成
        let installSection = document.getElementById('install-prompt');
        if (!installSection) {
            installSection = document.createElement('div');
            installSection.id = 'install-prompt';
            installSection.className = 'content-section';
            document.querySelector('main').appendChild(installSection);
        }

        // 手動インストールボタンを追加
        const manualInstallBtn = document.createElement('button');
        manualInstallBtn.textContent = '📱 手動インストール方法を表示';
        manualInstallBtn.className = 'btn btn-secondary';
        manualInstallBtn.style.marginTop = '10px';
        manualInstallBtn.addEventListener('click', () => {
            this.showManualInstallInstructions();
        });

        installSection.appendChild(manualInstallBtn);
    }

    checkInstallConditions() {
        console.log('🔍 インストール条件を再チェック中...');
        
        const conditions = {
            pageViews: this.pageViewCount >= 2,
            userInteractions: this.userInteractionCount >= 3,
            timeOnPage: parseInt(localStorage.getItem('timeOnPage') || '0') >= 15000,
            hasServiceWorker: 'serviceWorker' in navigator,
            isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost'
        };
        
        console.log('📊 インストール条件:', conditions);
        
        const metConditions = Object.values(conditions).filter(Boolean).length;
        console.log(`✅ 満たした条件: ${metConditions}/5`);
        
        // 条件を満たしている場合、強制的にイベントをチェック
        if (metConditions >= 3) {
            setTimeout(() => {
                if (!this.installPromptDeferred) {
                    console.log('💡 beforeinstallpromptが発火していません。手動インストールを促します。');
                    this.showEnhancedInstallOptions();
                }
            }, 2000);
        }
    }

    showEnhancedInstallOptions() {
        const installSection = document.getElementById('install-prompt');
        if (!installSection) return;

        installSection.innerHTML = `
            <h2>📱 アプリをインストール</h2>
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 8px; margin: 16px 0;">
                <p><strong>🎉 このサイトをアプリとしてインストールできます！</strong></p>
                <p>📊 あなたの利用状況:</p>
                <ul>
                    <li>ページビュー: ${this.pageViewCount}回</li>
                    <li>操作回数: ${this.userInteractionCount}回</li>
                    <li>滞在時間: ${Math.round(parseInt(localStorage.getItem('timeOnPage') || '0') / 1000)}秒</li>
                </ul>
                <button onclick="pwaEnhancer.showManualInstallInstructions()" class="btn btn-primary">
                    📱 インストール方法を表示
                </button>
            </div>
        `;

        installSection.style.display = 'block';
    }

    scheduleInstallCheck() {
        // 定期的にインストール条件をチェック
        setInterval(() => {
            this.checkInstallConditions();
        }, 30000); // 30秒ごと
    }

    updateInstallStatus(status) {
        const statusElement = document.getElementById('install-status');
        if (statusElement) {
            if (status === 'installed') {
                statusElement.textContent = '✅ インストール済み';
                statusElement.className = 'status-value success';
            }
        }
    }
}

// グローバルインスタンスを作成
window.pwaEnhancer = new PWAInstallEnhancer();