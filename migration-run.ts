import { config } from 'dotenv';
import postgres from 'postgres';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  try {
    const wrongId = 'bc026873-8ea6-4ee3-bb94-c24677d83cef';
    const rightId = '7afb3d85-460d-4f52-93fa-36b4653629e2';
    const basicSchoolId = '008c4b1a-8960-4587-8cd8-b8b66f9d7b86';

    console.log("Starting Migration...");
    
    await sql.begin(async (tx) => {
        const clsLinks = await tx`UPDATE class_level_subjects SET class_level_id = ${rightId} WHERE class_level_id = ${wrongId}`;
        console.log(`Repointed class_level_subjects: ${clsLinks.count}`);
        
        const strands = await tx`UPDATE strands SET class_level_id = ${rightId} WHERE class_level_id = ${wrongId}`;
        console.log(`Repointed strands: ${strands.count}`);
        
        const lessons = await tx`UPDATE curriculum_lessons SET class_level_id = ${rightId} WHERE class_level_id = ${wrongId}`;
        console.log(`Repointed curriculum_lessons: ${lessons.count}`);

        const hasTeacherClassSubjects = await tx`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_class_subjects')`;
        if (hasTeacherClassSubjects[0].exists) {
            const teacherClassSubjects = await tx`UPDATE teacher_class_subjects SET class_level_id = ${rightId} WHERE class_level_id = ${wrongId}`;
            console.log(`Repointed teacher_class_subjects: ${teacherClassSubjects.count}`);
        }

        // Delete the orphaned class level
        const deletedClassLevel = await tx`DELETE FROM class_levels WHERE id = ${wrongId}`;
        console.log(`Deleted incorrect class_level: ${deletedClassLevel.count}`);

        // Check if Basic School academic level has any other class levels
        const otherCl = await tx`SELECT id FROM class_levels WHERE academic_level_id = ${basicSchoolId}`;
        if (otherCl.length === 0) {
            // Safe to delete the academic level
            const deletedAl = await tx`DELETE FROM academic_levels WHERE id = ${basicSchoolId}`;
            console.log(`Deleted incorrect academic_level 'Basic School': ${deletedAl.count}`);
        } else {
            console.log(`Kept incorrect academic_level 'Basic School' because it has ${otherCl.length} other class levels attached.`);
        }
    });
    
    console.log("Migration completed successfully.");
    
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    await sql.end();
  }
}
migrate();
