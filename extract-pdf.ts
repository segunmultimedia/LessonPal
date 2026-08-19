import fs from 'fs';

function extract() {
  const txt = fs.readFileSync('C:/Users/AA MEDIA/.gemini/antigravity/brain/09af1d77-5c81-4360-816c-f9d296d59df1/.system_generated/logs/transcript_full.jsonl', 'utf8');
  
  // Find the exact marker for the math PDF
  const marker = '==Start of PDF==\\n==Screenshot for page 1==';
  let startIdx = txt.lastIndexOf(marker);
  
  if (startIdx === -1) {
    const markerUnescaped = '==Start of PDF==\n==Screenshot for page 1==';
    startIdx = txt.lastIndexOf(markerUnescaped);
    if (startIdx === -1) {
       console.log('Marker not found');
       return;
    }
  }
  
  const endIdx = txt.indexOf('==End of PDF==', startIdx);
  if (endIdx === -1) {
    console.log('==End of PDF== not found');
    return;
  }
  
  let pdfText = txt.substring(startIdx + '==Start of PDF=='.length, endIdx);
  
  // Clean up JSON escaping if it is escaped
  pdfText = pdfText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  
  fs.writeFileSync('maths_pdf.txt', pdfText.trim());
  console.log('Successfully wrote', pdfText.length, 'bytes');
}
extract();
