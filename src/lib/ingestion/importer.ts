import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, sql } from 'drizzle-orm';
import { CurriculumSourceInfo, ParsedIndicator, TeachingSupport } from './types';
import {
  countries, curricula, academicLevels, classLevels, subjects,
  classLevelSubjects, academicTerms, strands, subStrands,
  contentStandards, indicators, curriculumSources,
} from '../db/schema/curriculum';
import {
  curriculumLessons, lessonExercises, exerciseQuestions
} from '../db/schema/curriculum_library';

export class CurriculumImporter {
  static async ingest(
    dbUrl: string, 
    info: CurriculumSourceInfo, 
    indicatorsList: ParsedIndicator[], 
    supportList: TeachingSupport[]
  ) {
    const connectionUrl = process.env.DIRECT_URL || dbUrl;
    const isDirect = !!process.env.DIRECT_URL;
    const pgClient = postgres(connectionUrl, { ssl: 'require', prepare: false });
    const db = drizzle(pgClient);

    try {
      // Disable statement timeout for this long-running ingestion
      await pgClient`SET statement_timeout = '15min'`;
      
      if (isDirect) {
        console.log('Starting ingestion using direct connection with explicit transaction...');
        await db.transaction(async (tx) => {
          await this.doIngest(tx as any, pgClient, info, indicatorsList, supportList);
        });
      } else {
        console.log('Starting ingestion without explicit transaction to avoid pooler timeout...');
        await this.doIngest(db as any, pgClient, info, indicatorsList, supportList);
      }
    } catch (e) {
      throw e;
    } finally {
      await pgClient.end();
    }
  }

