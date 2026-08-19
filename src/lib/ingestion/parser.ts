import fs from 'fs';
import { CurriculumSourceInfo, ParsedIndicator } from './types';

// Fallback if needed, but modern Node has standard methods or we can just accept raw text
export class CurriculumParser {
  
  static readonly CLASS_PREFIXES: Record<string, string> = {
    'BASIC 1': 'B1',
    'BASIC 2': 'B2',
    'BASIC 3': 'B3',
    'BASIC 4': 'B4',
    'BASIC 5': 'B5',
    'BASIC 6': 'B6',
    'JHS 1': 'B7',
    'JHS 2': 'B8',
    'JHS 3': 'B9'
  };

  static readonly CLASS_SEQUENCE = [
    'BASIC 1', 'BASIC 2', 'BASIC 3', 'BASIC 4', 'BASIC 5', 'BASIC 6', 'JHS 1', 'JHS 2', 'JHS 3'
  ];

  static extractClassText(fullText: string, classLevel: string): string {
    const classUpper = classLevel.toUpperCase();
    const prefix = this.CLASS_PREFIXES[classUpper] || 'B';
    
    // To avoid Table of Contents, we look for the first indicator of this class (e.g. B5.1.1)
    const firstIndicator = `${prefix}.1.1`;
    let startIndex = fullText.indexOf(firstIndicator);
    
    if (startIndex === -1) {
      // Fallback: last occurrence of "BASIC X"
      startIndex = fullText.lastIndexOf(classUpper);
      if (startIndex === -1) {
        throw new Error(`Class boundary not found for: ${classLevel}`);
      }
    }

    // Find the next class to know where to stop
    const currentClassIdx = this.CLASS_SEQUENCE.indexOf(classUpper);
    let endIndex = -1;
    
    if (currentClassIdx !== -1 && currentClassIdx < this.CLASS_SEQUENCE.length - 1) {
      for (let i = currentClassIdx + 1; i < this.CLASS_SEQUENCE.length; i++) {
        const nextClass = this.CLASS_SEQUENCE[i];
        const nextPrefix = this.CLASS_PREFIXES[nextClass];
        if (nextPrefix) {
          const nextFirstIndicator = `${nextPrefix}.1.1`;
          const nextIdx = fullText.indexOf(nextFirstIndicator, startIndex);
          if (nextIdx !== -1) {
            endIndex = nextIdx;
            break;
          }
        }
      }
    }

    if (endIndex === -1) {
      return fullText.substring(startIndex);
    }
    
    return fullText.substring(startIndex, endIndex);
  }

  static parseIndicators(classText: string, classLevel: string): ParsedIndicator[] {
    const classUpper = classLevel.toUpperCase();
    const prefix = this.CLASS_PREFIXES[classUpper] || 'B';
    
    // Generic regex to match Indicator codes like B5.1.1.1.1
    // It captures the 4 numbers and the subsequent text
    const escapedPrefix = prefix.replace(/\./g, '\\.');
    const regexSource = `${escapedPrefix}\\.\\s*(\\d+)\\.\\s*(\\d+)\\.\\s*(\\d+)\\.\\s*(\\d+)\\.?\\s*(.*?)(?=${escapedPrefix}\\.\\s*\\d+\\.\\s*\\d+\\.\\s*\\d+\\.\\s*\\d+\\.?|$)`;
    const indicatorRegex = new RegExp(regexSource, 'gs');

    const extracted: ParsedIndicator[] = [];
    let match;
    while ((match = indicatorRegex.exec(classText)) !== null) {
      const strandNum = parseInt(match[1]);
      const subStrandNum = parseInt(match[2]);
      const contentStdNum = parseInt(match[3]);
      const indicatorNum = parseInt(match[4]);
      let content = match[5].trim();
      
      // Try to find the next major header that signifies the end of this indicator's exemplars
      const nextHeaderMatch = content.match(/Sub-Strand \d+|STRAND \d+|Content Standard/i);
      if (nextHeaderMatch && nextHeaderMatch.index !== undefined) {
        content = content.substring(0, nextHeaderMatch.index).trim();
      }
      
      const lines = content.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
      const description = lines[0] || '';
      const exemplars = lines.slice(1).join('\\n');
      
      const code = `${prefix}.${strandNum}.${subStrandNum}.${contentStdNum}.${indicatorNum}`;
      
      extracted.push({
        code, 
        strandNum, 
        subStrandNum, 
        contentStdNum, 
        indicatorNum, 
        description, 
        exemplars
      });
    }
    
    return extracted;
  }

  static parse(info: CurriculumSourceInfo): ParsedIndicator[] {
    if (!info.textContent) {
      throw new Error("textContent must be provided (PDF extraction should happen prior to this engine layer).");
    }
    
    const classText = this.extractClassText(info.textContent, info.classLevel);
    return this.parseIndicators(classText, info.classLevel);
  }
}
