import fs from 'fs';
import path from 'path';

const transcriptPath = path.join(process.env.APPDATA || process.env.LOCALAPPDATA || 'C:\\Users\\AA MEDIA\\AppData\\Roaming', '..', '..', '.gemini', 'antigravity', 'brain', '09af1d77-5c81-4360-816c-f9d296d59df1', '.system_generated', 'logs', 'transcript_full.jsonl');
const actualPath = 'C:\\Users\\AA MEDIA\\.gemini\\antigravity\\brain\\09af1d77-5c81-4360-816c-f9d296d59df1\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(actualPath, 'utf8').split('\n');
let pdfText = '';
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.type === 'USER_INPUT' && entry.content.includes('==Start of PDF==')) {
      const match = entry.content.match(/==Start of PDF==([\s\S]*?)==End of PDF==/);
      if (match) {
        pdfText = match[1];
        break;
      }
    }
  } catch (e) {}
}

if (pdfText) {
  fs.writeFileSync('D:\\LessonPal\\science_pdf.txt', pdfText);
  console.log('Successfully extracted science_pdf.txt');
} else {
  console.log('Failed to find PDF text in transcript');
}
