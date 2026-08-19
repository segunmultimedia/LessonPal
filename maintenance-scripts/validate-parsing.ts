import fs from 'fs';
const pdfParse = require('pdf-parse');

const pdfPath = 'C:\\Users\\AA MEDIA\\.gemini\\antigravity\\brain\\b026d757-1cdd-4d24-9e3d-4d67975aee22\\.user_uploaded\\media_1787001712340.pdf';
const txtPath = 'd:\\LessonPal\\pdf_text.txt';
const jsonPath = 'd:\\LessonPal\\b4-english-indicators.json';

async function validate() {
  console.log("1. Extracting PDF...");
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  fs.writeFileSync(txtPath, data.text);
  
  const text = fs.readFileSync(txtPath, 'utf8');
  
  const b4Start = text.indexOf('BASIC 4');
  const b5Start = text.indexOf('BASIC 5');
  
  if (b4Start === -1) throw new Error("BASIC 4 not found");
  if (b5Start === -1) throw new Error("BASIC 5 not found");
  
  console.log(`BASIC 4 found at index ${b4Start}`);
  console.log(`BASIC 5 found at index ${b5Start}`);
  
  const b4Text = text.substring(b4Start, b5Start > -1 ? b5Start : undefined);
  
  console.log("2. Parsing Indicators...");
  const indicatorRegex = /B4\.\s*(\d+)\.\s*(\d+)\.\s*(\d+)\.\s*(\d+)\.?\s*([\s\S]*?)(?=B4\.\s*\d+\.\s*\d+\.\s*\d+\.\s*\d+\.?|$)/g;
  
  const extracted = [];
  let match;
  while ((match = indicatorRegex.exec(b4Text)) !== null) {
    const strandNum = parseInt(match[1]);
    const subStrandNum = parseInt(match[2]);
    const contentStdNum = parseInt(match[3]);
    const indicatorNum = parseInt(match[4]);
    let content = match[5].trim();
    
    const nextHeaderMatch = content.match(/Sub-Strand \d+|STRAND \d+/i);
    if (nextHeaderMatch && nextHeaderMatch.index !== undefined) {
      content = content.substring(0, nextHeaderMatch.index).trim();
    }
    
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const description = lines[0] || '';
    const exemplars = lines.slice(1).join('\n');
    
    const code = `B4.${strandNum}.${subStrandNum}.${contentStdNum}.${indicatorNum}`;
    
    extracted.push({
      code, strandNum, subStrandNum, contentStdNum, indicatorNum, description, exemplars
    });
  }
  
  const uniqueMap = new Map();
  for (const ind of extracted) {
    if (!uniqueMap.has(ind.code)) {
      uniqueMap.set(ind.code, ind);
    }
  }
  const unique = Array.from(uniqueMap.values());
  
  console.log(`Parsed exactly ${unique.length} official NaCCA indicators.`);
  
  // Validation constraints
  let emptyCodeCount = 0;
  let emptyDescCount = 0;
  unique.forEach(u => {
    if (!u.code) emptyCodeCount++;
    if (!u.description) emptyDescCount++;
  });
  console.log(`Empty codes: ${emptyCodeCount}, Empty descriptions: ${emptyDescCount}`);
  
  // Dump to JSON
  fs.writeFileSync(jsonPath, JSON.stringify(unique, null, 2));
  console.log(`Saved ${unique.length} indicators to ${jsonPath}`);
  
  console.log("3. Mapping Sessions...");
  const sessions = distributeToSessions(unique);
  
  const termsCount = { 1: 0, 2: 0, 3: 0 };
  let missingIndicators = 0;
  sessions.forEach(s => {
    termsCount[s.term as 1|2|3]++;
    if (!s.indicatorCode || !uniqueMap.has(s.indicatorCode)) missingIndicators++;
  });
  
  console.log(`Total sessions: ${sessions.length}`);
  console.log(`Term 1: ${termsCount[1]}`);
  console.log(`Term 2: ${termsCount[2]}`);
  console.log(`Term 3: ${termsCount[3]}`);
  console.log(`Missing indicators: ${missingIndicators}`);
}

function distributeToSessions(indicatorsList: any[]) {
  const sessions = [];
  const term1Count = 40;
  const term2Count = 31;
  const term3Count = 23;
  
  let currentTerm = 1;
  let currentWeek = 1;
  let currentLessonInWeek = 1;
  let totalSessionsGenerated = 0;
  
  const targetSessions: Record<number, number> = { 1: 55, 2: 45, 3: 45 };
  const recurringCodes = ['B4.2.9.1.1', 'B4.4.2.1.1', 'B4.6.1.1.1', 'B4.1.10.3.7'];
  
  let indicatorIdx = 0;
  
  function advanceTime() {
    currentLessonInWeek++;
    if (currentLessonInWeek > 5) {
      currentLessonInWeek = 1;
      currentWeek++;
    }
  }
  
  for (let i = 0; i < term1Count; i++) {
    if (indicatorIdx >= indicatorsList.length) break;
    const ind = indicatorsList[indicatorIdx++];
    const numSessions = (i < 5 || recurringCodes.includes(ind.code)) ? 2 : 1;
    for (let s = 0; s < numSessions; s++) {
      if (totalSessionsGenerated >= targetSessions[1]) break;
      sessions.push({ term: 1, week: currentWeek, lessonNumber: currentLessonInWeek, indicatorCode: ind.code, description: ind.description, isRecurring: recurringCodes.includes(ind.code) });
      totalSessionsGenerated++;
      advanceTime();
    }
  }
  
  currentTerm = 2; currentWeek = 1; currentLessonInWeek = 1; totalSessionsGenerated = 0;
  for (let i = 0; i < term2Count; i++) {
    if (indicatorIdx >= indicatorsList.length) break;
    const ind = indicatorsList[indicatorIdx++];
    const numSessions = (i % 3 === 0 || recurringCodes.includes(ind.code)) ? 2 : 1;
    for (let s = 0; s < numSessions; s++) {
      if (totalSessionsGenerated >= targetSessions[2]) break;
      sessions.push({ term: 2, week: currentWeek, lessonNumber: currentLessonInWeek, indicatorCode: ind.code, description: ind.description, isRecurring: recurringCodes.includes(ind.code) });
      totalSessionsGenerated++;
      advanceTime();
    }
  }
  
  currentTerm = 3; currentWeek = 1; currentLessonInWeek = 1; totalSessionsGenerated = 0;
  for (let i = 0; i < term3Count; i++) {
    if (indicatorIdx >= indicatorsList.length) break;
    const ind = indicatorsList[indicatorIdx++];
    const numSessions = 2;
    for (let s = 0; s < numSessions; s++) {
      if (totalSessionsGenerated >= targetSessions[3]) break;
      sessions.push({ term: 3, week: currentWeek, lessonNumber: currentLessonInWeek, indicatorCode: ind.code, description: ind.description, isRecurring: recurringCodes.includes(ind.code) });
      totalSessionsGenerated++;
      advanceTime();
    }
  }
  
  return sessions;
}

validate().catch(console.error);
