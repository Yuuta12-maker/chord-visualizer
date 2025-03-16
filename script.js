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
    const rootPattern = /^([A-G][#b]?)/;
    const match = chord.match(rootPattern);

    if (match) {
        const root = match[1];
        const remainder = chord.substring(root.length);
        return [root, remainder];
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

// コードと歌詞の行を交互に処理
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

// ボタンクリック時のイベント処理
document.addEventListener('DOMContentLoaded', function() {
    const processButton = document.getElementById('process-button');
    const inputText = document.getElementById('input-text');
    const outputArea = document.getElementById('output-area');

    processButton.addEventListener('click', function() {
        const input = inputText.value;
        const html = processChordLyricLines(input);
        outputArea.innerHTML = html;
    });
});
