import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import { classLevels, subjects, academicTerms } from './src/lib/db/schema/curriculum';
import { curriculumLessons, lessonExercises, exerciseQuestions } from './src/lib/db/schema/curriculum_library';
import { eq, and } from 'drizzle-orm';

config({ path: join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function seedTestLesson() {
  console.log('🌱 Seeding Phase 3 Test Lesson...');

  try {
    // Get required references
    const [b4Class] = await db.select().from(classLevels).where(eq(classLevels.name, 'Basic 4')).limit(1);
    const [engSubject] = await db.select().from(subjects).where(eq(subjects.name, 'English Language')).limit(1);
    const [term1] = await db.select().from(academicTerms).where(eq(academicTerms.name, 'Term 1')).limit(1);

    if (!b4Class || !engSubject || !term1) {
      throw new Error('Missing structural metadata (Basic 4, English Language, or Term 1). Run seed.ts first.');
    }

    // Check if test lesson already exists
    const existing = await db.select().from(curriculumLessons).where(
      and(
        eq(curriculumLessons.classLevelId, b4Class.id),
        eq(curriculumLessons.subjectId, engSubject.id),
        eq(curriculumLessons.academicTermId, term1.id),
        eq(curriculumLessons.weekNumber, 3),
        eq(curriculumLessons.lessonNumber, 1)
      )
    );

    if (existing.length > 0) {
      console.log('✅ Test lesson already exists. Skipping.');
      process.exit(0);
    }

    // 1. Insert Curriculum Lesson
    const [newLesson] = await db.insert(curriculumLessons).values({
      classLevelId: b4Class.id,
      subjectId: engSubject.id,
      academicTermId: term1.id,
      weekNumber: 3,
      lessonNumber: 1,
      topic: 'Nouns (DEVELOPMENT TEST DATA)',
      learningObjective: 'Pupils should be able to define a noun and identify nouns in the classroom.',
      whatToTeach: 'A noun is a naming word. It can be the name of a person, place, animal, or thing.\n\nExamples:\n- Person: John, Teacher\n- Place: School, Accra\n- Animal: Dog, Goat\n- Thing: Table, Pencil',
      howToTeach: 'Step 1 – Introduction: Point to objects in the classroom and ask pupils to name them.\nStep 2 – Explain: Tell them these naming words are called "Nouns".\nStep 3 – Give examples: Write 5 examples on the board.\nStep 4 – Let pupils participate: Ask each pupil to mention one noun.\nStep 5 – Practice: Do the exercises.\nStep 6 – Assessment: Ask them to find nouns in a short sentence.',
      activities: '• Ask pupils to identify nouns in the classroom.\n• Let pupils work in pairs to write 5 nouns.\n• Write examples on the board.',
      resources: '• Chalkboard / whiteboard\n• Pictures of animals and places\n• Objects in the classroom',
      durationMinutes: 60,
    }).returning({ id: curriculumLessons.id });

    console.log('✅ Created curriculum lesson.');

    // 2. Insert Exercises
    const [ex1] = await db.insert(lessonExercises).values({
      curriculumLessonId: newLesson.id,
      title: 'Exercise 1 – Basic Understanding',
      sortOrder: 1,
    }).returning({ id: lessonExercises.id });

    const [ex2] = await db.insert(lessonExercises).values({
      curriculumLessonId: newLesson.id,
      title: 'Exercise 2 – Practice',
      sortOrder: 2,
    }).returning({ id: lessonExercises.id });

    const [ex3] = await db.insert(lessonExercises).values({
      curriculumLessonId: newLesson.id,
      title: 'Exercise 3 – Assessment',
      sortOrder: 3,
    }).returning({ id: lessonExercises.id });

    console.log('✅ Created 3 exercises.');

    // 3. Insert Questions & Answers
    await db.insert(exerciseQuestions).values([
      // Ex 1
      { exerciseId: ex1.id, question: 'What is a noun?', answer: 'A noun is a naming word.', sortOrder: 1 },
      { exerciseId: ex1.id, question: 'Give two examples of a person noun.', answer: 'E.g. Teacher, Kofi, Doctor.', sortOrder: 2 },
      
      // Ex 2
      { exerciseId: ex2.id, question: 'Identify the noun: "The dog is barking."', answer: 'dog', sortOrder: 1 },
      { exerciseId: ex2.id, question: 'Identify the noun: "Accra is a big city."', answer: 'Accra, city', sortOrder: 2 },

      // Ex 3
      { exerciseId: ex3.id, question: 'Write 3 nouns you can see in the classroom.', answer: 'Answers will vary (e.g. table, chair, book).', sortOrder: 1 },
    ]);

    console.log('✅ Created questions and hidden answers.');
    console.log('🎉 Test lesson seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedTestLesson();
