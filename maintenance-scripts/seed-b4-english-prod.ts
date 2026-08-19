import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';
import { eq, and } from 'drizzle-orm';
import {
  countries, curricula, academicLevels, classLevels, subjects,
  classLevelSubjects, academicTerms, strands, subStrands,
  contentStandards, indicators, curriculumSources,
} from './src/lib/db/schema/curriculum';
import {
  curriculumLessons, lessonExercises, exerciseQuestions
} from './src/lib/db/schema/curriculum_library';

config({ path: join(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function extractIndicatorsFromText() {
  const json = fs.readFileSync('d:\\LessonPal\\b4-english-indicators.json', 'utf8');
  return JSON.parse(json);
}

function distributeToSessions(indicatorsList: { code: string, description: string, strandNum: number, subStrandNum: number, contentStdNum: number, indicatorNum: number, exemplars: string }[]) {
  const sessions: any[] = [];
  const totalIndicators = indicatorsList.length; // Expected 130
  
  const term1Count = Math.floor(totalIndicators / 3);
  const term2Count = Math.floor(totalIndicators / 3);
  const term3Count = totalIndicators - term1Count - term2Count;
  
  let currentTerm = 1;
  let currentWeek = 1;
  let currentLessonInWeek = 1;
  
  const recurringCodes = ['B4.2.9.1.1', 'B4.4.2.1.1', 'B4.6.1.1.1', 'B4.1.10.3.7'];
  let indicatorIdx = 0;
  
  function advanceTime(term: number) {
    currentLessonInWeek++;
    if (currentLessonInWeek > 5) {
      currentLessonInWeek = 1;
      currentWeek++;
    }
  }
  
  function assignTerm(count: number, term: number) {
    currentTerm = term;
    currentWeek = 1;
    currentLessonInWeek = 1;
    
    for (let i = 0; i < count; i++) {
      if (indicatorIdx >= totalIndicators) break;
      const ind = indicatorsList[indicatorIdx++];
      
      const isFoundational = (term === 1 && i < 10);
      const numSessions = (isFoundational || recurringCodes.includes(ind.code)) ? 2 : 1;
      
      for (let s = 0; s < numSessions; s++) {
        sessions.push({
          term: currentTerm,
          week: currentWeek,
          lessonNumber: currentLessonInWeek,
          indicatorCode: ind.code,
          description: ind.description,
          isRecurring: recurringCodes.includes(ind.code)
        });
        advanceTime(term);
      }
    }
  }
  
  assignTerm(term1Count, 1);
  assignTerm(term2Count, 2);
  assignTerm(term3Count, 3);
  
  return sessions;
}

async function run() {
  console.log("=== BASIC 4 ENGLISH CURRICULUM INGESTION ===");
  
  const extractedIndicators = await extractIndicatorsFromText();
  console.log(`Parsed ${extractedIndicators.length} official NaCCA indicators.`);
  
  if (extractedIndicators.length === 0) {
    console.error("Failed to parse indicators. Aborting.");
    process.exit(1);
  }

  const teachingSessions = distributeToSessions(extractedIndicators);
  console.log(`Generated ${teachingSessions.length} LessonPal teaching sessions.`);

  await db.transaction(async (tx) => {
    console.log("Starting transactional ingestion...");
    
    // A. Curriculum Source
    let [source] = await tx.select().from(curriculumSources).where(eq(curriculumSources.title, 'English Language Curriculum for Primary Schools (Basic 4 - 6)')).limit(1);
    if (!source) {
      [source] = await tx.insert(curriculumSources).values({
        title: 'English Language Curriculum for Primary Schools (Basic 4 - 6)',
        sourceType: 'OFFICIAL_NACCA',
        urlOrReference: 'NaCCA PDF, September 2019',
        versionYear: '2019'
      }).returning();
    }
    
    // B. Curriculum & Country
    let [country] = await tx.select().from(countries).where(eq(countries.code, 'GHA')).limit(1);
    if (!country) {
      [country] = await tx.insert(countries).values({ name: 'Ghana', code: 'GHA' }).returning();
    }
    
    let [curriculum] = await tx.select().from(curricula).where(and(eq(curricula.countryId, country.id), eq(curricula.name, 'NaCCA National Curriculum'))).limit(1);
    if (!curriculum) {
      [curriculum] = await tx.insert(curricula).values({
        countryId: country.id,
        name: 'NaCCA National Curriculum',
        version: '2019'
      }).returning();
    }

    // C. Levels & Subjects
    let [academicLevel] = await tx.select().from(academicLevels).where(and(eq(academicLevels.curriculumId, curriculum.id), eq(academicLevels.name, 'Basic School'))).limit(1);
    if (!academicLevel) {
      [academicLevel] = await tx.insert(academicLevels).values({
        curriculumId: curriculum.id,
        name: 'Basic School',
        sortOrder: 1
      }).returning();
    }

    let [classLevel] = await tx.select().from(classLevels).where(and(eq(classLevels.academicLevelId, academicLevel.id), eq(classLevels.name, 'Basic 4'))).limit(1);
    if (!classLevel) {
      [classLevel] = await tx.insert(classLevels).values({
        academicLevelId: academicLevel.id,
        name: 'Basic 4',
        shortName: 'B4',
        sortOrder: 4
      }).returning();
    }

    let [subject] = await tx.select().from(subjects).where(and(eq(subjects.curriculumId, curriculum.id), eq(subjects.name, 'English Language'))).limit(1);
    if (!subject) {
      [subject] = await tx.insert(subjects).values({
        curriculumId: curriculum.id,
        name: 'English Language',
        code: 'ENG'
      }).returning();
    }

    let [cls] = await tx.select().from(classLevelSubjects).where(and(eq(classLevelSubjects.classLevelId, classLevel.id), eq(classLevelSubjects.subjectId, subject.id))).limit(1);
    if (!cls) {
      await tx.insert(classLevelSubjects).values({ classLevelId: classLevel.id, subjectId: subject.id });
    }

    // D. Terms
    const termIds: Record<number, string> = {};
    for (let t = 1; t <= 3; t++) {
      let [term] = await tx.select().from(academicTerms).where(and(eq(academicTerms.curriculumId, curriculum.id), eq(academicTerms.termNumber, t))).limit(1);
      if (!term) {
        [term] = await tx.insert(academicTerms).values({
          curriculumId: curriculum.id,
          name: `Term ${t}`,
          termNumber: t,
          totalWeeks: 12,
          sortOrder: t
        }).returning();
      }
      termIds[t] = term.id;
    }

    // E. Insert Indicators Hierarchically
    const indicatorMap: Record<string, string> = {};
    
    for (const ind of extractedIndicators) {
      // Strand
      let [strandRec] = await tx.select().from(strands).where(and(eq(strands.subjectId, subject.id), eq(strands.classLevelId, classLevel.id), eq(strands.sortOrder, ind.strandNum))).limit(1);
      if (!strandRec) {
        [strandRec] = await tx.insert(strands).values({
          subjectId: subject.id,
          classLevelId: classLevel.id,
          name: `Strand ${ind.strandNum}`,
          sortOrder: ind.strandNum
        }).returning();
      }
      
      // Sub-Strand
      let [subStrandRec] = await tx.select().from(subStrands).where(and(eq(subStrands.strandId, strandRec.id), eq(subStrands.sortOrder, ind.subStrandNum))).limit(1);
      if (!subStrandRec) {
        [subStrandRec] = await tx.insert(subStrands).values({
          strandId: strandRec.id,
          name: `Sub-Strand ${ind.subStrandNum}`,
          sortOrder: ind.subStrandNum
        }).returning();
      }

      // Content Standard
      let [csRec] = await tx.select().from(contentStandards).where(and(eq(contentStandards.subStrandId, subStrandRec.id), eq(contentStandards.code, `B4.${ind.strandNum}.${ind.subStrandNum}.${ind.contentStdNum}`))).limit(1);
      if (!csRec) {
        [csRec] = await tx.insert(contentStandards).values({
          subStrandId: subStrandRec.id,
          description: `Content Standard ${ind.strandNum}.${ind.subStrandNum}.${ind.contentStdNum}`,
          code: `B4.${ind.strandNum}.${ind.subStrandNum}.${ind.contentStdNum}`,
          sortOrder: ind.contentStdNum
        }).returning();
      }

      // Indicator
      let [indicatorRec] = await tx.select().from(indicators).where(and(eq(indicators.contentStandardId, csRec.id), eq(indicators.code, ind.code))).limit(1);
      if (!indicatorRec) {
        [indicatorRec] = await tx.insert(indicators).values({
          contentStandardId: csRec.id,
          description: ind.description,
          code: ind.code,
          sortOrder: ind.indicatorNum
        }).returning();
      }
      
      indicatorMap[ind.code] = indicatorRec.id;
    }

    console.log("Indicators inserted successfully.");

    // F. Insert LessonPal Teaching Sessions
    for (const session of teachingSessions) {
      const isExampleLesson = session.term === 1 && session.week === 1 && session.lessonNumber === 1;
      
      const topic = isExampleLesson ? 'Listening to and Singing Familiar Songs' : `Lesson on ${session.indicatorCode}`;
      const learningObjective = isExampleLesson ? 'By the end of the lesson, pupils will be able to sing familiar songs with correct stress and rhythm.' : `Objective for ${session.indicatorCode}`;
      const whatToTeach = isExampleLesson ? 'A song is a musical composition with words. Singing helps us learn pronunciation, rhythm, and stress.' : `Explanation of ${session.indicatorCode}`;
      const howToTeach = isExampleLesson ? 'Step 1: Ask pupils to name their favorite songs.\nStep 2: Sing a familiar song while clapping the rhythm.\nStep 3: Group singing competition.' : `Procedure for ${session.indicatorCode}`;
      const activities = isExampleLesson ? 'Suggested Activity: Use a familiar song such as the National Anthem or a traditional folk song. Have groups perform.' : 'Practical activities...';
      const resources = isExampleLesson ? 'Audio player, chalkboard' : 'Textbooks';
      const durationMinutes = session.isRecurring ? 30 : 60;

      let [insertedLesson] = await tx.select().from(curriculumLessons).where(and(
        eq(curriculumLessons.classLevelId, classLevel.id),
        eq(curriculumLessons.subjectId, subject.id),
        eq(curriculumLessons.academicTermId, termIds[session.term] as string),
        eq(curriculumLessons.weekNumber, session.week),
        eq(curriculumLessons.lessonNumber, session.lessonNumber),
        eq(curriculumLessons.indicatorId, indicatorMap[session.indicatorCode] as string)
      )).limit(1);

      if (!insertedLesson) {
        [insertedLesson] = await tx.insert(curriculumLessons).values({
          classLevelId: classLevel.id,
          subjectId: subject.id,
          academicTermId: termIds[session.term],
          weekNumber: session.week,
          lessonNumber: session.lessonNumber,
          sourceId: source.id,
          indicatorId: indicatorMap[session.indicatorCode],
          contentSourceStatus: 'OFFICIAL_NACCA',
          sequenceSourceStatus: 'LESSONPAL_GENERATED_SEQUENCE',
          supportSourceStatus: 'LESSONPAL_GENERATED',
          topic: topic,
          learningObjective: learningObjective,
          whatToTeach: whatToTeach,
          howToTeach: howToTeach,
          activities: activities,
          resources: resources,
          durationMinutes: durationMinutes
        }).returning();
      }

      // Insert exercises for the lesson
      let [exercise1] = await tx.select().from(lessonExercises).where(and(eq(lessonExercises.curriculumLessonId, insertedLesson.id), eq(lessonExercises.title, 'Basic Understanding'))).limit(1);
      if (!exercise1) {
        [exercise1] = await tx.insert(lessonExercises).values({
          curriculumLessonId: insertedLesson.id,
          title: 'Basic Understanding',
          sortOrder: 1
        }).returning();
      }

      let [question1] = await tx.select().from(exerciseQuestions).where(and(eq(exerciseQuestions.exerciseId, exercise1.id), eq(exerciseQuestions.sortOrder, 1))).limit(1);
      if (!question1) {
        await tx.insert(exerciseQuestions).values({
          exerciseId: exercise1.id,
          question: isExampleLesson ? 'What is a song?' : 'Question 1',
          answer: isExampleLesson ? 'A musical composition with words.' : 'Answer 1',
          sortOrder: 1
        });
      }
    }

    console.log("Teaching sessions inserted successfully.");
  });

  console.log("=== INGESTION COMPLETE ===");
  process.exit(0);
}

run().catch(console.error);
