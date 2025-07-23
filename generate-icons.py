#!/usr/bin/env python3
"""
シンプルなアイコン生成スクリプト
PILが利用できない場合のフォールバック
"""

def create_svg_icon(size, filename):
    """SVGアイコンを生成"""
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="{size}" height="{size}" fill="#1976d2" rx="{size//8}"/>
  
  <!-- 共有アイコン -->
  <g fill="#ffffff">
    <!-- 中央の円 -->
    <circle cx="{size//2}" cy="{size//2}" r="{size//7}"/>
    
    <!-- 上向き矢印 -->
    <path d="M{size//2} {size//5} L{size//2-size//12} {size//3} L{size//2-size//24} {size//3} L{size//2-size//24} {size//2-size//14} L{size//2+size//24} {size//2-size//14} L{size//2+size//24} {size//3} L{size//2+size//12} {size//3} Z"/>
    
    <!-- 左の円 -->
    <circle cx="{size//4}" cy="{size//2+size//6}" r="{size//10}"/>
    
    <!-- 右の円 -->
    <circle cx="{size*3//4}" cy="{size//2+size//6}" r="{size//10}"/>
    
    <!-- 接続線（左） -->
    <line x1="{size//2-size//8}" y1="{size//2+size//12}" x2="{size//4+size//12}" y2="{size//2+size//8}" stroke="#ffffff" stroke-width="{size//48}" stroke-linecap="round"/>
    
    <!-- 接続線（右） -->
    <line x1="{size//2+size//8}" y1="{size//2+size//12}" x2="{size*3//4-size//12}" y2="{size//2+size//8}" stroke="#ffffff" stroke-width="{size//48}" stroke-linecap="round"/>
  </g>
</svg>'''
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"✅ {filename} を作成しました")

def create_html_converter():
    """SVGをPNGに変換するHTMLファイルを作成"""
    html_content = '''<!DOCTYPE html>
<html>
<head>
    <title>SVG to PNG Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-container { margin: 20px 0; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        button { padding: 10px 20px; margin: 5px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1565c0; }
    </style>
</head>
<body>
    <h1>SVG to PNG Converter</h1>
    <p>SVGアイコンをPNGに変換してダウンロードします。</p>
    
    <div class="icon-container">
        <h3>192x192 Icon</h3>
        <canvas id="canvas192" width="192" height="192"></canvas>
        <button onclick="convertAndDownload(192, 'icon-192.png')">icon-192.png をダウンロード</button>
    </div>
    
    <div class="icon-container">
        <h3>512x512 Icon</h3>
        <canvas id="canvas512" width="512" height="512"></canvas>
        <button onclick="convertAndDownload(512, 'icon-512.png')">icon-512.png をダウンロード</button>
    </div>
    
    <script>
        function loadSVG(size, canvasId) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            
            // SVGデータを直接埋め込み
            const svgData = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${size}" height="${size}" fill="#1976d2" rx="${Math.floor(size/8)}"/>
              <g fill="#ffffff">
                <circle cx="${Math.floor(size/2)}" cy="${Math.floor(size/2)}" r="${Math.floor(size/7)}"/>
                <path d="M${Math.floor(size/2)} ${Math.floor(size/5)} L${Math.floor(size/2-size/12)} ${Math.floor(size/3)} L${Math.floor(size/2-size/24)} ${Math.floor(size/3)} L${Math.floor(size/2-size/24)} ${Math.floor(size/2-size/14)} L${Math.floor(size/2+size/24)} ${Math.floor(size/2-size/14)} L${Math.floor(size/2+size/24)} ${Math.floor(size/3)} L${Math.floor(size/2+size/12)} ${Math.floor(size/3)} Z"/>
                <circle cx="${Math.floor(size/4)}" cy="${Math.floor(size/2+size/6)}" r="${Math.floor(size/10)}"/>
                <circle cx="${Math.floor(size*3/4)}" cy="${Math.floor(size/2+size/6)}" r="${Math.floor(size/10)}"/>
                <line x1="${Math.floor(size/2-size/8)}" y1="${Math.floor(size/2+size/12)}" x2="${Math.floor(size/4+size/12)}" y2="${Math.floor(size/2+size/8)}" stroke="#ffffff" stroke-width="${Math.floor(size/48)}" stroke-linecap="round"/>
                <line x1="${Math.floor(size/2+size/8)}" y1="${Math.floor(size/2+size/12)}" x2="${Math.floor(size*3/4-size/12)}" y2="${Math.floor(size/2+size/8)}" stroke="#ffffff" stroke-width="${Math.floor(size/48)}" stroke-linecap="round"/>
              </g>
            </svg>`;
            
            const blob = new Blob([svgData], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            img.src = url;
        }
        
        function convertAndDownload(size, filename) {
            const canvas = document.getElementById('canvas' + size);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            console.log(`✅ ${filename} をダウンロードしました`);
        }
        
        // ページ読み込み時にSVGを描画
        document.addEventListener('DOMContentLoaded', function() {
            loadSVG(192, 'canvas192');
            loadSVG(512, 'canvas512');
        });
    </script>
</body>
</html>''';
    
    with open('svg-to-png-converter.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("✅ svg-to-png-converter.html を作成しました")

if __name__ == "__main__":
    print("🎨 アイコンファイルを生成中...")
    
    # SVGアイコンを作成
    create_svg_icon(192, 'icon-192.svg')
    create_svg_icon(512, 'icon-512.svg')
    
    # HTML変換ツールを作成
    create_html_converter()
    
    print("\n✅ アイコン生成完了!")
    print("📝 次の手順:")
    print("1. ブラウザで 'svg-to-png-converter.html' を開く")
    print("2. 表示されたボタンをクリックしてPNGファイルをダウンロード")
    print("3. ダウンロードしたファイルを 'icon-192.png' と 'icon-512.png' として保存")