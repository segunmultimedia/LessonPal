import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

const officialStrands = {
  1: 'Number',
  2: 'Algebra',
  3: 'Geometry and Measurement',
  4: 'Data'
};

const officialSubStrands: Record<number, Record<number, string>> = {
  1: {
    1: 'Counting, Representation and Cardinality',
    2: 'Number Operations',
    3: 'Fractions',
    4: 'Decimals',
    5: 'Percentages'
  },
  2: {
    1: 'Patterns and Relationships',
    2: 'Algebraic Expressions',
    3: 'Variables and Equations'
  },
  3: {
    1: '2D and 3D Shapes',
    2: 'Position and Transformation',
    3: 'Measurement',
    4: 'Perimeter, Area and Volume'
  },
  4: {
    1: 'Data Collection, Organization, Presentation and Analysis',
    2: 'Chance or Probability'
  }
};

async function fixPlaceholders() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  let fixedStrands = 0;
  let fixedSubStrands = 0;
  
  const strands = await sql`SELECT * FROM strands WHERE subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')`;
  for (const s of strands) {
    if (s.name.startsWith('Strand ')) {
      const num = parseInt(s.name.replace('Strand ', '').trim(), 10);
      if (officialStrands[num]) {
        await sql`UPDATE strands SET name = ${officialStrands[num]} WHERE id = ${s.id}`;
        fixedStrands++;
      }
    }
  }
  
  // Re-fetch strands to get updated names
  const updatedStrands = await sql`SELECT * FROM strands WHERE subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')`;
  const strandMap: Record<string, number> = {};
  for (const s of updatedStrands) {
    if (s.name === 'Number') strandMap[s.id] = 1;
    if (s.name === 'Algebra') strandMap[s.id] = 2;
    if (s.name === 'Geometry and Measurement') strandMap[s.id] = 3;
    if (s.name === 'Data') strandMap[s.id] = 4;
  }
  
  const subStrands = await sql`
    SELECT ss.id, ss.name, ss.strand_id
    FROM sub_strands ss
    JOIN strands s ON ss.strand_id = s.id
    WHERE s.subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  `;
  
  for (const ss of subStrands) {
    if (ss.name.startsWith('Sub-Strand ')) {
      const num = parseInt(ss.name.replace('Sub-Strand ', '').trim(), 10);
      const strandNum = strandMap[ss.strand_id];
      if (strandNum && officialSubStrands[strandNum] && officialSubStrands[strandNum][num]) {
        await sql`UPDATE sub_strands SET name = ${officialSubStrands[strandNum][num]} WHERE id = ${ss.id}`;
        fixedSubStrands++;
      }
    }
  }
  
  // Also fix the curriculum_lessons topics
  await sql`
    UPDATE curriculum_lessons cl
    SET topic = s.name
    FROM indicators i 
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    JOIN strands s ON ss.strand_id = s.id
    WHERE cl.indicator_id = i.id AND cl.subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  `;
  
  console.log(`Fixed Strands: ${fixedStrands}`);
  console.log(`Fixed Sub-Strands: ${fixedSubStrands}`);
  
  await sql.end();
}

fixPlaceholders();
