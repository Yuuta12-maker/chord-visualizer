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
    // 空白を除去して処理
    chord = chord.trim();
    
    // マイナーセブンスコード (F#m7, Bm7 など) の処理を最優先
    const minorSeventhPattern = /^([A-G][#b]?)m7/;
    let match = chord.match(minorSeventhPattern);
    if (match) {
        const root = match[1];
        const rootWithMinor = root + 'm';
        const remainder = chord.substring(rootWithMinor.length);
        return [rootWithMinor, remainder];
    }

    // Am7onD のようなオンコード
    const onChordPattern = /^([A-G][#b]?m?7?)on([A-G][#b]?)/;
    match = chord.match(onChordPattern);
    if (match) {
        const fullChord = match[0];
        const mainChord = match[1];
        const bassNote = match[2];
        const root = mainChord.substring(0, 1) + (mainChord.charAt(1) === '#' || mainChord.charAt(1) === 'b' ? mainChord.charAt(1) : '');
        const remainder = 'on' + bassNote;
        return [root, mainChord.substring(root.length) + remainder];
    }

    // 特殊なケース（Em, Am, Dm, Bmなど）
    const specialChordPattern = /^(Em|Am|Dm|Bm)([0-9]|maj|min|dim|aug|sus|add)?/;
    match = chord.match(specialChordPattern);
    if (match) {
        const root = match[1];
        const remainder = chord.substring(root.length);
        return [root, remainder];
    }
    
    // 基本的なコードルート（C, C#, Dbなど）
    const basicRootPattern = /^([A-G][#b]?)(m|M|maj|min|dim|aug|sus|add)?/;
    match = chord.match(basicRootPattern);
    if (match) {
        // ルート音とコードタイプ（mなど）を組み合わせる
        const root = match[1];
        const chordType = match[2] || "";
        
        // mが付く場合は特別処理（Em, Amなど）
        if (chordType === 'm') {
            const combinedRoot = root + 'm';
            if (chordColors[combinedRoot]) {
                return [combinedRoot, chord.substring(combinedRoot.length)];
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

        let fontSize = "14px";
        if (chord.length > 6) {
            fontSize = "12px";
        }

        return `<span style="display:inline-block; background-color:${bgColor}; color:${textColor}; padding:3px 6px; margin:2px; font-size:${fontSize}; line-height:1.3; border-radius:6px; text-shadow:${textShadow}; font-weight:500; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${root}<span style="font-weight:normal;">${mainRemainder}/${bassNote}</span></span>`;
    }

    // ルート音から適切な色を選択
    let bgColor;
    if (chordColors[root]) {
        bgColor = chordColors[root];
    } else {
        // ルート音がAm7などの場合は、Aの色を使う
        const baseRoot = root.charAt(0);
        if (chordColors[baseRoot]) {
            bgColor = chordColors[baseRoot];
        } else {
            return `<span style="color:white; margin:0 2px; text-shadow:0px 0px 2px rgba(0,0,0,0.5);">${chord}</span>`;
        }
    }

    // 背景色の明度を計算し、適切なテキスト色を選択
    const brightness = getBrightness(bgColor);
    const textColor = brightness > 128 ? "black" : "white";

    // テキストシャドウを追加して視認性向上
    const textShadow = textColor === "white" ? 
        "0px 0px 2px rgba(0,0,0,0.5)" : 
        "0px 0px 2px rgba(255,255,255,0.5)";

    // コードの長さに基づいてフォントサイズを調整
    let fontSize = "14px";
    if (chord.length > 6) {
        fontSize = "12px";
    }

    return `<span style="display:inline-block; background-color:${bgColor}; color:${textColor}; padding:3px 6px; margin:2px; font-size:${fontSize}; line-height:1.3; border-radius:6px; text-shadow:${textShadow}; font-weight:500; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${root}<span style="font-weight:normal;">${remainder}</span></span>`;
}

// コードパターンを認識するための正規表現
const chordPattern = /\b([A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*(?:7|9|11|13)?(?:on[A-G][#b]?)?(?:\/[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*)?)(?:\s+|$)/g;

// 特殊なコードパターン
const specialChordPattern = /\b(Am7|Em7|Dm7|Bm7)(?:on[A-G][#b]?)?(?:\/[A-G][#b]?(?:m|M|maj|min|dim|aug|sus|add|[0-9])*)?(?:7|9|11|13)?(?:\s+|$)/g;

// 複合的なコードパターン
const complexChordPattern = /\b([A-G][#b]?m7(?:on[A-G][#b]?)?)(?:\s+|$)/g;

// 行内のコードをハイライトする
function highlightChordsInLine(line) {
    // まず複合的なコードパターンを処理
    let processedLine = line.replace(complexChordPattern, (match) => {
        return colorizeChord(match.trim());
    });
    
    // 次に特殊なコードパターンを処理
    processedLine = processedLine.replace(specialChordPattern, (match) => {
        // すでに処理されたコードはスキップ
        if (match.startsWith('<span')) {
            return match;
        }
        return colorizeChord(match.trim());
    });
    
    // 最後に標準的なコードパターンを処理
    processedLine = processedLine.replace(chordPattern, (match) => {
        // すでに処理されたコードはスキップ
        if (match.startsWith('<span')) {
            return match;
        }
        return colorizeChord(match.trim());
    });
    
    return processedLine;
}

// コードと歌詞の行を交互に処理する従来の方法
function processChordLyricLines(inputText) {
    const lines = inputText.trim().split('\n');
    let htmlOutput = '<div style="font-family:monospace; font-size:14px; white-space:pre; background-color:#0f172a; padding:1.5rem; border-radius:8px; color:white; line-height:1.6;">';

    let i = 0;
    while (i < lines.length) {
        const chordLine = lines[i].trim();

        // コード行を処理
        let chordHtml = '<div style="margin:4px 0;">';
        const chordParts = chordLine.split(/\s+/);

        for (const part of chordParts) {
            chordHtml += colorizeChord(part);
        }

        chordHtml += '</div>';
        htmlOutput += chordHtml;

        // 次の行が歌詞行かチェック
        if (i + 1 < lines.length) {
            const lyricLine = lines[i + 1].trim();
            htmlOutput += `<div style="margin:0 0 8px 0; padding-left:4px; font-size:15px; color:#e2e8f0;">${lyricLine}</div>`;
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
    let htmlOutput = '<div style="font-family:monospace; font-size:14px; white-space:pre; background-color:#0f172a; padding:1.5rem; border-radius:8px; color:white; line-height:1.6;">';

    for (const line of lines) {
        // 行内のコードを検出して色付け
        const processedLine = highlightChordsInLine(line);
        htmlOutput += `<div style="margin:4px 0;">${processedLine}</div>`;
    }

    htmlOutput += '</div>';
    return htmlOutput;
}

// ボタンクリック時のイベント処理
document.addEventListener('DOMContentLoaded', function() {
    const processButton = document.getElementById('process-button');
    const inputText = document.getElementById('input-text');
    const outputArea = document.getElementById('output-area');
    const autoDetectCheckbox = document.getElementById('auto-detect');
    
    // UI要素に効果を追加
    function addUIEffects() {
        // テキストエリアのフォーカス効果
        inputText.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        inputText.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // ボタンのクリック効果
        processButton.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(1px)';
        });
        
        processButton.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        // ローディング効果
        processButton.addEventListener('click', function() {
            const originalText = this.textContent;
            this.innerHTML = '<span class="loading">処理中</span>';
            
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 500);
        });
    }
    
    addUIEffects();

    processButton.addEventListener('click', function() {
        const input = inputText.value;
        let html;
        
        // 自動検出モードが有効ならそちらを使う
        if (autoDetectCheckbox.checked) {
            html = processAutoDetectMode(input);
        } else {
            html = processChordLyricLines(input);
        }
        
        // 結果にハイライト効果を追加
        outputArea.innerHTML = html;
        outputArea.classList.add('new-result');
        
        setTimeout(() => {
            outputArea.classList.remove('new-result');
        }, 1500);
        
        // スクロールして結果を表示
        setTimeout(() => {
            outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });

    // サンプルテキストをロード
    const sampleText = `G / Am 7 / G / Am 7onG
G A F#m7 Bm7 Em7
小さい頃は 神 さまがいて
C Am7 D
不思議に夢をか なえてくれた
G A F#m7 Bm7 Em7
やさしい気持で 目覚 めた 朝は
C Am7 D Bm7 B7
おとなになっても 奇跡はおこる よ
Em C Em C
カーテンを開いて 静かな木洩れ陽の
Am7 Bm7 Em
やさしさに包まれたなら きっと
C Am7 Am7onD
目につうる全てのことは メッセージ`;

    // テキストエリアにサンプルをセット
    inputText.value = sampleText;

    // 初期表示
    const html = processAutoDetectMode(sampleText);
    outputArea.innerHTML = html;
});
