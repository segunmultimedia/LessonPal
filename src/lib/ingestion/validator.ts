import { ParsedIndicator, ValidationReport, CurriculumSourceInfo } from './types';

export class CurriculumValidator {
  
  static validate(indicators: ParsedIndicator[], info: CurriculumSourceInfo): { uniqueIndicators: ParsedIndicator[], report: ValidationReport } {
    const classUpper = info.classLevel.toUpperCase();
    // basic mapping for prefix
    const expectedPrefix = classUpper.includes('JHS') ? 'B' : (classUpper.startsWith('BASIC') ? 'B' + classUpper.split(' ')[1] : 'B');

    let duplicates = 0;
    let malformedIndicators = 0;
    let outsideClassIndicators = 0;
    let missingDescriptions = 0;

    const uniqueMap = new Map<string, ParsedIndicator>();
    const strandsSet = new Set<number>();
    const subStrandsSet = new Set<string>();
    const contentStandardsSet = new Set<string>();

    for (const ind of indicators) {
      // Check prefix
      if (!ind.code.startsWith(expectedPrefix + '.')) {
        outsideClassIndicators++;
      }

      // Check malformed
      if (isNaN(ind.strandNum) || isNaN(ind.subStrandNum) || isNaN(ind.contentStdNum) || isNaN(ind.indicatorNum)) {
        malformedIndicators++;
      }

      if (!ind.description) {
        missingDescriptions++;
      }

      if (uniqueMap.has(ind.code)) {
        duplicates++;
        // Merge the content to prevent losing continuation text across page breaks
        const existing = uniqueMap.get(ind.code)!;
        if (ind.description && ind.description.trim() !== '') {
          existing.description += ' ' + ind.description.trim();
        }
        if (ind.exemplars && ind.exemplars.trim() !== '') {
          existing.exemplars += '\n' + ind.exemplars.trim();
        }
      } else {
        uniqueMap.set(ind.code, ind);
        strandsSet.add(ind.strandNum);
        subStrandsSet.add(`${ind.strandNum}.${ind.subStrandNum}`);
        contentStandardsSet.add(`${ind.strandNum}.${ind.subStrandNum}.${ind.contentStdNum}`);
      }
    }

    const uniqueIndicators = Array.from(uniqueMap.values());

    const isSafeToContinue = malformedIndicators === 0 
                          && outsideClassIndicators === 0 
                          && missingDescriptions === 0;

    const report: ValidationReport = {
      classLevel: info.classLevel,
      subject: info.subject,
      source: info.sourceType,
      strands: strandsSet.size,
      subStrands: subStrandsSet.size,
      contentStandards: contentStandardsSet.size,
      indicators: uniqueIndicators.length,
      duplicates,
      malformedIndicators,
      outsideClassIndicators,
      missingDescriptions,
      isSafeToContinue
    };

    return { uniqueIndicators, report };
  }
}
