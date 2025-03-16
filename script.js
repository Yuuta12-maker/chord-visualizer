// 音と色のマッピング
const chordColors = {
    'C': '#FF0000',   // 赤
    'C#': '#f0e68c',  // 黄土色
    'Db': '#f0e68c',  // C#と同じ
    'D': '#FFFF00',   // 黄色
    'D#': '#2e8b57',  // 濃い緑
    'Eb': '#2e8b57',  // D#と同じ
    'E': '#adff2f',   // 黄緑
    'F': '#00FFFF',   // 水色
    'F#': '#0000CD',  // 濃い青
    'Gb': '#0000CD',  // F#と同じ
    'G': '#FFA500',   // オレンジ
    'G#': '#ff69b4',  // ピンク
    'Ab': '#ff69b4',  // G#と同じ
    'A': '#9932cc',   // 鮮やかな紫
    'A#': '#c0c0c0',  // 灰色
    'Bb': '#c0c0c0',  // A#と同じ
    'B': '#8b4513',   // 茶色
    'Con': '#FFA500', // オンコードの特別処理
    'Em': '#adff2f',  // Em（Eのバリエーション）
    'Am': '#9932cc',  // Am（Aのバリエーション）
    'Dm': '#FFFF00',  // Dm（Dのバリエーション）
    'Bm': '#8b4513',  // Bm（Bのバリエーション）
};

// 色の明度を計算する関数
function getBrightness(hexColor) {
    // 16進数カラーコードからRGB値に変換
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    // 明度の計算 (0-255)
    return (r * 299 + g * 587 + b * 114) / 1000;
}

