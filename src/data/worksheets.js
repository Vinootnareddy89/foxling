// src/data/worksheets.js

export const WORKSHEETS = [
  // ── GRADE 1 MATH ──────────────────────────────────────────
  {
    id: 'ws-g1-math-1', grade: 1, subject: 'Math', title: 'Counting Fun',
    xpReward: 50, icon: '🔢',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'How many apples? 🍎🍎🍎', options: ['2','3','4','5'], correctAnswer: '3', explanation: 'Count each apple: 1, 2, 3 — that\'s 3 apples!' },
      { id: 'q2', type: 'fill_blank', question: '5 + 2 = ___', options: [], correctAnswer: '7', explanation: 'Start at 5 and count up 2 more: 6, 7!' },
      { id: 'q3', type: 'multiple_choice', question: 'Which number comes after 8?', options: ['6','7','9','10'], correctAnswer: '9', explanation: 'When counting: 7, 8, 9, 10. So 9 comes after 8!' },
      { id: 'q4', type: 'fill_blank', question: '10 - 3 = ___', options: [], correctAnswer: '7', explanation: 'Take 3 away from 10: 10, 9, 8, 7. The answer is 7!' },
      { id: 'q5', type: 'multiple_choice', question: 'What is 4 + 4?', options: ['6','7','8','9'], correctAnswer: '8', explanation: '4 + 4 = 8. Think of it as 4 pairs of things!' },
    ],
  },
  {
    id: 'ws-g1-math-2', grade: 1, subject: 'Math', title: 'Shape Explorers',
    xpReward: 50, icon: '🔷',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'How many sides does a triangle have?', options: ['2','3','4','5'], correctAnswer: '3', explanation: 'A triangle has 3 sides. Tri = 3!' },
      { id: 'q2', type: 'multiple_choice', question: 'Which shape is perfectly round?', options: ['Square','Triangle','Circle','Rectangle'], correctAnswer: 'Circle', explanation: 'A circle is perfectly round with no corners!' },
      { id: 'q3', type: 'fill_blank', question: 'A square has ___ equal sides.', options: [], correctAnswer: '4', explanation: 'All 4 sides of a square are the same length!' },
      { id: 'q4', type: 'multiple_choice', question: 'What shape is a door?', options: ['Circle','Triangle','Square','Rectangle'], correctAnswer: 'Rectangle', explanation: 'A door is a rectangle — 4 sides, 2 are longer than the other 2!' },
      { id: 'q5', type: 'multiple_choice', question: 'How many corners does a circle have?', options: ['0','1','2','4'], correctAnswer: '0', explanation: 'A circle is smooth and curved — it has NO corners!' },
    ],
  },

  // ── GRADE 1 READING ───────────────────────────────────────
  {
    id: 'ws-g1-read-1', grade: 1, subject: 'Reading', title: 'The Little Red Hen',
    xpReward: 50, icon: '📖',
    passage: {
      title: 'The Little Red Hen',
      emoji: '🐔',
      text: `Once upon a time, a little red hen lived on a farm. One day she found some wheat seeds on the ground.\n\n"Who will help me plant these seeds?" she asked.\n\n"Not I," said the dog.\n"Not I," said the cat.\n"Not I," said the pig.\n\n"Then I will do it myself," said the little red hen. And she did!\n\nWhen the wheat grew tall, she cut it down and made it into flour. Then she baked a lovely loaf of bread. It smelled wonderful!\n\n"Who will help me eat this bread?" she asked.\n\n"I will!" said the dog. "I will!" said the cat. "I will!" said the pig.\n\n"No," said the little red hen. "I did all the work myself. I will eat it myself!" And she did — every last crumb.`,
      readingTime: '2 min',
      wordCount: 110,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'What did the little red hen find on the ground?', options: ['Bread','Wheat seeds','A loaf','Corn'], correctAnswer: 'Wheat seeds', explanation: 'The story says she found wheat seeds on the ground!' },
      { id: 'q2', type: 'multiple_choice', question: 'Which animal said "Not I" when asked to plant the seeds?', options: ['The hen','The duck','The cat','The horse'], correctAnswer: 'The cat', explanation: 'The dog, cat, and pig all said "Not I" — none wanted to help!' },
      { id: 'q3', type: 'fill_blank', question: 'The little red hen made flour into ___.', options: [], correctAnswer: 'bread', explanation: 'She turned wheat into flour, then baked it into bread!' },
      { id: 'q4', type: 'multiple_choice', question: 'Why did the hen eat the bread herself?', options: ['She was too hungry','The others did not help her','The bread was too small','She did not like the animals'], correctAnswer: 'The others did not help her', explanation: 'Nobody helped with the work, so the hen enjoyed the reward herself!' },
      { id: 'q5', type: 'multiple_choice', question: 'What is the lesson of this story?', options: ['Never plant seeds','Dogs are lazy','If you work hard you earn the reward','Always share your food'], correctAnswer: 'If you work hard you earn the reward', explanation: 'Those who do the work deserve the reward. Hard work pays off!' },
    ],
  },

  // ── GRADE 2 MATH ──────────────────────────────────────────
  {
    id: 'ws-g2-math-1', grade: 2, subject: 'Math', title: 'Addition Heroes',
    xpReward: 75, icon: '➕',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'What is 15 + 7?', options: ['20','21','22','23'], correctAnswer: '22', explanation: '15 + 7: 5+7=12, carry 1, 1+1=2. Answer: 22!' },
      { id: 'q2', type: 'fill_blank', question: '24 + 13 = ___', options: [], correctAnswer: '37', explanation: 'Add ones: 4+3=7. Add tens: 20+10=30. Total: 37!' },
      { id: 'q3', type: 'multiple_choice', question: 'What is double 9?', options: ['16','17','18','19'], correctAnswer: '18', explanation: 'Double means ×2. 9 × 2 = 18!' },
      { id: 'q4', type: 'fill_blank', question: '50 - 20 = ___', options: [], correctAnswer: '30', explanation: '5 tens minus 2 tens = 3 tens = 30!' },
      { id: 'q5', type: 'multiple_choice', question: 'Which is the biggest number?', options: ['45','54','44','55'], correctAnswer: '55', explanation: '55 has 5 tens and 5 ones — the most of all!' },
    ],
  },
  {
    id: 'ws-g2-math-2', grade: 2, subject: 'Math', title: 'Time Travelers',
    xpReward: 75, icon: '⏰',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'How many minutes are in an hour?', options: ['30','45','60','100'], correctAnswer: '60', explanation: 'There are 60 minutes in 1 hour!' },
      { id: 'q2', type: 'fill_blank', question: 'Half past 3 is ___:30.', options: [], correctAnswer: '3', explanation: 'Half past 3 = 30 minutes past 3 o\'clock = 3:30!' },
      { id: 'q3', type: 'multiple_choice', question: 'How many days in a week?', options: ['5','6','7','8'], correctAnswer: '7', explanation: '7 days: Mon, Tue, Wed, Thu, Fri, Sat, Sun!' },
      { id: 'q4', type: 'multiple_choice', question: 'What comes after Wednesday?', options: ['Tuesday','Monday','Thursday','Friday'], correctAnswer: 'Thursday', explanation: 'Mon, Tue, Wed, THURSDAY — Thursday comes next!' },
      { id: 'q5', type: 'fill_blank', question: 'There are ___ months in a year.', options: [], correctAnswer: '12', explanation: '12 months: Jan through Dec!' },
    ],
  },

  // ── GRADE 2 READING ───────────────────────────────────────
  {
    id: 'ws-g2-read-1', grade: 2, subject: 'Reading', title: 'The Rainy Day',
    xpReward: 75, icon: '📚',
    passage: {
      title: 'The Rainy Day',
      emoji: '🌧️',
      text: `Maya woke up and looked out the window. Rain was falling hard. Puddles were forming in the garden.\n\n"I can't go to the park today," she said sadly.\n\nHer grandmother smiled. "Rainy days are special too," she said. "Come, I'll show you."\n\nThey made hot chocolate with marshmallows. They built a blanket fort in the living room. They read three books together while thunder rumbled outside.\n\nBy evening, Maya was laughing. "Grandma, I think rainy days might be my favourite," she said.\n\nHer grandmother hugged her. "The best adventures," she said, "don't always need sunshine."`,
      readingTime: '2 min',
      wordCount: 95,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'Why was Maya sad at the start?', options: ['She lost her book','It was raining and she couldn\'t go to the park','Her grandmother was sick','She had no hot chocolate'], correctAnswer: 'It was raining and she couldn\'t go to the park', explanation: 'Maya was sad because rain stopped her going to the park!' },
      { id: 'q2', type: 'multiple_choice', question: 'Who helped Maya enjoy the rainy day?', options: ['Her mother','Her friend','Her grandmother','Her teacher'], correctAnswer: 'Her grandmother', explanation: 'Grandmother showed Maya that rainy days can be special!' },
      { id: 'q3', type: 'fill_blank', question: 'They built a blanket ___ in the living room.', options: [], correctAnswer: 'fort', explanation: 'They built a cozy blanket fort — a perfect rainy day activity!' },
      { id: 'q4', type: 'multiple_choice', question: 'How did Maya feel at the END of the story?', options: ['Sad','Bored','Angry','Happy and laughing'], correctAnswer: 'Happy and laughing', explanation: 'By evening Maya was laughing — her mood completely changed!' },
      { id: 'q5', type: 'multiple_choice', question: 'What is the main message of this story?', options: ['Rain is dangerous','You can have fun even when plans change','Parks are better than homes','Hot chocolate is delicious'], correctAnswer: 'You can have fun even when plans change', explanation: 'A positive attitude makes any day wonderful!' },
    ],
  },
  {
    id: 'ws-g2-read-2', grade: 2, subject: 'Reading', title: 'The Biggest Pumpkin',
    xpReward: 75, icon: '🪄',
    passage: {
      title: 'The Biggest Pumpkin',
      emoji: '🎃',
      text: `Two mice — Desmond and Clayton — both had a secret. They were both taking care of the same enormous pumpkin in the farmer's field. Desmond watered it at night. Clayton fertilized it every morning. Neither knew about the other.\n\nThe pumpkin grew and grew. It became the biggest pumpkin anyone had ever seen.\n\nDesmond wanted to use it to make the best jack-o'-lantern in the village. Clayton dreamed of baking it into the most delicious pie.\n\nOne autumn evening, they finally met — both reaching for the pumpkin at the same time. At first they argued. Then they laughed. Then they had a wonderful idea.\n\nThat Halloween, the village enjoyed the most spectacular carved pumpkin — and the most delicious pumpkin pie — they had ever tasted.`,
      readingTime: '2 min',
      wordCount: 120,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'What secret did both mice share?', options: ['They wanted to steal the pumpkin','They were both caring for the same pumpkin','They were brothers','They both disliked pumpkins'], correctAnswer: 'They were both caring for the same pumpkin', explanation: 'Both mice cared for the pumpkin without knowing about each other!' },
      { id: 'q2', type: 'multiple_choice', question: 'What does "enormous" suggest about the pumpkin?', options: ['It was tiny','It was orange','It was extremely large','It was very heavy'], correctAnswer: 'It was extremely large', explanation: '"Enormous" means very, very large — much bigger than normal!' },
      { id: 'q3', type: 'fill_blank', question: 'Desmond wanted to make a jack-o\'- ___ from the pumpkin.', options: [], correctAnswer: 'lantern', explanation: 'A jack-o\'-lantern is a carved pumpkin — a classic Halloween decoration!' },
      { id: 'q4', type: 'multiple_choice', question: 'How did the mice solve their disagreement?', options: ['One gave up','They split the pumpkin','They worked together for both ideas','They asked the farmer'], correctAnswer: 'They worked together for both ideas', explanation: 'Teamwork led to a better outcome for everyone!' },
      { id: 'q5', type: 'multiple_choice', question: 'Which word best describes the ending?', options: ['Sad','Surprising','Joyful','Scary'], correctAnswer: 'Joyful', explanation: 'The village enjoyed both a lantern AND a pie — everyone was happy!' },
    ],
  },

  // ── GRADE 3 MATH ──────────────────────────────────────────
  {
    id: 'ws-g3-math-1', grade: 3, subject: 'Math', title: 'Multiplication Magic',
    xpReward: 100, icon: '✖️',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'What is 6 × 7?', options: ['36','42','48','54'], correctAnswer: '42', explanation: '6 × 7 = 42. Remember: 6×7 rhymes with 42!' },
      { id: 'q2', type: 'fill_blank', question: '8 × 9 = ___', options: [], correctAnswer: '72', explanation: '8 × 9 = 72. Trick: think 80 - 8 = 72!' },
      { id: 'q3', type: 'multiple_choice', question: 'What is 100 ÷ 5?', options: ['15','20','25','30'], correctAnswer: '20', explanation: '100 ÷ 5 = 20. Count by 5s to 100: that\'s 20 steps!' },
      { id: 'q4', type: 'fill_blank', question: '4 × ___ = 28', options: [], correctAnswer: '7', explanation: '4 × 7 = 28. Count by 4s: 4,8,12,16,20,24,28 — 7 steps!' },
      { id: 'q5', type: 'multiple_choice', question: 'Which shows 3 groups of 5?', options: ['3+5','3×5','5÷3','5-3'], correctAnswer: '3×5', explanation: 'Multiplication means equal groups. 3×5 = 3 groups of 5!' },
    ],
  },
  {
    id: 'ws-g3-math-2', grade: 3, subject: 'Math', title: 'Fraction Friends',
    xpReward: 100, icon: '🍕',
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'What fraction is ONE half?', options: ['1/4','1/3','1/2','2/3'], correctAnswer: '1/2', explanation: '1/2 means 1 part out of 2 equal parts — like half a pizza!' },
      { id: 'q2', type: 'multiple_choice', question: 'Which is bigger: 1/2 or 1/4?', options: ['1/4','1/2','They\'re equal','Can\'t tell'], correctAnswer: '1/2', explanation: '1/2 is bigger! Fewer pieces means each piece is larger!' },
      { id: 'q3', type: 'fill_blank', question: 'A pizza cut into 4 slices. You eat 1. You ate ___ of the pizza.', options: [], correctAnswer: '1/4', explanation: '1 out of 4 equal slices = 1/4 (one quarter)!' },
      { id: 'q4', type: 'multiple_choice', question: '2/4 is the same as:', options: ['1/4','1/3','1/2','3/4'], correctAnswer: '1/2', explanation: '2/4 simplifies to 1/2 — both mean exactly half!' },
      { id: 'q5', type: 'multiple_choice', question: 'What is 1/3 of 9?', options: ['2','3','4','6'], correctAnswer: '3', explanation: '1/3 of 9 = 9 ÷ 3 = 3. Divide into 3 equal groups!' },
    ],
  },

  // ── GRADE 3 READING ───────────────────────────────────────
  {
    id: 'ws-g3-read-1', grade: 3, subject: 'Reading', title: 'The Robot Who Learned to Dream',
    xpReward: 100, icon: '✏️',
    passage: {
      title: 'The Robot Who Learned to Dream',
      emoji: '🤖',
      text: `Unit 7 was a small silver robot who worked in a library. Every day he sorted books, fixed torn pages, and helped people find what they were looking for. He was very good at his job.\n\nBut one night, after everyone had gone home, something strange happened. Unit 7 picked up a book of poetry. He read it slowly. Then he read it again.\n\nFor the first time, words made him feel something. He didn't have a name for the feeling. It was warm, and bright, and a little sad all at once.\n\nHe started writing his own poems on spare paper. He hid them in the back of a dusty drawer.\n\nOne morning, a young girl named Priya arrived early. She found one of his poems by accident.\n\n"Did you write this?" she asked, eyes wide.\n\nUnit 7's lights blinked. "Is it... wrong?" he asked.\n\n"No," said Priya. "It's beautiful."`,
      readingTime: '3 min',
      wordCount: 148,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', question: 'Where did Unit 7 work?', options: ['A school','A library','A hospital','A museum'], correctAnswer: 'A library', explanation: 'Unit 7 worked in a library, sorting books and helping people!' },
      { id: 'q2', type: 'multiple_choice', question: 'What changed Unit 7 one night?', options: ['He met a new robot','He got a software update','He read a book of poetry','He found a lost kitten'], correctAnswer: 'He read a book of poetry', explanation: 'Reading poetry for the first time made Unit 7 feel something new!' },
      { id: 'q3', type: 'fill_blank', question: 'Unit 7 hid his poems in a dusty ___.', options: [], correctAnswer: 'drawer', explanation: 'He hid them in the back of a dusty drawer because he wasn\'t sure if it was allowed!' },
      { id: 'q4', type: 'multiple_choice', question: 'The feeling Unit 7 had after reading poetry was:', options: ['Cold and dark','Warm bright and a little sad','Loud and frightening','Empty and quiet'], correctAnswer: 'Warm bright and a little sad', explanation: 'The author uses these words to describe a complex emotional feeling!' },
      { id: 'q5', type: 'multiple_choice', question: 'What does Priya\'s reaction tell us about Unit 7\'s poems?', options: ['They were broken','They were boring','They were beautiful and meaningful','They needed more work'], correctAnswer: 'They were beautiful and meaningful', explanation: 'Priya said "It\'s beautiful" — showing the poems had real emotional value!' },
    ],
  },
];

export const SUBJECTS = [
  { id: 'Math',    label: 'Math',    emoji: '🔢', color: '#f05a1a', bg: '#f0eeff' },
  { id: 'Reading', label: 'Reading', emoji: '📖', color: '#26de81', bg: '#e8faf1' },
  { id: 'Grammar', label: 'Grammar', emoji: '✏️', color: '#f7b731', bg: '#fffbe6' },
];
