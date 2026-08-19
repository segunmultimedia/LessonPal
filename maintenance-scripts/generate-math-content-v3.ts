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
  let isFallback = false;

  // 1. Numeration and Counting
  if (sub_strand === 'counting, representation and cardinality' || sub_strand === 'number and numeration systems') {
    if (contextStr.includes('roman numeral')) {
      whatToTeach = `1. Hindu-Arabic Numerals\n- These are the standard numbers we use every day: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.\n\n2. Roman Numerals\n- Ancient Romans used letters to represent numbers. There is no zero.\n- Basic symbols: I = 1, V = 5, X = 10, L = 50, C = 100.\n\n3. Rules for Forming Roman Numerals\n- Repetition: A symbol can be repeated up to three times (e.g., III = 3, XXX = 30).\n- Addition: A smaller numeral after a larger one means add (e.g., VI = 5 + 1 = 6).\n- Subtraction: A smaller numeral before a larger one means subtract (e.g., IV = 5 - 1 = 4, IX = 10 - 1 = 9).`;
      howToTeach = `Introduction\n- Ask pupils if they have seen clocks with letters instead of numbers. Explain that these are Roman numerals.\n\nTeacher Demonstration\n- Write the basic Roman symbols (I, V, X, L, C) on the board and their Hindu-Arabic equivalents.\n- Demonstrate how to form numbers from 1 to 10 using the addition and subtraction rules.\n- Show how to convert larger numbers like 40 (XL) or 90 (XC).\n\nGuided Practice\n- Write a few Hindu-Arabic numbers on the board and ask the class to convert them to Roman numerals.\n\nLearner Activity\n- Pupils complete a worksheet converting numbers between Hindu-Arabic and Roman numerals up to 100.\n\nAssessment/Closure\n- Ask a pupil to write the Roman numeral for 50 on the board.`;
      activities = `1. Numeral Match: Pupils match flashcards of Hindu-Arabic numbers to their corresponding Roman numerals.\n2. Clock Face: Pupils draw a clock face and label the hours using Roman numerals from I to XII.`;
      resources = `1. Flashcards with Hindu-Arabic and Roman numerals\n2. A clock face with Roman numerals (if available)\n3. Board and markers`;
      questions = [{q: 'What is the Roman numeral for 10?', a: 'X'}, {q: 'Convert the Roman numeral IX to a Hindu-Arabic number.', a: '9'}, {q: 'Write 45 in Roman numerals.', a: 'XLV'}];
    } else {
      whatToTeach = `1. Place Value System\n- Every digit in a number has a value based on its position (ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions).\n- Example: In 4,521, the 5 is in the hundreds place and its value is 500.\n\n2. Reading and Writing Numbers\n- Numbers can be written in standard form (4,521), word form (four thousand, five hundred and twenty-one), and expanded form (4000 + 500 + 20 + 1).\n\n3. Comparing and Ordering\n- Use >, <, or = to compare quantities. Always start comparing from the highest place value on the left.\n- Ascending order means smallest to largest; descending means largest to smallest.`;
      howToTeach = `Introduction\n- Write a large 5-digit number on the board and ask pupils if they can read it aloud.\n\nTeacher Demonstration\n- Draw a place value chart (Millions, HTh, TTh, Th, H, T, O) and place digits into it.\n- Demonstrate how to write a number in expanded form by pulling apart the digits based on their chart position.\n- Show how to compare two numbers by looking at the largest place value first.\n\nGuided Practice\n- Call a pupil to write 12,304 in the place value chart and state the value of the '3'.\n\nLearner Activity\n- Pupils complete a worksheet writing numbers in expanded form and comparing numbers using >, <, or =.\n\nAssessment/Closure\n- Ask a pupil to explain the difference between 'place value' and 'value'.`;
      activities = `1. Number Building: Give groups place value cards (1000s, 100s, 10s, 1s) and have them physically build numbers the teacher calls out.\n2. Place Value Bingo: Call out clues like "A number with 4 in the tens place".`;
      resources = `1. Place value chart\n2. Place value cards / multi-base blocks\n3. Flashcards with >, <, and =`;
      questions = [{q: 'Write 3,450 in expanded form.', a: '3000 + 400 + 50 + 0'}, {q: 'What is the place value of the digit 7 in 87,412?', a: 'Thousands'}, {q: 'Compare using > or <: 45,102 ___ 45,201', a: '<'}];
    }
  } 
  // 2. Number Operations
  else if (sub_strand === 'number operations') {
    if (contextStr.includes('multiply') || contextStr.includes('multiplication')) {
      whatToTeach = `1. Concept of Multiplication\n- Multiplication is repeated addition. For example, 3 x 4 means adding 3 four times (3 + 3 + 3 + 3 = 12).\n- The numbers being multiplied are called factors, and the result is the product.\n\n2. Multi-Digit Multiplication\n- When multiplying larger numbers (e.g. 2-digit by 2-digit), multiply the ones digit first, then the tens digit (adding a placeholder zero), and add the partial products.\n\n3. Properties\n- Commutative property: a x b = b x a. Zero property: a x 0 = 0.`;
      howToTeach = `Introduction\n- Write a repeated addition problem on the board (e.g., 5 + 5 + 5 + 5) and ask for a faster way to calculate it.\n\nTeacher Demonstration\n- Show the grid method or the standard vertical algorithm for multi-digit multiplication.\n- Emphasize the importance of the placeholder zero when multiplying by the tens column.\n\nGuided Practice\n- Have pupils guide you step-by-step through a 2-digit by 1-digit problem on the board.\n\nLearner Activity\n- Pupils solve 5 multi-digit multiplication problems in their exercise books.\n\nAssessment/Closure\n- Ask pupils what happens if you multiply any number by zero.`;
      activities = `1. Factor Search: Pupils find as many factor pairs as they can for a given target number.\n2. Multiplication Relay: Teams race to solve steps of a long multiplication problem on the board.`;
      resources = `1. Multiplication tables\n2. Grid paper to help align columns\n3. Board and markers`;
      questions = [{q: 'Calculate 14 x 5.', a: '70'}, {q: 'What is the product of 23 and 10?', a: '230'}, {q: 'If one box holds 12 pencils, how many pencils are in 4 boxes?', a: '48 pencils'}];
    } else if (contextStr.includes('divide') || contextStr.includes('division')) {
      whatToTeach = `1. Concept of Division\n- Division means sharing or grouping a number into equal parts.\n- The number being divided is the dividend, the number dividing it is the divisor, and the answer is the quotient.\n\n2. Long Division\n- Follow the steps: Divide, Multiply, Subtract, Bring down (DMSB).\n- If the divisor cannot go into the dividend perfectly, the left-over amount is the remainder.\n\n3. Relationship with Multiplication\n- Division is the inverse of multiplication. You can check 15 / 3 = 5 by doing 5 x 3 = 15.`;
      howToTeach = `Introduction\n- Bring 20 pebbles and ask a pupil to share them equally among 4 friends.\n\nTeacher Demonstration\n- Write the long division bracket on the board.\n- Work through a 3-digit by 1-digit division problem explicitly showing the DMSB steps.\n\nGuided Practice\n- Write another problem and ask the class to chant the steps (Divide, Multiply, Subtract, Bring down) as you solve it.\n\nLearner Activity\n- Pupils solve division problems, some with remainders and some without.\n\nAssessment/Closure\n- Ask a pupil to explain how to check their division answer using multiplication.`;
      activities = `1. Sharing Game: Pupils use physical counters to divide numbers and physically see the remainder.\n2. Fact Families: Given three numbers (e.g. 4, 5, 20), pupils write two multiplication and two division facts.`;
      resources = `1. Pebbles or counters\n2. Board and markers`;
      questions = [{q: 'What is 45 divided by 9?', a: '5'}, {q: 'Divide 22 by 4. What is the quotient and the remainder?', a: 'Quotient 5, remainder 2'}, {q: 'What is the inverse operation you use to check a division answer?', a: 'Multiplication'}];
    } else if (contextStr.includes('subtract') || contextStr.includes('difference')) {
      whatToTeach = `1. Concept of Subtraction\n- Subtraction is finding the difference between two quantities or taking an amount away.\n- Vocabulary: Minuend (top number), Subtrahend (number subtracted), Difference (answer).\n\n2. Subtraction with Regrouping (Borrowing)\n- Align numbers perfectly by place value.\n- If the top digit is smaller than the bottom digit, borrow 1 from the next place value to the left (which adds 10 to the current column).\n\n3. Word Problems\n- Key words indicating subtraction: difference, left, remain, take away, fewer than.`;
      howToTeach = `Introduction\n- Ask: "If you have 50 cedis and spend 15 cedis, how much is left?"\n\nTeacher Demonstration\n- Write a 4-digit subtraction problem on the board.\n- Demonstrate borrowing across zero (e.g., 400 - 125) carefully, showing how to borrow from the hundreds to the tens, then tens to ones.\n\nGuided Practice\n- Call a pupil to the board to solve a borrowing problem while the class watches for errors.\n\nLearner Activity\n- Pupils solve a mix of vertical subtraction and word problems.\n\nAssessment/Closure\n- Ask what word clues in a story problem tell you to subtract.`;
      activities = `1. Market Roleplay: Pupils start with a "budget" and subtract the cost of items they buy.\n2. Base-10 Blocks: Pupils use physical blocks to physically break a 'ten' into 10 'ones' for borrowing.`;
      resources = `1. Play money\n2. Base-10 blocks\n3. Board and markers`;
      questions = [{q: 'Calculate 500 - 245.', a: '255'}, {q: 'What is the difference between 90 and 34?', a: '56'}, {q: 'Kofi had 100 apples and gave away 45. How many does he have left?', a: '55 apples'}];
    } else {
      whatToTeach = `1. Concept of Addition\n- Addition is the process of combining two or more numbers to find a total sum.\n- Vocabulary: Addends (the numbers being added), Sum (the total).\n\n2. Addition with Regrouping (Carrying)\n- Align numbers correctly by ones, tens, hundreds.\n- If a column adds up to 10 or more, write the ones digit and carry the tens digit to the top of the next column.\n\n3. Properties\n- Commutative Property: 4 + 3 is the same as 3 + 4.\n- Identity Property: Any number plus 0 is the original number.`;
      howToTeach = `Introduction\n- Warm up with quick mental math addition facts.\n\nTeacher Demonstration\n- Write a multi-digit addition problem vertically.\n- Demonstrate adding from right to left, explicitly showing the carried number at the top of the next column.\n\nGuided Practice\n- Give the class a word problem. Ask them to extract the numbers and set up the vertical addition.\n\nLearner Activity\n- Pupils solve addition problems in their books, focusing on neat column alignment.\n\nAssessment/Closure\n- Ask a pupil to explain why we carry a '1' when 8 + 4 = 12.`;
      activities = `1. Dice Addition: Roll three dice to create 3-digit numbers and add them together.\n2. Column Check: Pupils swap books to check if their partner aligned the ones and tens columns correctly.`;
      resources = `1. Dice\n2. Board and markers`;
      questions = [{q: 'What is 345 + 128?', a: '473'}, {q: 'Add 1,200 and 3,450.', a: '4,650'}, {q: 'What is the sum of 56 and 9?', a: '65'}];
    }
  }
  // 3. Fractions, Decimals, Percentages
  else if (sub_strand === 'fractions') {
    whatToTeach = `1. Understanding Fractions\n- A fraction is a part of a whole. The Numerator (top) tells how many parts we have. The Denominator (bottom) tells how many equal parts make the whole.\n- Proper fractions: numerator < denominator. Improper fractions: numerator > denominator. Mixed numbers: a whole number plus a fraction.\n\n2. Equivalent Fractions\n- Fractions that represent the same value (e.g. 1/2 and 2/4).\n- Multiply or divide the top and bottom by the same number to find an equivalent fraction.\n\n3. Operations\n- To add/subtract fractions with the SAME denominator, add/subtract the numerators and keep the denominator the same.`;
    howToTeach = `Introduction\n- Draw a pizza on the board, slice it into 8 pieces, and shade 3. Ask the class to write the fraction.\n\nTeacher Demonstration\n- Show physical fraction circles to prove that 1/2 is the same size as 2/4.\n- Demonstrate adding 1/5 + 2/5 on a number line.\n\nGuided Practice\n- Write an improper fraction on the board and guide the class in converting it to a mixed number.\n\nLearner Activity\n- Pupils shade shapes to represent given fractions and solve basic fraction addition problems.\n\nAssessment/Closure\n- Ask the class: "If I add 2/7 and 3/7, do I add the 7s together?" (No, keep the denominator).`;
    activities = `1. Fraction Folding: Pupils fold paper strips into halves, quarters, and eighths to compare sizes.\n2. Matching Cards: Match improper fractions to their equivalent mixed numbers.`;
    resources = `1. Paper strips for folding\n2. Fraction circles or chart\n3. Flashcards`;
    questions = [{q: 'What is the numerator in 5/8?', a: '5'}, {q: 'Add 2/9 and 5/9.', a: '7/9'}, {q: 'Write an equivalent fraction for 1/3.', a: '2/6 (or 3/9, etc)'}];
  } else if (sub_strand === 'decimals') {
    whatToTeach = `1. Understanding Decimals\n- A decimal is a number with a decimal point that separates the whole number from the fractional part.\n- Place values after the point are tenths (1/10), hundredths (1/100), and thousandths (1/1000).\n\n2. Decimals and Fractions\n- 0.5 is the same as 5/10 or 1/2.\n- 0.25 is 25/100 or 1/4.\n\n3. Operations with Decimals\n- When adding or subtracting decimals, you MUST line up the decimal points exactly.`;
    howToTeach = `Introduction\n- Write "GH¢ 4.50" on the board and ask what the ".50" means in terms of whole cedis and pesewas.\n\nTeacher Demonstration\n- Draw a place value chart including decimals (O . t h th).\n- Demonstrate adding 2.4 and 1.35. Emphasize adding a placeholder zero to 2.4 so it becomes 2.40 to align perfectly with 1.35.\n\nGuided Practice\n- Ask pupils to compare 0.4 and 0.35. Discuss why 0.4 (which is 0.40) is larger.\n\nLearner Activity\n- Pupils solve decimal addition problems on grid paper.\n\nAssessment/Closure\n- Ask the most important rule for adding decimals (line up the points).`;
    activities = `1. Money Math: Use play money to represent decimals and add totals.\n2. Decimal Number Line: Pupils place decimal cards (0.1, 0.5, 0.75) on a large classroom number line.`;
    resources = `1. Play money (cedis and pesewas)\n2. Grid paper\n3. String and cards for number line`;
    questions = [{q: 'Write 3/10 as a decimal.', a: '0.3'}, {q: 'Which is larger: 0.6 or 0.55?', a: '0.6'}, {q: 'Add 1.2 and 3.4.', a: '4.6'}];
  } else if (sub_strand === 'percentages') {
    whatToTeach = `1. Meaning of Percentage\n- "Percent" means "out of 100". The symbol is %.\n- 45% means 45 out of 100.\n\n2. Connecting Percentages, Fractions, and Decimals\n- 50% = 50/100 = 1/2 = 0.5.\n- To turn a fraction into a percentage, find the equivalent fraction over 100 (e.g., 1/4 = 25/100 = 25%).\n\n3. Finding a Percentage of a Quantity\n- To find 10% of a number, divide it by 10.\n- To find 50%, halve the number.`;
    howToTeach = `Introduction\n- Show a picture of a phone battery at 100% and one at 20%. Ask what it means.\n\nTeacher Demonstration\n- Shade in a 10x10 grid to visually show 10%, 25%, and 50%.\n- Show how to convert a fraction like 3/5 into a percentage by multiplying the top and bottom by 20 to get 60/100.\n\nGuided Practice\n- Ask the class to find 10% of 40 cedis.\n\nLearner Activity\n- Pupils convert a list of simple fractions (1/2, 1/4, 1/10) to decimals and percentages in a table.\n\nAssessment/Closure\n- Ask: "What fraction is equal to 25%?"`;
    activities = `1. 100-Grid Coloring: Give pupils a 10x10 grid and have them color specific percentages in different colors.\n2. Shopping Discount: Set up a shop where items are "50% off" and have pupils calculate the new prices.`;
    resources = `1. Blank 10x10 grids\n2. Colored pencils\n3. Board and markers`;
    questions = [{q: 'What does the word "percent" mean?', a: 'Out of 100'}, {q: 'Convert 1/2 to a percentage.', a: '50%'}, {q: 'If a toy costs 20 cedis and is 10% off, how much is the discount?', a: '2 cedis'}];
  }
  // 4. Algebra
  else if (sub_strand === 'patterns and relationships' || sub_strand === 'algebraic expressions' || sub_strand === 'variables and equations') {
    whatToTeach = `1. Number Patterns and Sequences\n- A pattern is a sequence that follows a specific rule (e.g. +2, -3, x2).\n- You must identify the constant change between consecutive terms to find the rule.\n\n2. Variables and Algebraic Expressions\n- A variable (like x, y, or a blank box) is a symbol that represents an unknown number.\n- An expression contains numbers, variables, and operation symbols (e.g., x + 5).\n\n3. Solving Simple Equations\n- An equation has an equals sign, meaning both sides balance (e.g. x + 5 = 12).\n- To solve for x, use the inverse operation (subtract 5 from both sides to get x = 7).`;
    howToTeach = `Introduction\n- Write a sequence: 3, 6, 9, 12, __. Ask the class for the next number and the rule.\n\nTeacher Demonstration\n- Explain how a balance scale works. If you take weight off one side, you must take the exact same amount off the other side.\n- Write x + 4 = 10 on the board. Demonstrate subtracting 4 from both sides to solve for x.\n\nGuided Practice\n- Write y - 3 = 6. Guide the class to add 3 to both sides to find y = 9.\n\nLearner Activity\n- Pupils solve 5 simple linear equations independently.\n\nAssessment/Closure\n- Ask pupils what an "inverse operation" is and give an example.`;
    activities = `1. Human Balance Scale: Have a pupil hold their arms out like a scale. Place books in their hands to represent balanced equations.\n2. Pattern Building: Use matchsticks or bottle tops to build physical geometric sequences and derive the number rule.`;
    resources = `1. Matchsticks or bottle tops\n2. Real balance scale if available\n3. Board and markers`;
    questions = [{q: 'What is the rule for the sequence: 10, 15, 20, 25?', a: 'Add 5'}, {q: 'Find x if x + 6 = 14.', a: '8'}, {q: 'Find y if y - 2 = 5.', a: '7'}];
  }
  // 5. Geometry
  else if (sub_strand === '2d and 3d shapes' || sub_strand === 'position and transformation') {
    whatToTeach = `1. 2D Shapes (Flat)\n- Characteristics include length and width. Key properties: number of sides and vertices (corners).\n- Examples: Triangles (3 sides), Quadrilaterals like squares/rectangles (4 sides).\n\n2. 3D Objects (Solid)\n- Characteristics include length, width, and height/depth.\n- Key properties: Faces (flat surfaces), Edges (where faces meet), Vertices (corners where edges meet).\n- Examples: Cubes, cylinders, spheres, cones.\n\n3. Position and Movement\n- Understanding terms like parallel (lines that never meet), perpendicular (lines crossing at a right angle), and basic translations (slides) or reflections (flips).`;
    howToTeach = `Introduction\n- Hold up a tin of milk and a flat sheet of paper. Ask pupils what the difference is between the two shapes.\n\nTeacher Demonstration\n- Draw a cube on the board. Point to and explicitly label a face, an edge, and a vertex.\n- Show how to count the faces on a physical box.\n- Demonstrate parallel lines by pointing to the opposite edges of the blackboard.\n\nGuided Practice\n- Hold up a cone and ask the class to count the faces, edges, and vertices.\n\nLearner Activity\n- Pupils draw a table in their books listing Shapes (Cube, Cylinder, Sphere) and write the number of faces and edges for each.\n\nAssessment/Closure\n- Ask the class to define an edge and a vertex.`;
    activities = `1. Shape Sorting: Pupils bring empty boxes, cans, and balls from home and sort them by geometric properties.\n2. Skeleton Building: Use clay and matchsticks to build skeleton models of 3D objects to easily count edges and vertices.`;
    resources = `1. Cut-out paper shapes\n2. Real-life 3D objects (boxes, balls, cans)\n3. Board and markers`;
    questions = [{q: 'How many sides does a triangle have?', a: '3'}, {q: 'How many faces does a cube have?', a: '6'}, {q: 'What do we call lines that never meet?', a: 'Parallel lines'}];
  }
  // 6. Measurement
  else if (sub_strand === 'measurement' || sub_strand === 'perimeter, area and volume') {
    if (contextStr.includes('time') || (ind.includes('clock'))) {
      whatToTeach = `1. Units of Time\n- 60 seconds = 1 minute; 60 minutes = 1 hour; 24 hours = 1 day.\n\n2. Reading the Clock\n- Analog clocks have an hour hand (short) and a minute hand (long).\n- Reading in 5-minute intervals (e.g. the 1 represents 5 minutes, 2 represents 10 minutes).\n\n3. 12-hour vs 24-hour clock\n- AM is morning, PM is afternoon/evening.\n- In 24-hour time, add 12 to PM times (e.g., 2:00 PM is 14:00).`;
      howToTeach = `Introduction\n- Ask the class what time they wake up and what time they go to sleep.\n\nTeacher Demonstration\n- Use a large cardboard clock with movable hands. Show "o'clock", "half past", "quarter past", and "quarter to".\n- Demonstrate how to convert 3:00 PM to 15:00.\n\nGuided Practice\n- Give a time verbally (e.g. "Ten minutes past four") and have a pupil arrange the clock hands correctly.\n\nLearner Activity\n- Pupils write five analog clock times in both 12-hour AM/PM format and 24-hour format.\n\nAssessment/Closure\n- Ask: "How many minutes are in 2 hours?"`;
      activities = `1. Paper Clocks: Pupils construct their own clock faces using paper plates and a split pin.\n2. Daily Schedule: Pupils write out their daily school timetable using the 24-hour clock.`;
      resources = `1. Large teaching clock\n2. Paper plates and pins\n3. Flashcards`;
      questions = [{q: 'How many minutes are in one hour?', a: '60'}, {q: 'Write 4:00 PM in 24-hour time.', a: '16:00'}, {q: 'Where does the long hand point at "half past"?', a: 'The 6'}];
    } else if (sub_strand === 'perimeter, area and volume' || ind.includes('perimeter') || ind.includes('area')) {
      whatToTeach = `1. Perimeter\n- The total distance around the outside of a 2D shape.\n- To find the perimeter, add the lengths of all the sides together.\n\n2. Area\n- The amount of space inside a flat 2D shape. Measured in square units (e.g., cm²).\n- Formula for a rectangle: Area = length × width.\n\n3. Volume\n- The amount of space a 3D object takes up. Measured in cubic units (e.g., cm³).\n- Formula for a rectangular prism: Volume = length × width × height.`;
      howToTeach = `Introduction\n- Ask pupils how they would measure the fence around the school (perimeter) versus the grass field inside (area).\n\nTeacher Demonstration\n- Draw a rectangle on the board labeled 5cm length and 3cm width.\n- Calculate Perimeter: 5 + 3 + 5 + 3 = 16cm.\n- Calculate Area: 5 x 3 = 15cm².\n- Emphasize the difference between the units (cm vs cm²).\n\nGuided Practice\n- Draw a square with side 4cm. Ask the class to calculate the area and perimeter.\n\nLearner Activity\n- Pupils measure their textbooks and calculate the perimeter and area of the front cover.\n\nAssessment/Closure\n- Ask: "Do we use addition or multiplication to find the area of a rectangle?"`;
      activities = `1. String Perimeter: Give pupils string to wrap around objects, then measure the string on a ruler to find the perimeter.\n2. Grid Area: Pupils draw shapes on grid paper and count the squares inside to prove the multiplication formula works.`;
      resources = `1. Rulers and string\n2. Grid paper\n3. Board and markers`;
      questions = [{q: 'What is the perimeter of a square with sides of 5cm?', a: '20cm'}, {q: 'Find the area of a rectangle with length 6m and width 2m.', a: '12 square meters (12m²)'}, {q: 'If you want to put a fence around a garden, do you calculate perimeter or area?', a: 'Perimeter'}];
    } else {
      whatToTeach = `1. Standard Units\n- Length: millimeters (mm), centimeters (cm), meters (m), kilometers (km).\n- Mass: grams (g), kilograms (kg).\n- Capacity: milliliters (ml), liters (l).\n\n2. Choosing the Right Tool\n- Use a ruler/tape measure for length, a scale/balance for mass, and a measuring cylinder/jug for capacity.\n\n3. Conversions\n- 1 m = 100 cm. 1 km = 1,000 m.\n- 1 kg = 1,000 g. 1 l = 1,000 ml.\n- To convert from larger to smaller units, multiply. Smaller to larger, divide.`;
      howToTeach = `Introduction\n- Bring a water bottle, a ruler, and a heavy book. Ask pupils what units we use to measure each.\n\nTeacher Demonstration\n- Show how to accurately read the meniscus on a measuring jug.\n- Show how to place an object at the zero mark of a ruler.\n- Demonstrate converting 2.5 kg to grams by multiplying by 1000.\n\nGuided Practice\n- Ask the class: "Which is heavier, 500g or 1kg?" Discuss why.\n\nLearner Activity\n- Pupils rotate through measuring stations, recording the length of a desk, mass of a stone, and volume of water.\n\nAssessment/Closure\n- Ask: "How many centimeters make one meter?"`;
      activities = `1. Measurement Stations: Practical stations for length, mass, and capacity with physical tools.\n2. Conversion Relay: Teams race to the board to convert measurements (e.g., 3m to cm).`;
      resources = `1. Rulers/Tape measures\n2. Weighing scale\n3. Measuring jugs and water`;
      questions = [{q: 'How many grams are in 2 kilograms?', a: '2,000g'}, {q: 'Which unit is best to measure the distance between two cities?', a: 'Kilometers'}, {q: 'Convert 450cm to meters.', a: '4.5m'}];
    }
  }
  // 7. Data and Probability
  else if (sub_strand === 'data collection, organization, presentation and analysis') {
    if (contextStr.includes('second-hand data') || contextStr.includes('secondary data')) {
      whatToTeach = `1. Meaning of Data\n- Data refers to information or facts collected for analysis.\n\n2. Second-Hand (Secondary) Data\n- Second-hand data is information that has already been collected by someone else.\n- It is not collected directly by the pupil (primary data).\n\n3. Examples of Sources\n- Print media: Newspapers, magazines, textbooks, government reports.\n- Electronic media: The internet, television broadcasts, digital archives.`;
      howToTeach = `Introduction\n- Show pupils a newspaper clipping with a chart. Ask them who collected that information.\n\nTeacher Demonstration\n- Explain the difference between primary data (collecting it yourself) and second-hand data.\n- Display examples of magazines, books, and safe internet pages containing data.\n\nGuided Practice\n- Hand out old newspapers and have groups identify data or statistics in the articles.\n\nLearner Activity\n- Pupils list three sources of second-hand data they can find in the school library or at home.\n\nAssessment/Closure\n- Ask a pupil to explain why a textbook is an example of second-hand data.`;
      activities = `1. Media Hunt: Pupils search through provided magazines and newspapers to find tables, charts, or factual data.\n2. Source Sorting: Sort cards into first-hand and second-hand data categories.`;
      resources = `1. Old newspapers and magazines\n2. Textbooks with charts or tables\n3. Flashcards`;
      questions = [{q: 'What is second-hand data?', a: 'Information collected by someone else.'}, {q: 'Give two examples of print media containing second-hand data.', a: 'Newspapers and magazines.'}, {q: 'Is counting the desks in your classroom first-hand or second-hand data?', a: 'First-hand (primary) data.'}];
    } else {
      whatToTeach = `1. Collecting Data\n- Data is a collection of facts. We collect it via counting, surveys, or experiments.\n\n2. Organizing Data (Tallying)\n- Tally marks record frequencies. Four straight vertical lines and one diagonal line across them represent a bundle of 5.\n\n3. Presenting Data\n- Bar Graph: Uses rectangular bars where height represents frequency.\n- Pictograph: Uses symbols. Must always have a Key (e.g. 1 star = 2 pupils).\n- Pie Chart: A circle divided into slices based on proportions.`;
      howToTeach = `Introduction\n- Do a quick class vote on favorite colors. Keep raw numbers on the board.\n\nTeacher Demonstration\n- Show how to convert the raw numbers into a tally chart.\n- Next, draw a bar graph on the board, explicitly explaining the X-axis (labels), Y-axis (scale/numbers), and title.\n\nGuided Practice\n- Hand out a printed bar graph and ask the class interpretation questions (e.g., "Which is the highest?").\n\nLearner Activity\n- Pupils survey 10 classmates on their favorite fruit and draw a tally chart and bar graph.\n\nAssessment/Closure\n- Ask: "Why is it important to put a scale on a bar graph?"`;
      activities = `1. Class Survey: Pupils walk around to collect data, then draw a bar graph.\n2. Tally Practice: Give pupils mixed colored beads and have them sort and tally the colors.`;
      resources = `1. Graph paper\n2. Colored beads or counters\n3. Board and markers`;
      questions = [{q: 'What does a tally mark bundle with a diagonal line mean?', a: '5'}, {q: 'What is the purpose of the key in a pictograph?', a: 'To show what quantity each picture represents.'}, {q: 'Look at a bar graph. How do you find the most popular item?', a: 'Find the tallest bar.'}];
    }
  } else if (sub_strand === 'chance or probability') {
    whatToTeach = `1. Meaning of Probability\n- Probability (or chance) is how likely it is that an event will happen.\n\n2. Language of Chance\n- Certain: It will definitely happen (e.g. the sun will rise).\n- Likely: It will probably happen.\n- Even Chance: 50/50 chance (e.g. flipping a coin and getting heads).\n- Unlikely: It probably won't happen.\n- Impossible: It cannot happen (e.g. a pig will fly).\n\n3. Simple Experiments\n- Flipping a coin or rolling a die produces random, fair outcomes.`;
    howToTeach = `Introduction\n- Ask: "Will it rain tomorrow?" Discuss why we use words like "maybe" or "definitely".\n\nTeacher Demonstration\n- Draw a probability scale on the board from Impossible (0) to Certain (1), with Even Chance in the middle.\n- Place events on the scale (e.g., "Rolling a 7 on a standard die" -> Impossible).\n\nGuided Practice\n- Flip a coin and ask the class if it is certain, likely, or an even chance to land on Tails.\n\nLearner Activity\n- Pupils classify 5 given statements (e.g. "I will grow 10 feet tall today") into Impossible, Unlikely, Even, Likely, or Certain.\n\nAssessment/Closure\n- Ask a pupil to give an example of an impossible event.`;
    activities = `1. Coin Toss: Pupils toss a coin 20 times and tally Heads vs Tails to see if it balances to an even chance.\n2. Probability Bag: Put 3 red cubes and 1 blue cube in a bag. Pupils pull one out and discuss why red is "likely" and blue is "unlikely".`;
    resources = `1. Coins\n2. Dice\n3. Colored cubes and a bag`;
    questions = [{q: 'If you flip a coin, what is the chance of getting Heads?', a: 'Even chance (50/50)'}, {q: 'Classify this event: A human will breathe water like a fish.', a: 'Impossible'}, {q: 'Classify this event: The sun will set this evening.', a: 'Certain'}];
  }
  // 8. CATCH-ALL (Requires Curriculum Review)
  else {
    isFallback = true;
    whatToTeach = `REQUIRES CURRICULUM REVIEW\nThe automated system could not confidently map this lesson to a specific mathematical concept based on the provided curriculum indicator.\n\nTo ensure academic rigor, please review the official NaCCA curriculum document for this indicator and manually supply the appropriate definitions, rules, and worked examples.`;
    howToTeach = `REQUIRES CURRICULUM REVIEW\nRefer to the official NaCCA Teachers Resource Guide.`;
    activities = `REQUIRES CURRICULUM REVIEW\nPlease insert context-appropriate activities.`;
    resources = `REQUIRES CURRICULUM REVIEW\nStandard classroom materials.`;
    questions = [{ q: 'REQUIRES CURRICULUM REVIEW', a: 'N/A' },{ q: 'REQUIRES CURRICULUM REVIEW', a: 'N/A' },{ q: 'REQUIRES CURRICULUM REVIEW', a: 'N/A' }];
  }

  const cleanDesc = l.description.split('core competencies')[0].split('e.g.')[0].replace(/\n/g, ' ').replace(//g, '').trim();
  const learningObjective = `By the end of the lesson, pupils will be able to ${cleanDesc}`;
                     
  return { whatToTeach, howToTeach, activities, resources, learningObjective, exerciseTitle, questions, isFallback };
}

async function generateAll() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl, { max: 2 });
  
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
  let fallbackCount = 0;
  
  for (const l of lessons) {
    const c = buildContent(l);
    if (c.isFallback) fallbackCount++;
    
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
  
  console.log(`Done. Updated ${updatedCount} lessons. Fallbacks required review: ${fallbackCount}`);
  await sql.end();
}

generateAll();
