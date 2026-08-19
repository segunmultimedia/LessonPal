import postgres from 'postgres';
import { CurriculumSourceInfo } from './types';

export class CurriculumVerifier {
  static async verify(dbUrl: string, info: CurriculumSourceInfo) {
    const sql = postgres(dbUrl, { ssl: 'require', max: 1, idle_timeout: 1 });

    try {
      // Find classLevel and subject IDs to scope verification
      let academicLevelName = 'Basic School';
      if (info.classLevel.match(/Basic [1-3]/i)) {
         academicLevelName = 'Lower Primary';
      } else if (info.classLevel.match(/Basic [4-6]/i)) {
         academicLevelName = 'Upper Primary';
      } else if (info.classLevel.includes('JHS')) {
         academicLevelName = 'Junior High School (JHS)';
      }
      
      const classLevelQuery = await sql`
        SELECT cl.id 
        FROM class_levels cl
        JOIN academic_levels al ON cl.academic_level_id = al.id
        WHERE cl.name = ${info.classLevel} AND al.name = ${academicLevelName}
      `;
      const subjectQuery = await sql`SELECT id FROM subjects WHERE name = ${info.subject}`;

      if (classLevelQuery.length === 0 || subjectQuery.length === 0) {
        throw new Error(`Class Level or Subject not found in DB: ${info.classLevel} / ${info.subject}`);
      }

      const classLevelId = classLevelQuery[0].id;
      const subjectId = subjectQuery[0].id;

      // Count indicators for this subject/class
      // We can join through contentStandards, subStrands, strands
      const indicators = await sql`
        SELECT COUNT(DISTINCT i.id) as count
        FROM indicators i
        JOIN content_standards cs ON i.content_standard_id = cs.id
        JOIN sub_strands ss ON cs.sub_strand_id = ss.id
        JOIN strands s ON ss.strand_id = s.id
        WHERE s.class_level_id = ${classLevelId} AND s.subject_id = ${subjectId}
      `;
      
      const scheduled = await sql`
        SELECT COUNT(DISTINCT indicator_id) as count 
        FROM curriculum_lessons 
        WHERE indicator_id IS NOT NULL 
          AND class_level_id = ${classLevelId} 
          AND subject_id = ${subjectId}
      `;
      
      const sessions = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE class_level_id = ${classLevelId} AND subject_id = ${subjectId}
      `;
      
      const missing = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE indicator_id IS NULL 
          AND class_level_id = ${classLevelId} 
          AND subject_id = ${subjectId}
      `;
      
      const duplicates = await sql`
        SELECT COUNT(*) as count FROM (
          SELECT i.code 
          FROM indicators i
          JOIN content_standards cs ON i.content_standard_id = cs.id
          JOIN sub_strands ss ON cs.sub_strand_id = ss.id
          JOIN strands s ON ss.strand_id = s.id
          WHERE s.class_level_id = ${classLevelId} AND s.subject_id = ${subjectId}
          GROUP BY i.code 
          HAVING COUNT(*) > 1
        ) d
      `;

      const termSessions = await sql`
        SELECT t.term_number, COUNT(l.id) as count 
        FROM curriculum_lessons l
        JOIN academic_terms t ON l.academic_term_id = t.id
        WHERE l.class_level_id = ${classLevelId} AND l.subject_id = ${subjectId}
        GROUP BY t.term_number
      `;

      const termsCount: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      for (const row of termSessions) {
        termsCount[parseInt(row.term_number)] = parseInt(row.count);
      }

      const seqProvenance = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE sequence_source_status != 'LESSONPAL_GENERATED_SEQUENCE' 
          AND sequence_source_status != 'OFFICIAL_NACCA_SEQUENCE'
          AND class_level_id = ${classLevelId} 
          AND subject_id = ${subjectId}
      `;
      
      const unverified = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE content_source_status = 'UNVERIFIED' 
          AND class_level_id = ${classLevelId} 
          AND subject_id = ${subjectId}
      `;

      const missingReferences = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons l
        LEFT JOIN indicators i ON l.indicator_id = i.id
        WHERE i.id IS NULL 
          AND l.class_level_id = ${classLevelId} 
          AND l.subject_id = ${subjectId}
      `;

      // Check users untouched
      const usersCheck = await sql`SELECT COUNT(*) as count FROM users`;

      return {
        indicators: parseInt(indicators[0].count),
        scheduled: parseInt(scheduled[0].count),
        sessions: parseInt(sessions[0].count),
        missing: parseInt(missing[0].count),
        duplicates: parseInt(duplicates[0].count),
        provenancePass: parseInt(unverified[0].count) === 0,
        seqProvenancePass: parseInt(seqProvenance[0].count) === 0,
        term1: termsCount[1],
        term2: termsCount[2],
        term3: termsCount[3],
        invalidRefs: parseInt(missingReferences[0].count),
        usersIntact: parseInt(usersCheck[0].count) > 0,
        lessonRetrievalPass: parseInt(sessions[0].count) > 0
      };
    } finally {
      await sql.end();
    }
  }

  static async verifySpecificClass(dbUrl: string, classLevel: string, subject: string, expectedIndicators: number, expectedSessions: number) {
    const sql = postgres(dbUrl, { ssl: 'require', max: 1, idle_timeout: 1 });

    try {
      let academicLevelName = 'Basic School';
      if (classLevel.match(/Basic [1-3]/i)) {
         academicLevelName = 'Lower Primary';
      } else if (classLevel.match(/Basic [4-6]/i)) {
         academicLevelName = 'Upper Primary';
      } else if (classLevel.includes('JHS')) {
         academicLevelName = 'Junior High School (JHS)';
      }
      
      const classLevelQuery = await sql`
        SELECT cl.id 
        FROM class_levels cl
        JOIN academic_levels al ON cl.academic_level_id = al.id
        WHERE cl.name = ${classLevel} AND al.name = ${academicLevelName}
      `;
      const subjectQuery = await sql`SELECT id FROM subjects WHERE name = ${subject}`;

      if (classLevelQuery.length === 0 || subjectQuery.length === 0) {
        return false;
      }

      const classLevelId = classLevelQuery[0].id;
      const subjectId = subjectQuery[0].id;

      const bIndicators = await sql`
        SELECT COUNT(DISTINCT i.id) as count
        FROM indicators i
        JOIN content_standards cs ON i.content_standard_id = cs.id
        JOIN sub_strands ss ON cs.sub_strand_id = ss.id
        JOIN strands s ON ss.strand_id = s.id
        WHERE s.class_level_id = ${classLevelId} AND s.subject_id = ${subjectId}
      `;
      const bSessions = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE class_level_id = ${classLevelId} AND subject_id = ${subjectId}
      `;
      
      return parseInt(bIndicators[0].count) === expectedIndicators && parseInt(bSessions[0].count) === expectedSessions;
    } finally {
      await sql.end();
    }
  }
}
