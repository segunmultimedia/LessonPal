import fs from 'fs';

function find() {
  const txt = fs.readFileSync('C:/Users/AA MEDIA/.gemini/antigravity/brain/09af1d77-5c81-4360-816c-f9d296d59df1/.system_generated/logs/transcript_full.jsonl', 'utf8');
  const lines = txt.trim().split('\n');
  
  for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.length > 50000 && line.includes('==Start of PDF==')) {
         console.log("Found very long line:", line.length);
         const obj = JSON.parse(line);
         console.log(Object.keys(obj));
         if (obj.parts) console.log("Has parts");
         
         const text = typeof obj.content === 'string' ? obj.content : JSON.stringify(obj);
         const start = text.indexOf('==Start of PDF==');
         const end = text.lastIndexOf('==End of PDF==');
         
         if (start !== -1 && end !== -1) {
            let pdfText = text.substring(start + 16, end).trim();
            pdfText = pdfText.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            fs.writeFileSync('maths_pdf.txt', pdfText);
            console.log('Successfully wrote', pdfText.length, 'bytes');
            return;
         }
      }
  }
}
find();