  private static async doIngest(
    tx: any, 
    pgClient: postgres.Sql,
    info: CurriculumSourceInfo, 
    indicatorsList: ParsedIndicator[], 
    supportList: TeachingSupport[]
  ) {
        console.log('Inside process. A. Curriculum Source');
        const sourceTitle = `${info.subject} Curriculum for ${info.classLevel}`;
        let sourceResult = await pgClient`SELECT id FROM curriculum_sources WHERE title = ${sourceTitle} LIMIT 1`;
        let sourceId;
        if (sourceResult.length === 0) {
          const insertedSource = await pgClient`INSERT INTO curriculum_sources (title, source_type, url_or_reference, version_year) VALUES (${sourceTitle}, 'OFFICIAL_NACCA', ${info.sourceType}, ${info.versionYear}) RETURNING id`;
          sourceId = insertedSource[0].id;
        } else {
          sourceId = sourceResult[0].id;
        }

        let countryResult = await pgClient`SELECT id FROM countries WHERE code = 'GHA' LIMIT 1`;
        let countryId;
        if (countryResult.length === 0) {
          const insertedCountry = await pgClient`INSERT INTO countries (name, code) VALUES ('Ghana', 'GHA') RETURNING id`;
          countryId = insertedCountry[0].id;
        } else {
          countryId = countryResult[0].id;
        }

        let curriculumResult = await pgClient`SELECT id FROM curricula WHERE country_id = ${countryId} AND name = 'NaCCA National Curriculum' LIMIT 1`;
        let curriculumId;
        if (curriculumResult.length === 0) {
          const insertedCurriculum = await pgClient`INSERT INTO curricula (country_id, name, version) VALUES (${countryId}, 'NaCCA National Curriculum', ${info.versionYear}) RETURNING id`;
          curriculumId = insertedCurriculum[0].id;
        } else {
          curriculumId = curriculumResult[0].id;
        }

        let academicLevelName = 'Basic School';
        if (info.classLevel.match(/Basic [1-3]/i)) {
           academicLevelName = 'Lower Primary';
        } else if (info.classLevel.match(/Basic [4-6]/i)) {
           academicLevelName = 'Upper Primary';
        } else if (info.classLevel.includes('JHS')) {
           academicLevelName = 'Junior High School (JHS)';
        }
        
        let academicLevelResult = await pgClient`SELECT id FROM academic_levels WHERE curriculum_id = ${curriculumId} AND name = ${academicLevelName} LIMIT 1`;
        let academicLevelId;
        if (academicLevelResult.length === 0) {
          const insertedAcLevel = await pgClient`INSERT INTO academic_levels (curriculum_id, name, sort_order) VALUES (${curriculumId}, ${academicLevelName}, ${academicLevelName === 'Basic School' ? 1 : 2}) RETURNING id`;
          academicLevelId = insertedAcLevel[0].id;
        } else {
          academicLevelId = academicLevelResult[0].id;
        }

        let classLevelResult = await pgClient`SELECT id FROM class_levels WHERE academic_level_id = ${academicLevelId} AND name = ${info.classLevel} LIMIT 1`;
        let classLevelId;
        if (classLevelResult.length === 0) {
          const sortOrder = parseInt(info.classLevel.replace(/[^0-9]/g, '') || '0');
          const insertedClLevel = await pgClient`INSERT INTO class_levels (academic_level_id, name, sort_order) VALUES (${academicLevelId}, ${info.classLevel}, ${sortOrder}) RETURNING id`;
          classLevelId = insertedClLevel[0].id;
        } else {
          classLevelId = classLevelResult[0].id;
        }

        let subjectResult = await pgClient`SELECT id FROM subjects WHERE curriculum_id = ${curriculumId} AND name = ${info.subject} LIMIT 1`;
        let subjectId;
        if (subjectResult.length === 0) {
          const code = info.subject.substring(0, 3).toUpperCase();
          const insertedSubject = await pgClient`INSERT INTO subjects (curriculum_id, name, code) VALUES (${curriculumId}, ${info.subject}, ${code}) RETURNING id`;
          subjectId = insertedSubject[0].id;
        } else {
          subjectId = subjectResult[0].id;
        }

        const clsResult = await pgClient`SELECT class_level_id FROM class_level_subjects WHERE class_level_id = ${classLevelId} AND subject_id = ${subjectId} LIMIT 1`;
        if (clsResult.length === 0) {
          await pgClient`INSERT INTO class_level_subjects (class_level_id, subject_id) VALUES (${classLevelId}, ${subjectId})`;
        }

        const termsPerYear = info.timeAllocation?.termsPerYear || 3;
        const weeksPerTerm = info.timeAllocation?.weeksPerTerm || 12;
        const termIds: Record<number, string> = {};
        
        for (let t = 1; t <= termsPerYear; t++) {
          let termResult = await pgClient`SELECT id FROM academic_terms WHERE curriculum_id = ${curriculumId} AND term_number = ${t} LIMIT 1`;
          if (termResult.length === 0) {
            const insertedTerm = await pgClient`INSERT INTO academic_terms (curriculum_id, name, term_number, total_weeks, sort_order) VALUES (${curriculumId}, ${'Term ' + t}, ${t}, ${weeksPerTerm}, ${t}) RETURNING id`;
            termIds[t] = insertedTerm[0].id;
          } else {
            termIds[t] = termResult[0].id;
          }
        }
        
        const subject = { id: subjectId };
        const classLevel = { id: classLevelId };
        const source = { id: sourceId };


        // E. Insert Indicators Hierarchically
        const indicatorMap: Record<string, string> = {};
        
        for (const ind of indicatorsList) {
          let [strandRec] = await tx.select().from(strands).where(and(eq(strands.subjectId, subject.id), eq(strands.classLevelId, classLevel.id), eq(strands.sortOrder, ind.strandNum))).limit(1);
          if (!strandRec) {
            [strandRec] = await tx.insert(strands).values({
              subjectId: subject.id,
              classLevelId: classLevel.id,
              name: ind.strandName || `Strand ${ind.strandNum}`,
              sortOrder: ind.strandNum
            }).returning();
          }
          
          let [subStrandRec] = await tx.select().from(subStrands).where(and(eq(subStrands.strandId, strandRec.id), eq(subStrands.sortOrder, ind.subStrandNum))).limit(1);
          if (!subStrandRec) {
            [subStrandRec] = await tx.insert(subStrands).values({
              strandId: strandRec.id,
              name: ind.subStrandName || `Sub-Strand ${ind.subStrandNum}`,
              sortOrder: ind.subStrandNum
            }).returning();
          }

          const csCode = `${ind.code.split('.').slice(0, 4).join('.')}`;
          let [csRec] = await tx.select().from(contentStandards).where(and(eq(contentStandards.subStrandId, subStrandRec.id), eq(contentStandards.code, csCode))).limit(1);
          if (!csRec) {
            [csRec] = await tx.insert(contentStandards).values({
              subStrandId: subStrandRec.id,
              description: ind.contentStandardName || `Content Standard ${csCode}`,
              code: csCode,
              sortOrder: ind.contentStdNum
            }).returning();
          }

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

        // F. Insert LessonPal Teaching Sessions
        console.log('Fetching existing lessons...');
        const existingLessons = await tx.select().from(curriculumLessons).where(and(
          eq(curriculumLessons.classLevelId, classLevel.id),
          eq(curriculumLessons.subjectId, subject.id)
        ));

        const lessonMap = new Map<string, { academicTermId: string | null, weekNumber: number | null, lessonNumber: number, indicatorId: string | null, id: string }>(existingLessons.map((l: { academicTermId: string | null, weekNumber: number | null, lessonNumber: number, indicatorId: string | null, id: string }) => 
          [`${l.academicTermId}-${l.weekNumber}-${l.lessonNumber}-${l.indicatorId}`, l]
        ));

        const newLessonsToInsert: any[] = [];
        const sessionToSupport = new Map<string, TeachingSupport>();

        for (const session of supportList) {
          const key = `${termIds[session.term]}-${session.week}-${session.lessonNumber}-${indicatorMap[session.indicatorCode]}`;
          if (!lessonMap.has(key)) {
            newLessonsToInsert.push({
              classLevelId: classLevel.id,
              subjectId: subject.id,
              academicTermId: termIds[session.term],
              weekNumber: session.week,
              lessonNumber: session.lessonNumber,
              sourceId: source.id,
              indicatorId: indicatorMap[session.indicatorCode],
              contentSourceStatus: 'OFFICIAL_NACCA',
              sequenceSourceStatus: session.sequenceStatus as any,
              supportSourceStatus: 'LESSONPAL_GENERATED',
              topic: session.topic,
              learningObjective: session.learningObjective,
              whatToTeach: session.whatToTeach,
              howToTeach: session.howToTeach,
              activities: session.activities,
              resources: session.resources,
              durationMinutes: session.durationMinutes
            });
            sessionToSupport.set(key, session);
          } else {
            sessionToSupport.set(key, session);
          }
        }

        if (newLessonsToInsert.length > 0) {
          console.log(`Batch inserting ${newLessonsToInsert.length} lessons...`);
          // Batch insert in chunks of 50 to avoid max parameters limit in PG
          for (let i = 0; i < newLessonsToInsert.length; i += 50) {
            const chunk = newLessonsToInsert.slice(i, i + 50);
            const inserted = await tx.insert(curriculumLessons).values(chunk).returning();
            for (const l of inserted) {
              const key = `${l.academicTermId}-${l.weekNumber}-${l.lessonNumber}-${l.indicatorId}`;
              lessonMap.set(key, l);
            }
          }
        }

        console.log('Batch inserting exercises...');
        const newExercisesToInsert: any[] = [];
        const sessionExercises = new Map<string, any[]>();
        
        // Fetch existing exercises to avoid duplicates
        const existingExs = await tx.select({
          id: lessonExercises.id,
          lessonId: lessonExercises.curriculumLessonId,
          title: lessonExercises.title
        }).from(lessonExercises);
        
        const exerciseMap = new Map(existingExs.map((e: { id: string, lessonId: string | null, title: string }) => [`${e.lessonId}-${e.title}`, e.id]));

        for (const session of supportList) {
          const key = `${termIds[session.term]}-${session.week}-${session.lessonNumber}-${indicatorMap[session.indicatorCode]}`;
          const lesson = lessonMap.get(key);
          if (lesson) {
            for (const exercise of session.exercises) {
              const exKey = `${lesson.id}-${exercise.title}`;
              if (!exerciseMap.has(exKey)) {
                newExercisesToInsert.push({
                  curriculumLessonId: lesson.id,
                  title: exercise.title,
                  sortOrder: exercise.sortOrder,
                  _questions: exercise.questions // Temp store for later
                });
              } else {
                 sessionExercises.set(exerciseMap.get(exKey) as string, exercise.questions);
              }
            }
          }
        }

        if (newExercisesToInsert.length > 0) {
          console.log(`Batch inserting ${newExercisesToInsert.length} exercises...`);
          for (let i = 0; i < newExercisesToInsert.length; i += 50) {
            const chunk = newExercisesToInsert.slice(i, i + 50);
            const insertData = chunk.map(c => ({
              curriculumLessonId: c.curriculumLessonId,
              title: c.title,
              sortOrder: c.sortOrder
            }));
            const inserted = await tx.insert(lessonExercises).values(insertData).returning();
            for (let j = 0; j < inserted.length; j++) {
               sessionExercises.set(inserted[j].id, chunk[j]._questions);
            }
          }
        }

        console.log('Batch inserting questions...');
        const newQuestionsToInsert: any[] = [];
        
        // Fetch existing questions
        const existingQs = await tx.select({
           id: exerciseQuestions.id,
           exId: exerciseQuestions.exerciseId,
           sort: exerciseQuestions.sortOrder
        }).from(exerciseQuestions);
        const questionMap = new Set(existingQs.map((q: { id: string, exId: string | null, sort: number | null }) => `${q.exId}-${q.sort}`));

        for (const [exId, questions] of sessionExercises.entries()) {
          for (const q of questions) {
            const qKey = `${exId}-${q.sortOrder}`;
            if (!questionMap.has(qKey)) {
              newQuestionsToInsert.push({
                exerciseId: exId,
                question: q.question,
                answer: q.answer,
                sortOrder: q.sortOrder
              });
            }
          }
        }

        if (newQuestionsToInsert.length > 0) {
          console.log(`Batch inserting ${newQuestionsToInsert.length} questions...`);
          for (let i = 0; i < newQuestionsToInsert.length; i += 500) {
            const chunk = newQuestionsToInsert.slice(i, i + 500);
            await tx.insert(exerciseQuestions).values(chunk);
          }
        }
        console.log('Ingestion completed successfully.');
  }
}
