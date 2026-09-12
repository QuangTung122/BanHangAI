const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\NGO TUNG\\.gemini\\antigravity-cli\\brain';
const outputFilePath = 'D:\\BanHangAI\\docs\\Toan_Bo_Lich_Su_Chat.txt';
let allPrompts = [];

function walkSync(currentDirPath, callback) {
    if (!fs.existsSync(currentDirPath)) return;
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && name === 'transcript.jsonl') {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(brainDir, function(filePath, stat) {
    const mtime = stat.mtime;
    // Filter for dates between Aug 29 and Sep 4
    if (mtime >= new Date('2026-08-29') && mtime <= new Date('2026-09-05')) {
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const obj = JSON.parse(line);
                if (obj.type === 'USER_INPUT' && obj.content) {
                    // Clean up tags and newlines
                    let text = obj.content.replace(/<USER_REQUEST>/g, '').replace(/<\/USER_REQUEST>/g, '').replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '').replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '').trim();
                    text = text.replace(/\r?\n|\r/g, ' ');
                    allPrompts.push(`[${obj.created_at}] Tôi nhắn:\n${text}`);
                }
            } catch(e) {}
        }
    }
});

// Sort chronologically
allPrompts.sort();

fs.writeFileSync(outputFilePath, allPrompts.join('\n\n--------------------------------------------------\n\n'), 'utf-8');
console.log(`Đã trích xuất ${allPrompts.length} đoạn chat vào ${outputFilePath}`);
