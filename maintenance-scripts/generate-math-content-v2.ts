import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

function buildContent(l: any) {
  const strand = (l.strand || '').toLowerCase();
  const sub_strand = (l.sub_strand || '').toLowerCase();
  const ind = (l.description || '').toLowerCase();
  const title = (l.lesson_title || '').toLowerCase();
  
  const contextStr = `${strand} | ${sub_strand} | ${title} | ${ind}`;
  
  let whatToTeach = '', howToTeach = '', activities = '', resources = '', exerciseTitle = 'Class Exercise', questions: any[] = [];

  if (contextStr.includes('roman numeral')) {
    whatToTeach = `1. Hindu-Arabic Numerals\n- These are the standard numbers we use every day: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.\n\n2. Roman Numerals\n- Ancient Romans used letters to represent numbers. There is no zero.\n- Basic symbols: I = 1, V = 5, X = 10, L = 50, C = 100.\n\n3. Rules for Forming Roman Numerals\n- Repetition: A symbol can be repeated up to three times (e.g., III = 3, XXX = 30).\n- Addition: A smaller numeral after a larger one means add (e.g., VI = 5 + 1 = 6).\n- Subtraction: A smaller numeral before a larger one means subtract (e.g., IV = 5 - 1 = 4, IX = 10 - 1 = 9).`;
    howToTeach = `Introduction\n- Ask pupils if they have seen clocks with letters instead of numbers. Explain that these are Roman numerals.\n\nTeacher Demonstration\n- Write the basic Roman symbols (I, V, X, L, C) on the board and their Hindu-Arabic equivalents.\n- Demonstrate how to form numbers from 1 to 10 using the addition and subtraction rules.\n- Show how to convert larger numbers like 40 (XL) or 90 (XC).\n\nGuided Practice\n- Write a few Hindu-Arabic numbers on the board and ask the class to convert them to Roman numerals.\n\nLearner Activity\n- Pupils complete a worksheet converting numbers between Hindu-Arabic and Roman numerals up to 100.\n\nAssessment/Closure\n- Ask a pupil to write the Roman numeral for 50 on the board.`;
    activities = `1. Numeral Match: Pupils match flashcards of Hindu-Arabic numbers to their corresponding Roman numerals.\n2. Clock Face: Pupils draw a clock face and label the hours using Roman numerals from I to XII.`;
    resources = `1. Flashcards with Hindu-Arabic and Roman numerals\n2. A clock face with Roman numerals (if available)\n3. Board and markers`;
    questions = [{q: 'What is the Roman numeral for 10?', a: 'X'}, {q: 'Convert the Roman numeral IX to a Hindu-Arabic number.', a: '9'}, {q: 'Write 45 in Roman numerals.', a: 'XLV'}];
  } else if (contextStr.includes('second-hand data') || contextStr.includes('secondary data')) {
    whatToTeach = `1. Meaning of Data\n- Data refers to information or facts collected for analysis.\n\n2. Second-Hand (Secondary) Data\n- Second-hand data is information that has already been collected by someone else.\n- It is not collected directly by the pupil.\n\n3. Examples of Sources\n- Print media: Newspapers, magazines, textbooks, government reports.\n- Electronic media: The internet, television broadcasts, digital archives.`;
    howToTeach = `Introduction\n- Show pupils a newspaper clipping with a chart or table. Ask them who collected that information.\n\nTeacher Demonstration\n- Explain the difference between primary data (collecting it yourself) and second-hand data (using what others collected).\n- Display examples of magazines, books, and safe internet pages containing data.\n\nGuided Practice\n- Hand out old newspapers and have groups identify data or statistics in the articles.\n\nLearner Activity\n- Pupils list three sources of second-hand data they can find in the school library or at home.\n\nAssessment/Closure\n- Ask a pupil to explain why a textbook is an example of second-hand data.`;
    activities = `1. Media Hunt: Pupils search through provided magazines and newspapers to find tables, charts, or factual data.\n2. Source Sorting: Give pupils cards with data sources (e.g., "Counting cars yourself", "Reading a census report") and have them sort them into first-hand and second-hand data.`;
    resources = `1. Old newspapers and magazines\n2. Textbooks with charts or tables\n3. Flashcards for sorting activity`;
    questions = [{q: 'What is second-hand data?', a: 'Information that has already been collected by someone else.'}, {q: 'Give two examples of print media where you can find second-hand data.', a: 'Newspapers and magazines.'}, {q: 'Is counting the number of desks in your classroom an example of second-hand data?', a: 'No, that is first-hand (primary) data.'}];
  } else if (sub_strand.includes('fraction') || (ind.includes('fraction') && strand.includes('number'))) {
    whatToTeach = `1. Understanding Fractions\n- A fraction represents a part of a whole or a part of a set.\n- The top number is the numerator (parts we have). The bottom number is the denominator (total equal parts).\n\n2. Operations with Fractions\n- To add or subtract fractions with the same denominator, add or subtract the numerators and keep the denominator the same.\n- Equivalent fractions have the same value (e.g., 1/2 = 2/4).\n\n3. Common Mistakes\n- Pupils often add both the numerator and denominator (e.g. 1/4 + 1/4 = 2/8). Emphasize that the denominator remains the same (1/4 + 1/4 = 2/4).`;
    howToTeach = `Introduction\n- Draw a circle on the board and divide it into equal parts. Shade one part and ask the class to name the fraction.\n\nTeacher Demonstration\n- Write examples of fractions on the board.\n- Use physical fraction charts to demonstrate equivalent fractions.\n- Work through an addition or comparison problem step-by-step.\n\nGuided Practice\n- Provide pupils with fraction cards and have them arrange them in order.\n\nLearner Activity\n- Give pupils a worksheet with fraction problems to solve in pairs.\n\nAssessment/Closure\n- Ask a pupil to summarize how to find an equivalent fraction.`;
    activities = `1. Fraction Shading: Give pupils printed circles or squares and ask them to shade given fractions.\n2. Fraction Match: Pupils match fraction cards with their equivalent picture cards.`;
    resources = `1. Fraction charts or cut-out fraction circles\n2. Board and markers\n3. Flashcards`;
    questions = [{ q: 'What is the numerator in the fraction 3/4?', a: '3' },{ q: 'Are 1/2 and 2/4 equivalent fractions? (Yes/No)', a: 'Yes' },{ q: 'Add 1/5 and 2/5.', a: '3/5' }];
  } else if (sub_strand.includes('data') || strand.includes('data')) {
    whatToTeach = `1. Collecting Data\n- Data is a collection of information or facts. We collect data by observing, measuring, or asking questions (surveys).\n\n2. Organizing Data\n- A tally chart uses marks to record frequencies. Four vertical marks and one diagonal cross represent 5 (a bundle).\n- A frequency table organizes the tallies into numbers.\n\n3. Displaying Data\n- A bar graph uses rectangular bars to show data. The height or length of the bar represents the frequency.\n- A pictograph uses symbols or pictures to represent data. Always include a key (e.g., 1 picture = 2 items).`;
    howToTeach = `Introduction\n- Ask the class to raise their hands for their favorite fruit (e.g. banana, orange, apple). Keep a rough count on the board.\n\nTeacher Demonstration\n- Show how to convert the class vote into a neat tally chart.\n- Draw a simple bar graph on the board using the tally chart data, explaining the axes and scale.\n\nGuided Practice\n- Guide the class to read a prepared bar graph and answer questions about it (e.g., "Which is the most popular?").\n\nLearner Activity\n- Pupils ask 5 classmates for their favorite color and create a tally chart.\n\nAssessment/Closure\n- Ask a pupil to explain what the height of a bar on a bar graph means.`;
    activities = `1. Class Survey: Pupils walk around and conduct a quick survey to collect data, then draw a bar graph.\n2. Tally Practice: Give pupils a handful of mixed colored counters and have them create a tally chart of the colors.`;
    resources = `1. Board and markers\n2. Graph paper (if available)\n3. Colored counters`;
    questions = [{ q: 'What does a tally mark with a diagonal line through four vertical lines represent?', a: '5' },{ q: 'In a bar graph, what does the height of the bar show?', a: 'The number of items or frequency' },{ q: 'If 1 picture on a pictograph represents 2 apples, how many apples do 3 pictures represent?', a: '6 apples' }];
  } else if (sub_strand.includes('geometry') || sub_strand.includes('shape') || strand.includes('geometry') || ind.includes('angle')) {
    whatToTeach = `1. Properties of Shapes\n- 2D shapes are flat and have length and width (e.g. square, triangle, rectangle, circle).\n- 3D objects are solid and have length, width, and height (e.g. cube, sphere, cylinder, cone).\n\n2. Key Geometric Terms\n- Vertex (plural: vertices): The point where two or more edges meet (a corner).\n- Edge: The line segment where two faces of a solid meet.\n- Face: A flat surface of a 3D object.\n\n3. Angles\n- An angle is formed when two lines meet at a point.\n- A right angle is exactly 90 degrees (like the corner of a square).`;
    howToTeach = `Introduction\n- Hold up a familiar object (like a book or a ball) and ask pupils to name its shape.\n\nTeacher Demonstration\n- Draw different shapes on the board and label their sides and vertices.\n- Use a physical 3D model to point out faces, edges, and vertices.\n\nGuided Practice\n- Hold up various cut-outs and have the class name the shape and its properties.\n\nLearner Activity\n- Pupils draw three different shapes in their books and label the vertices.\n\nAssessment/Closure\n- Ask the class to define an edge and a vertex.`;
    activities = `1. Shape Hunt: Pupils walk around the classroom to find objects that match specific 2D and 3D shapes.\n2. Shape Sorting: Pupils sort physical objects into groups based on their geometric properties.`;
    resources = `1. Cut-out paper shapes\n2. Real-life 3D objects (boxes, balls, cans)\n3. Board and markers`;
    questions = [{ q: 'How many sides does a rectangle have?', a: '4' },{ q: 'What do we call the corner where two edges meet?', a: 'Vertex' },{ q: 'Name a 3D object that has no flat faces.', a: 'Sphere' }];
  } else if (sub_strand.includes('time') || (sub_strand.includes('measure') && ind.includes('clock'))) {
    whatToTeach = `1. Telling Time\n- A clock face has an hour hand (short) and a minute hand (long).\n- There are 60 minutes in an hour and 24 hours in a day.\n\n2. Reading the Clock\n- When the minute hand points to 12, it is "o'clock".\n- When it points to 3, it is "quarter past".\n- When it points to 6, it is "half past".\n- When it points to 9, it is "quarter to".\n\n3. Digital vs. Analog\n- Analog clocks use hands on a dial. Digital clocks show time using numbers separated by a colon (e.g., 10:30).`;
    howToTeach = `Introduction\n- Show a large cardboard clock. Ask pupils what time school starts.\n\nTeacher Demonstration\n- Move the hands on the clock to show "o'clock", "half past", and "quarter past".\n- Explain how to count by 5s around the clock face to find the minutes.\n\nGuided Practice\n- Set a time on the clock and ask the class to read it.\n- Give a time verbally and ask a pupil to come set the clock hands correctly.\n\nLearner Activity\n- Pupils draw clock faces in their books showing specific times (e.g., 3:15, 7:30).\n\nAssessment/Closure\n- Ask how many minutes are in half an hour.`;
    activities = `1. Make a Clock: Pupils create their own clock using paper plates and split pins.\n2. Time Match: Pupils match digital time cards to analog clock face cards.`;
    resources = `1. A large teaching clock with movable hands\n2. Paper plates and split pins (for activities)\n3. Flashcards`;
    questions = [{ q: 'How many minutes are in one hour?', a: '60 minutes' },{ q: 'If the long hand points to 6, how many minutes past the hour is it?', a: '30 minutes (half past)' },{ q: 'Write "half past 4" in digital format.', a: '4:30' }];
  } else if (sub_strand.includes('measure') || strand.includes('measure')) {
    whatToTeach = `1. Standard Units of Measurement\n- Length is measured in millimeters (mm), centimeters (cm), meters (m), and kilometers (km).\n- Mass (weight) is measured in grams (g) and kilograms (kg).\n- Capacity (volume) is measured in milliliters (ml) and liters (l).\n\n2. Measurement Tools\n- Use a ruler or tape measure for length.\n- Use a scale or balance for mass.\n- Use measuring cups or graduated cylinders for capacity.\n\n3. Conversions\n- 100 cm = 1 m; 1,000 m = 1 km.\n- 1,000 g = 1 kg.\n- 1,000 ml = 1 l.`;
    howToTeach = `Introduction\n- Bring a ruler, a water bottle, and a bag of sugar. Ask pupils what we use each item for.\n\nTeacher Demonstration\n- Show how to align an object with the zero mark on a ruler to measure its length.\n- Demonstrate reading a weighing scale or reading the volume markings on a jug.\n\nGuided Practice\n- Call a pupil to measure the length of the teacher's desk using a tape measure.\n\nLearner Activity\n- Have pupils measure the length of their pencils, notebooks, and desks in centimeters.\n\nAssessment/Closure\n- Ask pupils which unit would measure the distance between two towns.`;
    activities = `1. Measurement Station: Set up stations where pupils measure length with rulers, mass with a balance, and capacity with water jugs.\n2. Estimate and Measure: Pupils guess the length of an object and then measure it to check their accuracy.`;
    resources = `1. Rulers and tape measures\n2. Weighing scales or balances\n3. Measuring jugs and water\n4. Objects to measure`;
    questions = [{ q: 'How many centimeters are in 1 meter?', a: '100 cm' },{ q: 'Which unit would you use to measure the mass of a bag of rice? (grams, liters, meters)', a: 'Kilograms' },{ q: 'Measure the length of your pen in cm. (Example answer)', a: '14 cm' }];
  } else if (sub_strand.includes('algebra') || sub_strand.includes('pattern') || strand.includes('algebra')) {
    whatToTeach = `1. Number Patterns and Sequences\n- A pattern is a repeated arrangement of numbers or shapes.\n- To find the next number in a sequence, you must identify the rule (e.g., add 2, subtract 5, multiply by 3).\n\n2. Algebraic Expressions\n- An equation has an equal sign and shows that two things have the same value (e.g., 4 + 3 = 7).\n- A variable is a letter or symbol that represents an unknown number (e.g., x + 2 = 5).\n\n3. Solving Simple Equations\n- To solve an equation, perform the inverse operation. If a number is added, subtract it to find the unknown.`;
    howToTeach = `Introduction\n- Write a simple sequence on the board: 2, 4, 6, 8, __. Ask pupils what comes next.\n\nTeacher Demonstration\n- Explain how to find the rule of the sequence by looking at the difference between numbers.\n- Introduce variables by writing a box or letter: "x + 3 = 10". Show how subtracting 3 from 10 gives the answer.\n\nGuided Practice\n- Put a new sequence on the board and ask the class to identify the rule together.\n\nLearner Activity\n- Pupils complete a worksheet with missing numbers in sequences and simple equations.\n\nAssessment/Closure\n- Ask a pupil to define what a "rule" is in a number sequence.`;
    activities = `1. Pattern Building: Pupils use colored blocks to create repeating physical patterns.\n2. Find the Missing Number: Play a game where the teacher provides an equation with a missing number and teams race to solve it.`;
    resources = `1. Colored blocks or counters\n2. Board and markers\n3. Worksheets`;
    questions = [{ q: 'What is the next number in this sequence: 5, 10, 15, 20, ___?', a: '25' },{ q: 'What is the rule for the sequence: 10, 8, 6, 4?', a: 'Subtract 2' },{ q: 'Find the value of x if x + 4 = 12.', a: '8' }];
  } else if (sub_strand.includes('operation') || contextStr.includes('multiply') || contextStr.includes('divide') || contextStr.includes('subtract') || contextStr.includes('add ')) {
    if (contextStr.includes('multiply') || contextStr.includes('multiplication')) {
      whatToTeach = `1. Concept of Multiplication\n- Multiplication is repeated addition. For example, 3 x 4 means adding 3 four times (3 + 3 + 3 + 3 = 12).\n- The numbers being multiplied are called factors, and the result is the product.\n\n2. Multiplication Rules\n- Commutative property: The order of factors does not change the product (a x b = b x a).\n- Identity property: Any number multiplied by 1 is the number itself.\n- Zero property: Any number multiplied by 0 is 0.`;
      howToTeach = `Introduction\n- Write a repeated addition problem on the board (e.g., 5 + 5 + 5) and ask for a faster way to write it.\n\nTeacher Demonstration\n- Show how to align numbers for multi-digit multiplication.\n- Work through a 2-digit by 1-digit multiplication problem on the board.\n\nGuided Practice\n- Call a pupil to the board to solve a similar problem while the class guides them.\n\nLearner Activity\n- Have pupils practice multiplication tables using flashcards in pairs.\n\nAssessment/Closure\n- Give a quick mental math multiplication quiz.`;
      activities = `1. Multiplication Bingo: Pupils play bingo using multiplication facts.\n2. Array Drawing: Pupils draw arrays of dots to represent multiplication sentences (e.g., 3 rows of 4).`;
      resources = `1. Multiplication charts\n2. Counters or bottle tops for arrays\n3. Board and markers`;
      questions = [{ q: 'What is 7 multiplied by 8?', a: '56' },{ q: 'Rewrite 4 + 4 + 4 + 4 as a multiplication sentence.', a: '4 x 4' },{ q: 'Calculate 12 x 5.', a: '60' }];
    } else if (contextStr.includes('divide') || contextStr.includes('division')) {
      whatToTeach = `1. Concept of Division\n- Division means sharing or grouping a number into equal parts.\n- The number being divided is the dividend, the number dividing it is the divisor, and the answer is the quotient.\n\n2. Division Rules\n- Division is the inverse (opposite) of multiplication.\n- Any number divided by 1 is the number itself.\n- You cannot divide by 0.\n\n3. Remainder\n- Sometimes numbers cannot be divided equally. The amount left over is the remainder.`;
      howToTeach = `Introduction\n- Bring 12 physical objects (e.g. markers) and ask a pupil to share them equally among 3 friends.\n\nTeacher Demonstration\n- Explain the long division steps: Divide, Multiply, Subtract, Bring down (DMSB).\n- Work through a division problem with a remainder on the board.\n\nGuided Practice\n- Write a problem on the board and have the class solve it together step-by-step.\n\nLearner Activity\n- Pupils solve word problems that require sharing objects equally.\n\nAssessment/Closure\n- Review how multiplication can be used to check a division answer.`;
      activities = `1. Grouping Game: Give groups of pupils 20 counters and ask them to divide them into groups of 4, 5, etc.\n2. Division Relay: Pupils race to the board to solve short division facts.`;
      resources = `1. Counters, pebbles, or bottle tops\n2. Board and markers`;
      questions = [{ q: 'What is 36 divided by 4?', a: '9' },{ q: 'If you share 15 sweets equally among 3 children, how many does each get?', a: '5 sweets' },{ q: 'What is the quotient of 45 divided by 5?', a: '9' }];
    } else if (contextStr.includes('subtract') || contextStr.includes('difference')) {
      whatToTeach = `1. Concept of Subtraction\n- Subtraction is finding the difference between two numbers, or taking one quantity away from another.\n- The number you subtract from is the minuend, the number you take away is the subtrahend, and the answer is the difference.\n\n2. Subtraction with Regrouping (Borrowing)\n- If the digit in the top number (minuend) is smaller than the digit in the bottom number (subtrahend), you must "borrow" 1 from the column to the left, which equals 10 in the current column.`;
      howToTeach = `Introduction\n- Present a quick mental math subtraction question to the class.\n\nTeacher Demonstration\n- Write a multi-digit subtraction problem on the board that requires borrowing.\n- Cross out the borrowed digit and explicitly write the new values above the columns.\n\nGuided Practice\n- Work through another borrowing problem, asking pupils what step comes next.\n\nLearner Activity\n- Pupils solve subtraction word problems independently.\n\nAssessment/Closure\n- Have pupils check their subtraction answers by adding the difference to the subtrahend.`;
      activities = `1. Subtraction Shop: Give pupils a starting amount of play money and have them subtract the cost of items they "buy".\n2. Borrowing Practice: Use bundles of 10 sticks to physically demonstrate breaking a ten into ones.`;
      resources = `1. Bundles of sticks and loose sticks\n2. Play money\n3. Board and markers`;
      questions = [{ q: 'What is 50 minus 18?', a: '32' },{ q: 'Subtract 145 from 300.', a: '155' },{ q: 'Find the difference between 89 and 45.', a: '44' }];
    } else {
      whatToTeach = `1. Concept of Addition\n- Addition is the process of combining two or more numbers to find a total or sum.\n- The numbers being added are called addends.\n\n2. Addition with Regrouping (Carrying)\n- When adding by columns (place value), if the sum in a column is 10 or more, you must "carry over" the tens digit to the next column to the left.\n\n3. Properties of Addition\n- Commutative property: Changing the order of addends does not change the sum (a + b = b + a).\n- Identity property: Adding 0 to a number leaves it unchanged.`;
      howToTeach = `Introduction\n- Write a simple addition problem on the board to warm up the class.\n\nTeacher Demonstration\n- Draw a place value chart (Hundreds, Tens, Ones) on the board.\n- Demonstrate adding two 3-digit numbers, explicitly showing the carrying process.\n\nGuided Practice\n- Ask pupils to guide you through another example on the board, telling you when to carry over.\n\nLearner Activity\n- Give pupils a set of multi-digit addition problems to solve in their exercise books.\n\nAssessment/Closure\n- Ask a pupil to explain why we carry a number to the next column.`;
      activities = `1. Place Value Addition: Pupils use multi-base blocks to model an addition problem with regrouping.\n2. Market Roleplay: Pupils add the prices of different items to find the total cost.`;
      resources = `1. Multi-base blocks or bundle of sticks\n2. Play money\n3. Board and markers`;
      questions = [{ q: 'What is the sum of 45 and 27?', a: '72' },{ q: 'Add 124 and 351.', a: '475' },{ q: 'If a book costs ¢15 and a pen costs ¢5, what is the total cost?', a: '¢20' }];
    }
  } else {
    // Generic Number/Counting
    whatToTeach = `1. Concept Understanding\n- Explain the core mathematical principle clearly.\n- Define any key terms or vocabulary (e.g., ones, tens, hundreds, grouping, comparison).\n\n2. Step-by-Step Problem Solving\n- Provide a systematic method for solving problems related to this topic.\n- Outline the logical progression from identifying the problem to finding the solution.\n\n3. Representation\n- Connect the mathematical concept to physical objects or drawings so pupils can visualize it.\n- Highlight common errors pupils make and how to check their work.`;
    howToTeach = `Introduction\n- Begin with a real-life scenario or a quick mental math question to connect to prior knowledge.\n\nTeacher Demonstration\n- Work through at least two examples on the board. Show all working steps clearly.\n- Think aloud while solving so pupils understand the reasoning process.\n\nGuided Practice\n- Write a problem on the board and have the class solve it together, step-by-step.\n- Encourage pupils to ask questions if they do not understand a step.\n\nLearner Activity\n- Give pupils 3-5 problems to solve independently or in pairs using their exercise books.\n\nAssessment/Closure\n- Ask a pupil to summarize the rule or steps learned today. Check understanding before concluding.`;
    activities = `1. Board Work: Call selected pupils to solve problems on the board while the class observes.\n2. Peer Checking: Have pupils swap their exercise books and mark each other's work as you go through the answers.`;
    resources = `1. Board and markers\n2. Mathematics textbook\n3. Everyday objects for counting or demonstration (stones, sticks, bottle tops)`;
    questions = [{ q: 'Solve a basic problem related to the concept taught.', a: 'Correct step-by-step solution.' },{ q: 'Apply the rule to a slightly more challenging problem.', a: 'Correct application of the rule.' },{ q: 'A real-world word problem applying the concept.', a: 'Correct final answer with units if applicable.' }];
  }

  const cleanDesc = l.description.split('core competencies')[0].split('e.g.')[0].replace(/\n/g, ' ').replace(//g, '').trim();
  const learningObjective = `By the end of the lesson, pupils will be able to ${cleanDesc}`;
                     
  return { whatToTeach, howToTeach, activities, resources, learningObjective, exerciseTitle, questions };
}

async function generateAll() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  // Just use basic loop, no complex CTE for exercise insertions that might conflict
  const sql = postgres(dbUrl, { max: 5 });
  
  const lessons = await sql`
    SELECT 
      cl.id, cl.topic as lesson_title, i.description, 
      s.name as strand, ss.name as sub_strand, c.name as class_level
    FROM curriculum_lessons cl
    JOIN indicators i ON cl.indicator_id = i.id
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    JOIN strands s ON ss.strand_id = s.id
    JOIN class_levels c ON cl.class_level_id = c.id
    JOIN subjects subj ON cl.subject_id = subj.id
    WHERE subj.name = 'Mathematics'
  `;
  
  console.log(`Building bulk queries for ${lessons.length} lessons...`);
  
  let updatedCount = 0;
  
  for (const l of lessons) {
    const c = buildContent(l);
    
    await sql.begin(async (tx) => {
        await tx`UPDATE curriculum_lessons SET 
          learning_objective = ${c.learningObjective},
          what_to_teach = ${c.whatToTeach},
          how_to_teach = ${c.howToTeach},
          activities = ${c.activities},
          resources = ${c.resources}
        WHERE id = ${l.id}`;
        
        await tx`DELETE FROM exercise_questions WHERE exercise_id IN (SELECT id FROM lesson_exercises WHERE curriculum_lesson_id = ${l.id})`;
        await tx`DELETE FROM lesson_exercises WHERE curriculum_lesson_id = ${l.id}`;
        
        const newEx = await tx`INSERT INTO lesson_exercises (id, curriculum_lesson_id, title, sort_order)
          VALUES (gen_random_uuid(), ${l.id}, ${c.exerciseTitle}, 1)
          RETURNING id`;
          
        const exId = newEx[0].id;
        
        await tx`INSERT INTO exercise_questions (id, exercise_id, question, answer, sort_order) VALUES 
          (gen_random_uuid(), ${exId}, ${c.questions[0].q}, ${c.questions[0].a}, 1),
          (gen_random_uuid(), ${exId}, ${c.questions[1].q}, ${c.questions[1].a}, 2),
          (gen_random_uuid(), ${exId}, ${c.questions[2].q}, ${c.questions[2].a}, 3)`;
    });
    
    updatedCount++;
    if (updatedCount % 50 === 0) console.log(`Executed ${updatedCount}...`);
  }
  
  console.log(`Done. Updated ${updatedCount} lessons.`);
  await sql.end();
}

generateAll();
