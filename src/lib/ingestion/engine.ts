import fs from 'fs';
import path from 'path';
import { CurriculumSourceInfo, ValidationReport } from './types';
import { CurriculumParser } from './parser';
import { CurriculumValidator } from './validator';
import { CurriculumSequencer } from './sequencer';
import { TeachingSupportGenerator } from './generator';
import { CurriculumImporter } from './importer';
import { CurriculumVerifier } from './verifier';

export class IngestionEngine {
  
  static async run(info: CurriculumSourceInfo, dbUrl: string, outputDir: string, dryRun: boolean = false): Promise<void> {
    console.log(`Starting ${dryRun ? 'DRY-RUN ' : ''}ingestion pipeline for ${info.classLevel} - ${info.subject}`);

    // 1. Parse
    console.log(`1. Extracting and parsing official structure...`);
    const parsedIndicators = CurriculumParser.parse(info);
    
    // 2. Validate
    console.log(`2. Validating parsed indicators...`);
    const { uniqueIndicators, report } = CurriculumValidator.validate(parsedIndicators, info);
    
    // 3. Save Structured JSON (Persistent Storage)
    console.log(`3. Saving validated structured data...`);
    const baseDir = path.join(outputDir, info.classLevel.toLowerCase().replace(/ /g, '-'), info.subject.toLowerCase().replace(/ /g, '-'));
    fs.mkdirSync(baseDir, { recursive: true });
    
    fs.writeFileSync(path.join(baseDir, 'source.json'), JSON.stringify(info, null, 2));
    fs.writeFileSync(path.join(baseDir, 'indicators.json'), JSON.stringify(uniqueIndicators, null, 2));
    fs.writeFileSync(path.join(baseDir, 'validation.json'), JSON.stringify(report, null, 2));

    this.printValidationReport(report);

    if (!report.isSafeToContinue) {
      throw new Error(`Validation failed. Halting ingestion. Please review ${path.join(baseDir, 'validation.json')}`);
    }

    // 4. Sequence
    console.log(`4. Generating teaching sequence...`);
    const sequencedSessions = CurriculumSequencer.distribute(uniqueIndicators, info);
    fs.writeFileSync(path.join(baseDir, 'sequence.json'), JSON.stringify(sequencedSessions, null, 2));

    // 5. Generate Teaching Support
    console.log(`5. Generating teaching support materials...`);
    const durationMinutes = info.timeAllocation?.periodDurationMinutes || 60;
    const supportList = TeachingSupportGenerator.generate(sequencedSessions, uniqueIndicators, durationMinutes);
    fs.writeFileSync(path.join(baseDir, 'lessons.json'), JSON.stringify(supportList, null, 2));

    if (dryRun) {
        console.log(`6. DRY-RUN MODE: Skipping database ingestion...`);
        console.log(`7. DRY-RUN MODE: Skipping post-ingestion database verification...`);
        console.log(`FINAL STATUS: ${info.classLevel.toUpperCase()} ${info.subject.toUpperCase()} DRY-RUN: PASS`);
        return;
    }

    // 6. DB Ingestion
    console.log(`6. Executing idempotent database ingestion...`);
    await CurriculumImporter.ingest(dbUrl, info, uniqueIndicators, supportList);

    // 7. Post-Ingestion Verification
    console.log(`7. Running post-ingestion verification...`);
    const verification = await CurriculumVerifier.verify(dbUrl, info);
    
    const isPass = verification.missing === 0 && verification.duplicates === 0 && verification.provenancePass && verification.seqProvenancePass && verification.usersIntact;
    
    console.log(`INGESTION VERIFICATION FOR ${info.classLevel.toUpperCase()} ${info.subject.toUpperCase()}: ${isPass ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`Official indicators in DB: ${verification.indicators}`);
    console.log(`Indicators scheduled: ${verification.scheduled}/${verification.indicators}`);
    console.log(`Indicators missing: ${verification.missing}`);
    console.log(`Teaching sessions: ${verification.sessions}`);
    console.log(`Term 1: ${verification.term1}`);
    console.log(`Term 2: ${verification.term2}`);
    console.log(`Term 3: ${verification.term3}`);
    console.log(`Duplicate official indicator records: ${verification.duplicates}`);
    console.log(`Invalid/missing indicator references: ${verification.invalidRefs}`);
    console.log(`Official NaCCA provenance: ${verification.provenancePass ? 'PASS' : 'FAIL'}`);
    console.log(`LessonPal-generated sequencing provenance: ${verification.seqProvenancePass ? 'PASS' : 'FAIL'}`);
    console.log(`Existing users/unrelated data intact: ${verification.usersIntact ? 'PASS' : 'FAIL'}`);
    console.log(`Lesson retrieval: ${verification.lessonRetrievalPass ? 'PASS' : 'FAIL'}`);
    console.log('');
    
    if (isPass) {
      console.log(`FINAL STATUS: ${info.classLevel.toUpperCase()} ${info.subject.toUpperCase()} INGESTION: PASS`);
    } else {
      console.log(`FINAL STATUS: ${info.classLevel.toUpperCase()} ${info.subject.toUpperCase()} INGESTION: FAIL`);
    }
  }

  private static printValidationReport(report: ValidationReport) {
    console.log(`\nCURRICULUM PARSING REPORT`);
    console.log(`Class: ${report.classLevel}`);
    console.log(`Subject: ${report.subject}`);
    console.log(`Source: ${report.source}`);
    console.log(`Strands: ${report.strands}`);
    console.log(`Sub-Strands: ${report.subStrands}`);
    console.log(`Content Standards: ${report.contentStandards}`);
    console.log(`Indicators: ${report.indicators}`);
    console.log(`Duplicates: ${report.duplicates}`);
    console.log(`Malformed Indicators: ${report.malformedIndicators}`);
    console.log(`Outside-Class Indicators: ${report.outsideClassIndicators}`);
    console.log(`Missing Descriptions: ${report.missingDescriptions}`);
    console.log(`SAFE TO CONTINUE: ${report.isSafeToContinue ? 'YES' : 'NO'}\n`);
  }
}
