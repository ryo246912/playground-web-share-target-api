# GitHub Pages 配信手順書

## 🚀 配信手順

### 1. リポジトリの準備

```bash
# リポジトリに変更をコミット
git add .
git commit -m "feat: Web Share Target API playground implementation

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHubにプッシュ
git push origin main
```

### 2. GitHub Pages設定

1. GitHubリポジトリページにアクセス
2. **Settings** タブをクリック
3. サイドバーから **Pages** を選択
4. **Source** で "Deploy from a branch" を選択
5. **Branch** で `main` を選択
6. **Save** をクリック

### 3. GitHub Actions確認

1. **Actions** タブをクリック
2. "Deploy to GitHub Pages" ワークフローの実行状況を確認
3. ✅ 成功するまで待機（通常2-5分）

## 🔍 配信後の動作確認

### ブラウザでのアクセス確認

配信されたURLにアクセス（例：`https://[username].github.io/[repository-name]/`）

### PWA機能の検証

ブラウザの開発者ツールのコンソールで以下を実行：

```javascript
// PWA検証スクリプトを読み込み（すでに読み込まれている場合はスキップ）
if (typeof PWAValidator === 'undefined') {
    const script = document.createElement('script');
    script.src = './validate-pwa.js';
    document.head.appendChild(script);
} else {
    new PWAValidator();
}
```

### 期待される結果

```
📊 PWA検証結果:
==================================================

SERVICEWORKER:
Status: ✅ 登録済み
scope: https://[username].github.io/[repository-name]/
updatefound: false

MANIFEST:
Status: ✅ 有効
name: Web Share Target API Playground
shareTarget: ✅ 設定済み

HTTPS:
Status: ✅ HTTPS
protocol: https:

INSTALLABILITY:
Status: ✅ インストール可能
message: PWAとしてインストールできます

SHARETARGET:
Status: ⚠️ 未テスト
message: 他のアプリから共有してテストしてください
==================================================
```

## 📱 モバイルデバイスでのテスト

### Android Chrome

1. **PWAインストール**:
   - 配信されたURLにアクセス
   - 「アプリをインストール」プロンプトをタップ
   - またはメニュー > 「アプリをインストール」

2. **共有機能テスト**:
   - YouTube、X、TikTokアプリを開く
   - 任意のコンテンツの共有ボタンをタップ
   - 共有先に「Web Share Target API Playground」が表示されることを確認
   - 選択してアプリが開き、URLが表示されることを確認

### iOS Safari

1. **ホーム画面追加**:
   - 配信されたURLにアクセス
   - 共有ボタン > 「ホーム画面に追加」

2. **制限事項の確認**:
   - iOS SafariはWeb Share Target APIに制限があります
   - 基本的な表示・履歴機能のみ動作します

## 🐛 トラブルシューティング

### Service Worker登録エラー

```javascript
// コンソールでService Worker状態を確認
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('登録済みService Workers:', registrations);
});

// エラーがある場合は強制更新
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
    location.reload();
});
```

### manifest.json読み込みエラー

```bash
# ブラウザでmanifest.jsonに直接アクセス
https://[username].github.io/[repository-name]/manifest.json
```

### HTTPS証明書エラー

- GitHub Pagesは自動的にHTTPS証明書を提供します
- 配信後24時間以内に有効になります
- カスタムドメインを使用する場合は追加設定が必要です

### PWAインストールプロンプトが表示されない

**確認項目**:
1. HTTPSアクセスかどうか
2. Service Workerが正常に登録されているか
3. manifest.jsonが正しく読み込まれているか
4. 必要なアイコンファイルが存在するか

**強制的にインストールプロンプトをテスト**:
```javascript
// beforeinstallpromptイベントを手動発火
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('インストールプロンプト利用可能');
    e.prompt();
});
```

## 📊 パフォーマンス監視

### Lighthouse監査

1. Chrome DevTools > Lighthouse タブ
2. 「PWA」カテゴリを選択
3. 「Generate report」をクリック
4. 90点以上のスコアを目標

### 期待されるLighthouseスコア

- **PWA**: 90+点
- **Performance**: 90+点
- **Accessibility**: 90+点
- **Best Practices**: 90+点
- **SEO**: 90+点

## 🔧 カスタマイズ設定

### カスタムドメイン設定

1. `CNAME` ファイルをルートに作成
2. カスタムドメイン名を記載
3. DNS設定でCNAMEレコードを追加

### アナリティクス追加

Google Analytics or GitHub Pages統計の設定手順は別途ドキュメント参照。

## 📝 配信チェックリスト

- [ ] GitHub Actionsワークフローが成功
- [ ] HTTPS配信が正常動作
- [ ] PWA検証スクリプトで全項目パス
- [ ] Android ChromeでPWAインストール成功
- [ ] 共有機能動作確認（最低1つのプラットフォーム）
- [ ] Lighthouse PWAスコア90点以上
- [ ] モバイル・デスクトップ両方で表示確認
- [ ] オフライン動作確認

---

**注意**: 配信後の変更は自動的にデプロイされます。本番環境での動作に影響するため、テスト済みコードのみコミットしてください。