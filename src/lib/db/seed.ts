import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { 
  countries, curricula, academicLevels, classLevels, subjects, classLevelSubjects, academicTerms 
} from './schema/curriculum';
import { eq } from 'drizzle-orm';
import { join } from 'path';

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env.local');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Country: Ghana
    let countryId;
    const existingCountry = await db.select().from(countries).where(eq(countries.code, 'GHA'));
    if (existingCountry.length > 0) {
      countryId = existingCountry[0].id;
      console.log('✅ Country Ghana already exists.');
    } else {
      const [newCountry] = await db.insert(countries).values({
        name: 'Ghana',
        code: 'GHA',
      }).returning({ id: countries.id });
      countryId = newCountry.id;
      console.log('✅ Created Country: Ghana');
    }

    // 2. Curriculum: NaCCA
    let curriculumId;
    const existingCurriculum = await db.select().from(curricula).where(eq(curricula.name, 'NaCCA National Curriculum'));
    if (existingCurriculum.length > 0) {
      curriculumId = existingCurriculum[0].id;
      console.log('✅ NaCCA Curriculum already exists.');
    } else {
      const [newCurr] = await db.insert(curricula).values({
        countryId,
        name: 'NaCCA National Curriculum',
        version: '2019',
        isActive: true,
      }).returning({ id: curricula.id });
      curriculumId = newCurr.id;
      console.log('✅ Created Curriculum: NaCCA');
    }

    // 3. Academic Levels
    const levelsToCreate = [
      { name: 'Lower Primary', sortOrder: 1 },
      { name: 'Upper Primary', sortOrder: 2 },
      { name: 'Junior High School (JHS)', sortOrder: 3 }
    ];

    const academicLevelIds: Record<string, string> = {};

    for (const level of levelsToCreate) {
      const existing = await db.select().from(academicLevels)
        .where(eq(academicLevels.name, level.name));
      
      if (existing.length > 0) {
        academicLevelIds[level.name] = existing[0].id;
      } else {
        const [inserted] = await db.insert(academicLevels).values({
          curriculumId,
          name: level.name,
          sortOrder: level.sortOrder,
        }).returning({ id: academicLevels.id });
        academicLevelIds[level.name] = inserted.id;
      }
    }
    console.log('✅ Created Academic Levels.');

    // 4. Class Levels
    const classesToCreate = [
      { name: 'Basic 1', shortName: 'B1', academicLevel: 'Lower Primary', sortOrder: 1 },
      { name: 'Basic 2', shortName: 'B2', academicLevel: 'Lower Primary', sortOrder: 2 },
      { name: 'Basic 3', shortName: 'B3', academicLevel: 'Lower Primary', sortOrder: 3 },
      { name: 'Basic 4', shortName: 'B4', academicLevel: 'Upper Primary', sortOrder: 4 },
      { name: 'Basic 5', shortName: 'B5', academicLevel: 'Upper Primary', sortOrder: 5 },
      { name: 'Basic 6', shortName: 'B6', academicLevel: 'Upper Primary', sortOrder: 6 },
      { name: 'JHS 1', shortName: 'JHS1', academicLevel: 'Junior High School (JHS)', sortOrder: 7 },
      { name: 'JHS 2', shortName: 'JHS2', academicLevel: 'Junior High School (JHS)', sortOrder: 8 },
      { name: 'JHS 3', shortName: 'JHS3', academicLevel: 'Junior High School (JHS)', sortOrder: 9 },
    ];

    const classLevelIds: Record<string, string> = {};

    for (const cls of classesToCreate) {
      const existing = await db.select().from(classLevels)
        .where(eq(classLevels.name, cls.name));
      
      if (existing.length > 0) {
        classLevelIds[cls.name] = existing[0].id;
      } else {
        const [inserted] = await db.insert(classLevels).values({
          academicLevelId: academicLevelIds[cls.academicLevel],
          name: cls.name,
          shortName: cls.shortName,
          sortOrder: cls.sortOrder,
        }).returning({ id: classLevels.id });
        classLevelIds[cls.name] = inserted.id;
      }
    }
    console.log('✅ Created Class Levels.');

    // 5. Subjects
    const subjectsToCreate = [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'Our World Our People', code: 'OWOP' },
      { name: 'Religious and Moral Education', code: 'RME' },
      { name: 'Computing', code: 'COMP' },
      { name: 'Creative Arts', code: 'CA' },
      { name: 'Ghanaian Language', code: 'GHAL' },
      { name: 'Physical and Health Education', code: 'PHE' },
      { name: 'Career Technology', code: 'CT' }, // JHS
      { name: 'Social Studies', code: 'SOCS' } // JHS
    ];

    const subjectIds: Record<string, string> = {};

    for (const sub of subjectsToCreate) {
      const existing = await db.select().from(subjects)
        .where(eq(subjects.name, sub.name));
      
      if (existing.length > 0) {
        subjectIds[sub.name] = existing[0].id;
      } else {
        const [inserted] = await db.insert(subjects).values({
          curriculumId,
          name: sub.name,
          code: sub.code,
        }).returning({ id: subjects.id });
        subjectIds[sub.name] = inserted.id;
      }
    }
    console.log('✅ Created Subjects.');

    // 6. Academic Terms
    const termsToCreate = [
      { name: 'Term 1', termNumber: 1, totalWeeks: 12, sortOrder: 1 },
      { name: 'Term 2', termNumber: 2, totalWeeks: 12, sortOrder: 2 },
      { name: 'Term 3', termNumber: 3, totalWeeks: 12, sortOrder: 3 }
    ];

    for (const term of termsToCreate) {
      const existing = await db.select().from(academicTerms).where(eq(academicTerms.name, term.name));
      if (existing.length === 0) {
        await db.insert(academicTerms).values({
          curriculumId,
          name: term.name,
          termNumber: term.termNumber,
          totalWeeks: term.totalWeeks,
          sortOrder: term.sortOrder,
        });
      }
    }
    console.log('✅ Created Academic Terms.');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
