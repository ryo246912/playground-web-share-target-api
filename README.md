# Web Share Target API Playground

Web Share Target APIを使用したURL共有受信のモックアップアプリケーションです。スマートフォンの各種ソーシャルメディアアプリ（YouTube、X、TikTok等）からの共有を受け取り、受信したURLとメタデータを表示・記録する機能を提供します。

## 🚀 主な機能

- **Web Share Target API対応**: PWAとして共有先に表示される
- **プラットフォーム識別**: YouTube、X（Twitter）、TikTokなどを自動識別
- **履歴機能**: 受信したURLの履歴をLocalStorageに保存
- **レスポンシブデザイン**: モバイルとデスクトップで最適化
- **テスト機能**: 手動でURLを入力してテスト可能
- **エラーハンドリング**: 非対応ブラウザや無効データの適切な処理

## 📋 要件

### ブラウザサポート
- **Android Chrome**: 完全サポート（PWAインストール、共有機能）
- **iOS Safari**: 基本機能のみ（Web Share Target API制限あり）
- **デスクトップブラウザ**: 表示・テスト機能のみ

### 配信要件
- **HTTPS必須**: Web Share Target APIはHTTPS環境でのみ動作
- **PWAマニフェスト**: Service WorkerとWeb App Manifestが必要

## 🛠️ セットアップ

### 1. ローカル開発

```bash
# プロジェクトクローン
git clone [リポジトリURL]
cd playground-web-share-target-api

# HTTPSサーバーの起動（例：Python）
python3 -m http.server 8000 --bind 127.0.0.1

# または Node.js の http-server
npx http-server -p 8000 -a 127.0.0.1 --ssl
```

### 2. GitHub Pages配信

1. GitHubリポジトリにプッシュ
2. Settings > Pages でソースブランチを設定
3. HTTPS URLでアクセス可能になる

### 3. アイコンファイルの生成

`create-icons.html`をブラウザで開き、生成されたアイコンをダウンロードして`icon-192.png`と`icon-512.png`として保存してください。

## 📱 使用方法

### PWAインストール

1. Chrome（Android）でサイトにアクセス
2. 「アプリをインストール」プロンプトまたはメニューから追加
3. ホーム画面にアイコンが追加される

### 共有機能のテスト

1. **YouTube、X、TikTokアプリから**:
   - 動画や投稿の共有ボタンをタップ
   - 共有先に「Web Share Target Playground」が表示される
   - 選択するとアプリが開き、URLが表示される

2. **手動テスト**:
   - アプリ内の「テスト機能」セクションでURLを入力
   - 「テスト共有」ボタンで動作確認

### 受信データの確認

- **受信したコンテンツ**: 最新の共有データを表示
- **共有履歴**: 過去の受信履歴をリスト表示
- **ステータス情報**: ブラウザサポート状況を確認

## 🏗️ 技術仕様

### アーキテクチャ

```
[ソーシャルメディアアプリ] 
    ↓
[OS共有インターフェース] 
    ↓ 
[PWA Web Share Target] 
    ↓
[受信データ処理] 
    ↓
[UI表示]
```

### 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **PWA機能**: Service Worker, Web App Manifest
- **API**: Web Share Target API
- **データ保存**: LocalStorage
- **配信**: GitHub Pages（HTTPS自動対応）

### ファイル構成

```
playground-web-share-target-api/
├── index.html          # メインHTMLファイル
├── app.js              # メインJavaScriptアプリケーション
├── styles.css          # スタイルシート
├── sw.js               # Service Worker
├── manifest.json       # PWAマニフェスト
├── icon-192.png        # アプリアイコン（192x192）
├── icon-512.png        # アプリアイコン（512x512）
├── icon.svg            # SVGアイコン（ソース）
├── create-icons.html   # アイコン生成ツール
└── README.md           # このファイル
```

## 🔧 カスタマイズ

### プラットフォーム追加

`app.js`の`identifyPlatform`メソッドで新しいプラットフォームを追加：

```javascript
identifyPlatform(url) {
    if (!url) return 'other';
    
    const domain = url.toLowerCase();
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        return 'youtube';
    } else if (domain.includes('新しいプラットフォーム.com')) {
        return 'new-platform';
    }
    // ... 他のプラットフォーム
}
```

### スタイルのカスタマイズ

`styles.css`でプラットフォームバッジの色を追加：

```css
.platform-new-platform { 
    background-color: #カラーコード; 
}
```

## 🐛 トラブルシューティング

### 共有機能が表示されない

- HTTPSでアクセスしているか確認
- PWAがインストールされているか確認
- ブラウザがWeb Share Target APIをサポートしているか確認

### Service Worker登録エラー

- `sw.js`ファイルが正しい場所にあるか確認
- ブラウザの開発者ツールでエラーメッセージを確認
- キャッシュをクリアして再試行

### データが保存されない

- LocalStorageが有効になっているか確認
- プライベートモードでアクセスしていないか確認
- ブラウザの容量制限に達していないか確認

## 📈 今後の拡張予定

- [ ] プッシュ通知機能
- [ ] バックグラウンド同期
- [ ] データエクスポート機能
- [ ] カテゴリ分類機能
- [ ] 検索機能

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙋‍♂️ サポート

問題や質問がある場合は、GitHubのIssueを作成してください。

---

**注意**: このアプリケーションは検証用のモックアップです。本格的な利用には追加のセキュリティ対策やデータ保護機能が必要です。