// コード表記を解析して、ルート音とそれ以外の部分に分ける
function parseChord(chord) {
    // ルート音を抽出するための正規表現
    // 基本的なコードルート（C, C#, Dbなど）
    const basicRootPattern = /^([A-G][#b]?)(m|M|maj|min|dim|aug|sus|add)?/;
    // 特殊なケース（Em, Am, Dmなど）
    const specialPattern = /^(Em|Am|Dm|Bm)([0-9]|maj|min|dim|aug|sus|add)?/;
    
    let match = chord.match(specialPattern);
    if (match) {
        const root = match[1];
        const remainder = chord.substring(root.length);
        return [root, remainder];
    }
    
    match = chord.match(basicRootPattern);
    if (match) {
        // ルート音とコードタイプ（mなど）を組み合わせる
        let root = match[1];
        const chordType = match[2] || "";
        
        // mが付く場合は特別処理（Em, Amなど）
        if (chordType === 'm') {
            const combinedRoot = root + 'm';
            if (chordColors[combinedRoot]) {
                return [combinedRoot, chord.substring(root.length + 1)];
            }
        }
        
        return [root, chord.substring(root.length)];
    }
    
    return [chord, ""];
}

// 単一のコードに色を付ける
function colorizeChord(chord) {
    // 空のコードの場合は空白を返す
    if (chord.trim() === "") {
        return "&nbsp;";
    }

    // 特殊記号（繰り返し記号など）の処理
    if (chord.includes("(") || chord.includes(")") || chord.includes("×")) {
        return `<span style="color:white; margin:0 2px; text-shadow:0px 0px 2px rgba(0,0,0,0.5);">${chord}</span>`;
    }

    // 通常のコードの処理
    const [root, remainder] = parseChord(chord);

    // on付きコードの特別処理（例：C/G, G/Am7onG）
    if (remainder.includes('/')) {
        const parts = remainder.split('/');
        const mainRemainder = parts[0];
        const bassNote = parts[1];
        
        // ベース音も含めてコード色を決定
        let bgColor;
        if (chordColors[root]) {
            bgColor = chordColors[root];
        } else if (root.includes('on') && chordColors['Con']) {
            bgColor = chordColors['Con'];
        } else {
            return `<span style="color:white; margin:0 2px; text-shadow:0px 0px 2px rgba(0,0,0,0.5);">${chord}</span>`;
        }

        const brightness = getBrightness(bgColor);
        const textColor = brightness > 128 ? "black" : "white";
        const textShadow = textColor === "white" ? 
            "0px 0px 2px rgba(0,0,0,0.5)" : 
            "0px 0px 2px rgba(255,255,255,0.5)";

        let fontSize = "12px";
        if (chord.length > 6) {
            fontSize = "10px";
        }

        return `<span style="display:inline-block; background-color:${bgColor}; color:${textColor}; padding:0 4px; margin:2px; font-size:${fontSize}; line-height:18px; border-radius:2px; text-shadow:${textShadow};">${root}<span style="font-weight:normal;">${mainRemainder}/${bassNote}</span></span>`;
    }

    if (chordColors[root]) {
        const bgColor = chordColors[root];

        // 背景色の明度を計算し、適切なテキスト色を選択
        const brightness = getBrightness(bgColor);
        const textColor = brightness > 128 ? "black" : "white";

        // テキストシャドウを追加して視認性向上
        const textShadow = textColor === "white" ? 
            "0px 0px 2px rgba(0,0,0,0.5)" : 
            "0px 0px 2px rgba(255,255,255,0.5)";

        // コードの長さに基づいてフォントサイズを調整
        let fontSize = "12px";
        if (chord.length > 6) {
            fontSize = "10px";
        }

        return `<span style="display:inline-block; background-color:${bgColor}; color:${textColor}; padding:0 4px; margin:2px; font-size:${fontSize}; line-height:18px; border-radius:2px; text-shadow:${textShadow};">${root}<span style="font-weight:normal;">${remainder}</span></span>`;
    } else {
        return `<span style="color:white; margin:0 2px; text-shadow:0px 0px 2px rgba(0,0,0,0.5);">${chord}</span>`;
    }
}

// コードパターンを認識するための正規表現
const chordPattern = /\b([A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*(?:\/[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*)?(?:7|9|11|13)?(?:on[A-G])?)\b/g;

// 特殊なコードパターン
const specialChordPattern = /\b(Em|Am|Dm|Bm)([0-9]|maj|min|dim|aug|sus|add)?(?:\/[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*)?(?:7|9|11|13)?(?:on[A-G])?\b/g;

// 行内のコードをハイライトする
function highlightChordsInLine(line) {
    // まず特殊なコードパターンを処理
    let processedLine = line.replace(specialChordPattern, (match) => {
        return colorizeChord(match);
    });
    
    // 次に標準的なコードパターンを処理
    processedLine = processedLine.replace(chordPattern, (match) => {
        // すでに処理されたコードはスキップ
        if (match.startsWith('<span')) {
            return match;
        }
        return colorizeChord(match);
    });
    
    return processedLine;
}

// コードと歌詞の行を交互に処理する従来の方法
function processChordLyricLines(inputText) {
    const lines = inputText.trim().split('\n');
    let htmlOutput = '<div style="font-family:monospace; font-size:13px; white-space:pre; background-color:#1e1e1e; padding:10px; border-radius:5px; color:white;">';

    let i = 0;
    while (i < lines.length) {
        const chordLine = lines[i].trim();

        // コード行を処理
        let chordHtml = '<div style="margin:2px 0;">';
        const chordParts = chordLine.split(/\s+/);

        for (const part of chordParts) {
            chordHtml += colorizeChord(part);
        }

        chordHtml += '</div>';
        htmlOutput += chordHtml;

        // 次の行が歌詞行かチェック
        if (i + 1 < lines.length) {
            const lyricLine = lines[i + 1].trim();
            htmlOutput += `<div style="margin:0 0 6px 0; padding-left:2px;">${lyricLine}</div>`;
            i += 2;
        } else {
            i += 1;
        }
    }

    htmlOutput += '</div>';
    return htmlOutput;
}

// 各行内のコードを自動検出して処理する新しい方法
function processAutoDetectMode(inputText) {
    const lines = inputText.trim().split('\n');
    let htmlOutput = '<div style="font-family:monospace; font-size:13px; white-space:pre; background-color:#1e1e1e; padding:10px; border-radius:5px; color:white;">';

    for (const line of lines) {
        // 行内のコードを検出して色付け
        const processedLine = highlightChordsInLine(line);
        htmlOutput += `<div style="margin:2px 0;">${processedLine}</div>`;
    }

    htmlOutput += '</div>';
    return htmlOutput;
}

// ボタンクリック時のイベント処理
document.addEventListener('DOMContentLoaded', function() {
    const processButton = document.getElementById('process-button');
    const inputText = document.getElementById('input-text');
    const outputArea = document.getElementById('output-area');
    const autoDetectCheckbox = document.createElement('input');
    
    // 自動検出モードのチェックボックスを追加
    autoDetectCheckbox.type = 'checkbox';
    autoDetectCheckbox.id = 'auto-detect';
    autoDetectCheckbox.checked = true; // デフォルトでオン
    
    const autoDetectLabel = document.createElement('label');
    autoDetectLabel.htmlFor = 'auto-detect';
    autoDetectLabel.textContent = 'コード自動検出モード（行内のコードを自動検出）';
    autoDetectLabel.style.color = '#333';
    autoDetectLabel.style.marginLeft = '10px';
    
    const controlArea = document.createElement('div');
    controlArea.style.marginTop = '10px';
    controlArea.style.marginBottom = '10px';
    controlArea.appendChild(autoDetectCheckbox);
    controlArea.appendChild(autoDetectLabel);
    
    // 入力エリアの後にコントロールエリアを挿入
    const inputArea = document.querySelector('.input-area');
    inputArea.appendChild(controlArea);

    processButton.addEventListener('click', function() {
        const input = inputText.value;
        let html;
        
        // 自動検出モードが有効ならそちらを使う
        if (autoDetectCheckbox.checked) {
            html = processAutoDetectMode(input);
        } else {
            html = processChordLyricLines(input);
        }
        
        outputArea.innerHTML = html;
    });
});
