# Design Document

## Overview

Web Share Target APIを活用したURL共有受信モックアップアプリケーションの設計。このアプリケーションは、スマートフォンの各種ソーシャルメディアアプリ（YouTube、X、TikTok等）からの共有を受け取り、受信したURLとメタデータを表示・記録する機能を提供する。PWA（Progressive Web App）として実装し、ネイティブアプリのような共有体験を実現する。

## Architecture

### システム構成
```
[ソーシャルメディアアプリ] → [OS共有インターフェース] → [PWA Web Share Target] → [受信データ処理] → [UI表示]
```

### 技術スタック
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **PWA機能**: Service Worker, Web App Manifest
- **API**: Web Share Target API
- **データ保存**: LocalStorage（モックアップのため）
- **配信**: GitHub Pages（HTTPS自動対応）

## Components and Interfaces

### 1. Web App Manifest (`manifest.json`)
PWAとしての設定とWeb Share Target APIの定義を含む。

**主要設定項目:**
- `share_target`: 共有データの受信設定
- `start_url`: 共有時の起動URL
- `display`: スタンドアロンモード
- `icons`: アプリアイコン

### 2. Service Worker (`sw.js`)
PWAの基本機能とキャッシュ戦略を実装。

**機能:**
- アプリケーションキャッシュ
- オフライン対応
- インストール促進

### 3. メインアプリケーション (`index.html`, `app.js`, `styles.css`)

#### URLパラメータ処理モジュール
```javascript
class ShareTargetHandler {
  parseSharedData(url)
  validateSharedData(data)
  displaySharedContent(data)
}
```

#### UI表示モジュール
```javascript
class UIManager {
  displayReceivedURL(data)
  showHistory()
  updateTimestamp()
  identifyPlatform(url)
}
```

#### データ管理モジュール
```javascript
class DataManager {
  saveToLocalStorage(data)
  getHistory()
  clearHistory()
}
```

## Data Models

### SharedData
```javascript
{
  url: string,           // 共有されたURL
  title: string,         // ページタイトル
  text: string,          // 追加テキスト
  timestamp: Date,       // 受信日時
  platform: string,      // 識別されたプラットフォーム
  id: string            // ユニークID
}
```

### HistoryEntry
```javascript
{
  id: string,
  sharedData: SharedData,
  receivedAt: Date,
  processed: boolean
}
```

## Error Handling

### 1. Web Share Target API非対応
- ブラウザサポート検出
- フォールバック機能の提供
- 適切なエラーメッセージ表示

### 2. 無効な共有データ
- URLバリデーション
- 必須パラメータチェック
- エラー状態の視覚的フィードバック

### 3. ネットワークエラー
- オフライン状態の検出
- キャッシュされたデータの表示
- 再接続時の同期

### 4. ストレージエラー
- LocalStorage容量制限の処理
- データ保存失敗時の代替手段
- ユーザーへの適切な通知

## Testing Strategy

### 1. 単体テスト
- URLパースロジック
- データバリデーション
- プラットフォーム識別機能

### 2. 統合テスト
- Web Share Target APIの動作確認
- Service Workerの登録・動作
- PWAインストール機能

### 3. デバイステスト
- Android Chrome での共有機能
- iOS Safari での動作確認
- 異なる画面サイズでのUI確認

### 4. 手動テスト手順
1. PWAをインストール
2. YouTube/X/TikTokアプリから共有
3. 受信データの表示確認
4. 履歴機能の動作確認
5. エラーケースの動作確認

## Implementation Notes

### Web Share Target API設定例
```json
{
  "share_target": {
    "action": "/share-target/",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### プラットフォーム識別ロジック
- YouTube: `youtube.com`, `youtu.be`
- X (Twitter): `twitter.com`, `x.com`
- TikTok: `tiktok.com`
- その他: ドメイン名から推測

### セキュリティ考慮事項
- XSS防止のためのURL/テキストサニタイズ
- HTTPS必須での配信
- CSP（Content Security Policy）の設定
