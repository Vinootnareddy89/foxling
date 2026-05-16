import { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/firebase/config';

const C = {
  orange:'#f05a1a', orange2:'#c0392b', amber:'#f7b731',
  green:'#26de81', blue:'#2563eb', purple:'#7c3aed',
  bg:'#fff8f5', white:'#ffffff', text:'#1a0a00',
  muted:'#9a6a50', border:'#ffe0cc',
};

// ── DIAGNOSTIC QUESTIONS PER SUBJECT ─────────────────────
const DIAGNOSTIC_QUESTIONS = {
  Math: [
    // Level 1 (Grade 1)
    { id:'m1', level:1, question:'What is 3 + 4?',           type:'multiple_choice', options:['5','6','7','8'],          correct:'7',  skill:'Addition'        },
    { id:'m2', level:1, question:'What is 9 - 3?',           type:'multiple_choice', options:['4','5','6','7'],          correct:'6',  skill:'Subtraction'     },
    // Level 2 (Grade 2)
    { id:'m3', level:2, question:'What is 15 + 27?',         type:'multiple_choice', options:['32','41','42','43'],      correct:'42', skill:'Addition'        },
    { id:'m4', level:2, question:'What is 34 - 18?',         type:'multiple_choice', options:['14','15','16','17'],      correct:'16', skill:'Subtraction'     },
    // Level 3 (Grade 3)
    { id:'m5', level:3, question:'What is 6 × 7?',           type:'multiple_choice', options:['36','40','42','48'],      correct:'42', skill:'Multiplication'  },
    { id:'m6', level:3, question:'What is 48 ÷ 6?',          type:'multiple_choice', options:['6','7','8','9'],          correct:'8',  skill:'Division'        },
    // Level 4 (Grade 4)
    { id:'m7', level:4, question:'What is 125 + 348?',       type:'multiple_choice', options:['463','473','483','493'],  correct:'473',skill:'Addition'        },
    { id:'m8', level:4, question:'What is 12 × 15?',         type:'multiple_choice', options:['150','170','180','190'],  correct:'180',skill:'Multiplication'  },
    // Level 5 (Grade 5)
    { id:'m9', level:5, question:'What is ½ + ¼?',           type:'multiple_choice', options:['¼','½','¾','1'],          correct:'¾',  skill:'Fractions'       },
    { id:'m10',level:5, question:'What is 15% of 200?',      type:'multiple_choice', options:['20','25','30','35'],      correct:'30', skill:'Percentages'     },
  ],
  Reading: [
    { id:'r1', level:1, question:'Which word rhymes with "cat"?',                    type:'multiple_choice', options:['dog','bat','cup','run'],          correct:'bat',    skill:'Phonics'        },
    { id:'r2', level:1, question:'What comes at the end of a sentence?',             type:'multiple_choice', options:['comma','period','colon','dash'],   correct:'period', skill:'Punctuation'    },
    { id:'r3', level:2, question:'What is the main idea of a story?',                type:'multiple_choice', options:['the setting','the characters','what it\'s mostly about','the ending'], correct:'what it\'s mostly about', skill:'Comprehension' },
    { id:'r4', level:2, question:'Which word is a synonym for "happy"?',             type:'multiple_choice', options:['sad','angry','joyful','tired'],    correct:'joyful', skill:'Vocabulary'     },
    { id:'r5', level:3, question:'What does an author\'s "purpose" mean?',           type:'multiple_choice', options:['where they live','why they wrote it','their name','their age'], correct:'why they wrote it', skill:'Author\'s Purpose' },
    { id:'r6', level:3, question:'What is a metaphor?',                              type:'multiple_choice', options:['a type of rhyme','comparing using like or as','saying one thing IS another','a repeated sound'], correct:'saying one thing IS another', skill:'Figurative Language' },
    { id:'r7', level:4, question:'What is an inference?',                            type:'multiple_choice', options:['a direct quote','a conclusion based on clues','the theme','the setting'], correct:'a conclusion based on clues', skill:'Inference' },
    { id:'r8', level:4, question:'What does "summarize" mean?',                      type:'multiple_choice', options:['copy the text','add your opinion','retell main points briefly','list all details'], correct:'retell main points briefly', skill:'Summarizing' },
    { id:'r9', level:5, question:'What is the "theme" of a story?',                  type:'multiple_choice', options:['the plot','the setting','the main message or lesson','the characters'], correct:'the main message or lesson', skill:'Theme' },
    { id:'r10',level:5, question:'What does "point of view" mean in a story?',       type:'multiple_choice', options:['the genre','who is telling the story','the conflict','the resolution'], correct:'who is telling the story', skill:'Point of View' },
  ],
  Grammar: [
    { id:'g1', level:1, question:'Which is a noun?',                                 type:'multiple_choice', options:['run','happy','dog','quickly'],     correct:'dog',    skill:'Nouns'          },
    { id:'g2', level:1, question:'Which sentence is correct?',                       type:'multiple_choice', options:['the dog run fast','The dog runs fast.','the Dog runs fast','The dog run fast.'], correct:'The dog runs fast.', skill:'Sentences' },
    { id:'g3', level:2, question:'Which is a verb?',                                 type:'multiple_choice', options:['tree','blue','jump','slowly'],      correct:'jump',   skill:'Verbs'          },
    { id:'g4', level:2, question:'Which word is an adjective?',                      type:'multiple_choice', options:['quickly','beautiful','run','they'], correct:'beautiful', skill:'Adjectives'  },
    { id:'g5', level:3, question:'Which sentence uses correct punctuation?',         type:'multiple_choice', options:['Lets eat grandma!','Let\'s eat, grandma!','Lets eat, grandma!','Let\'s eat grandma!'], correct:'Let\'s eat, grandma!', skill:'Punctuation' },
    { id:'g6', level:3, question:'What is the plural of "child"?',                   type:'multiple_choice', options:['childs','childes','children','child\'s'], correct:'children', skill:'Plurals'  },
    { id:'g7', level:4, question:'Which sentence is in past tense?',                 type:'multiple_choice', options:['She runs fast.','She will run fast.','She ran fast.','She is running fast.'], correct:'She ran fast.', skill:'Tense' },
    { id:'g8', level:4, question:'Which word correctly completes: "Neither the boys ___ the girl was late."', type:'multiple_choice', options:['or','nor','and','but'], correct:'nor', skill:'Conjunctions' },
    { id:'g9', level:5, question:'Which sentence uses a comma correctly?',           type:'multiple_choice', options:['I like cats and, dogs.','I like cats, and dogs.','After school I went home.','After school, I went home.'], correct:'After school, I went home.', skill:'Commas' },
    { id:'g10',level:5, question:'What is the subject of: "The tall boy kicked the ball."?', type:'multiple_choice', options:['tall','boy','The tall boy','kicked'], correct:'The tall boy', skill:'Subject/Predicate' },
  ],
};

// ── SUBJECT CONFIG ────────────────────────────────────────
const SUBJECTS = [
  { id:'Math',    emoji:'🔢', color:C.orange, gradient:[C.orange, C.orange2],  desc:'Numbers, operations & problem solving' },
  { id:'Reading', emoji:'📖', color:C.green,  gradient:[C.green,  '#1aaf5e'],  desc:'Comprehension, vocabulary & literacy'  },
  { id:'Grammar', emoji:'✏️', color:C.blue,   gradient:[C.blue,   '#1a4bc4'],  desc:'Sentences, punctuation & word types'   },
];

// ── SCORING & RECOMMENDATIONS ─────────────────────────────
const analyzeResults = (subject, answers, questions) => {
  const results = questions.map(q => ({
    ...q,
    correct: answers[q.id] === q.correct,
    answered: answers[q.id],
  }));

  const correctCount = results.filter(r => r.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);

  // Find skill gaps
  const skillMap = {};
  results.forEach(r => {
    if (!skillMap[r.skill]) skillMap[r.skill] = { correct:0, total:0 };
    skillMap[r.skill].total++;
    if (r.correct) skillMap[r.skill].correct++;
  });

  const weakSkills   = Object.entries(skillMap).filter(([,v]) => v.correct/v.total < 0.6).map(([k]) => k);
  const strongSkills = Object.entries(skillMap).filter(([,v]) => v.correct/v.total >= 0.8).map(([k]) => k);

  // Determine recommended level
  let recommendedLevel = 1;
  if (score >= 80) recommendedLevel = 5;
  else if (score >= 65) recommendedLevel = 4;
  else if (score >= 50) recommendedLevel = 3;
  else if (score >= 35) recommendedLevel = 2;
  else recommendedLevel = 1;

  // Performance label
  const label = score >= 80 ? 'Advanced' : score >= 60 ? 'Proficient' : score >= 40 ? 'Developing' : 'Beginning';
  const emoji = score >= 80 ? '🏆' : score >= 60 ? '🌟' : score >= 40 ? '📈' : '🌱';

  return { score, correctCount, total:questions.length, weakSkills, strongSkills, recommendedLevel, label, emoji, results };
};

// ── QUESTION SCREEN ───────────────────────────────────────
const QuestionScreen = ({ question, index, total, onAnswer, subject }) => {
  const [selected, setSelected] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const subj = SUBJECTS.find(s => s.id === subject);

  useState(() => {
    Animated.timing(fadeAnim, { toValue:1, duration:300, useNativeDriver:true }).start();
  });

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt), 700);
  };

  const progress = ((index) / total) * 100;

  return (
    <View style={{ flex:1 }}>
      {/* Progress bar */}
      <LinearGradient colors={subj.gradient} style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
          <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:'600' }}>
            {subj.emoji} {subject} Diagnostic
          </Text>
          <Text style={{ color:'#fff', fontWeight:'800' }}>{index}/{total}</Text>
        </View>
        <View style={{ backgroundColor:'rgba(255,255,255,0.3)', borderRadius:99, height:8, overflow:'hidden' }}>
          <View style={{ width:`${progress}%`, backgroundColor:'#fff', height:'100%', borderRadius:99 }} />
        </View>
        <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:6 }}>
          Level {question.level} · {question.skill}
        </Text>
      </LinearGradient>

      <Animated.View style={{ flex:1, padding:20, opacity:fadeAnim }}>
        <Text style={{ fontSize:11, fontWeight:'700', color:C.muted, textTransform:'uppercase',
          letterSpacing:1, marginBottom:10 }}>Question {index} of {total}</Text>
        <Text style={{ fontSize:20, fontWeight:'900', color:C.text, lineHeight:30, marginBottom:24 }}>
          {question.question}
        </Text>

        <View style={{ gap:12 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect  = opt === question.correct;
            let bg = C.white, bc = C.border, tc = C.text;
            if (selected) {
              if (isCorrect)              { bg='#e8faf1'; bc=C.green;    tc=C.green;  }
              else if (isSelected)        { bg='#fff0f0'; bc='#ff6b6b';  tc='#d63031';}
            } else if (isSelected)        { bg='#fff0e8'; bc=C.orange; }
            return (
              <TouchableOpacity key={i} onPress={() => handleSelect(opt)} disabled={!!selected}
                style={{ backgroundColor:bg, borderWidth:2, borderColor:bc, borderRadius:14,
                  padding:16, flexDirection:'row', alignItems:'center', gap:12 }}>
                <View style={{ width:28, height:28, borderRadius:14, backgroundColor:bc,
                  alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{'ABCD'[i]}</Text>
                </View>
                <Text style={{ fontSize:15, fontWeight:'600', color:tc, flex:1 }}>{opt}</Text>
                {selected && isCorrect   && <Text style={{ fontSize:18 }}>✅</Text>}
                {selected && isSelected && !isCorrect && <Text style={{ fontSize:18 }}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

// ── RESULTS SCREEN ────────────────────────────────────────
const ResultsScreen = ({ subject, analysis, onRetake, onDone }) => {
  const subj = SUBJECTS.find(s => s.id === subject);
  const { score, correctCount, total, weakSkills, strongSkills, recommendedLevel, label, emoji } = analysis;

  return (
    <ScrollView style={{ flex:1, backgroundColor:C.bg }} showsVerticalScrollIndicator={false}>
      {/* Score header */}
      <LinearGradient colors={subj.gradient} style={{ padding:28, alignItems:'center' }}>
        <Text style={{ fontSize:64, marginBottom:8 }}>{emoji}</Text>
        <Text style={{ fontSize:24, fontWeight:'900', color:'#fff', marginBottom:4 }}>{label}!</Text>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginBottom:16 }}>
          {subj.emoji} {subject} Diagnostic Complete
        </Text>
        <View style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:16, padding:16,
          width:'100%', alignItems:'center' }}>
          <Text style={{ fontSize:48, fontWeight:'900', color:'#fff' }}>{score}%</Text>
          <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>
            {correctCount} of {total} correct
          </Text>
        </View>
      </LinearGradient>

      <View style={{ padding:16, gap:14 }}>

        {/* Recommended level */}
        <View style={{ backgroundColor:C.white, borderRadius:18, padding:18, elevation:3,
          borderLeftWidth:5, borderLeftColor:subj.color }}>
          <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, marginBottom:6 }}>
            📊 RECOMMENDED LEVEL
          </Text>
          <Text style={{ fontSize:22, fontWeight:'900', color:subj.color }}>
            Grade {recommendedLevel} Content
          </Text>
          <Text style={{ color:C.muted, fontSize:13, marginTop:4 }}>
            Based on your results, we recommend starting with Grade {recommendedLevel} {subject} worksheets.
          </Text>
        </View>

        {/* Skill breakdown */}
        <View style={{ backgroundColor:C.white, borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontSize:15, fontWeight:'800', color:C.text, marginBottom:14 }}>
            📈 Skill Breakdown
          </Text>
          {analysis.results.map((r, i) => (
            <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:10,
              paddingVertical:8, borderBottomWidth: i < analysis.results.length-1 ? 1:0,
              borderBottomColor:'#f5f5f5' }}>
              <Text style={{ fontSize:18 }}>{r.correct ? '✅' : '❌'}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:13, fontWeight:'700', color:C.text }}>{r.skill}</Text>
                <Text style={{ fontSize:11, color:C.muted }}>Level {r.level}</Text>
              </View>
              <View style={{ backgroundColor: r.correct?'#e8faf1':'#fff0f0',
                borderRadius:8, paddingVertical:3, paddingHorizontal:8 }}>
                <Text style={{ fontSize:11, fontWeight:'700',
                  color: r.correct?C.green:'#d63031' }}>
                  {r.correct ? 'Strong' : 'Needs work'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weak areas */}
        {weakSkills.length > 0 && (
          <View style={{ backgroundColor:'#fff0f0', borderRadius:18, padding:18,
            borderWidth:2, borderColor:'#fca5a5' }}>
            <Text style={{ fontSize:15, fontWeight:'800', color:'#d63031', marginBottom:10 }}>
              🎯 Focus Areas
            </Text>
            <Text style={{ color:'#555', fontSize:13, marginBottom:12 }}>
              Practice these skills to improve your {subject} level:
            </Text>
            <View style={{ gap:8 }}>
              {weakSkills.map((skill, i) => (
                <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <View style={{ width:8, height:8, borderRadius:4, backgroundColor:'#f05a1a' }} />
                  <Text style={{ fontSize:14, fontWeight:'700', color:C.text }}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Strong areas */}
        {strongSkills.length > 0 && (
          <View style={{ backgroundColor:'#e8faf1', borderRadius:18, padding:18,
            borderWidth:2, borderColor:'#86efac' }}>
            <Text style={{ fontSize:15, fontWeight:'800', color:C.green, marginBottom:10 }}>
              💪 Your Strengths
            </Text>
            <View style={{ gap:8 }}>
              {strongSkills.map((skill, i) => (
                <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <Text style={{ fontSize:14 }}>⭐</Text>
                  <Text style={{ fontSize:14, fontWeight:'700', color:C.text }}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommended resources */}
        <View style={{ backgroundColor:C.white, borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontSize:15, fontWeight:'800', color:C.text, marginBottom:4 }}>
            📚 Your Learning Path
          </Text>
          <Text style={{ color:C.muted, fontSize:13, marginBottom:14 }}>
            Recommended worksheets based on your results:
          </Text>
          {[1,2,3].map(i => (
            <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:12,
              backgroundColor:subj.color+'10', borderRadius:12, padding:12, marginBottom:8 }}>
              <Text style={{ fontSize:24 }}>{subj.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ fontWeight:'700', fontSize:13, color:C.text }}>
                  Grade {Math.min(recommendedLevel + i - 1, 5)} {subject} Practice
                </Text>
                <Text style={{ color:C.muted, fontSize:11 }}>
                  {weakSkills[i-1] ? `Focus: ${weakSkills[i-1]}` : 'Mixed practice'}
                </Text>
              </View>
              <View style={{ backgroundColor:subj.color, borderRadius:8,
                paddingVertical:4, paddingHorizontal:10 }}>
                <Text style={{ color:'#fff', fontSize:11, fontWeight:'800' }}>Start →</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection:'row', gap:12, marginTop:4, marginBottom:20 }}>
          <TouchableOpacity onPress={onRetake}
            style={{ flex:1, borderWidth:2, borderColor:subj.color, borderRadius:14,
              padding:14, alignItems:'center' }}>
            <Text style={{ color:subj.color, fontWeight:'800' }}>↺ Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDone}
            style={{ flex:1, backgroundColor:subj.color, borderRadius:14,
              padding:14, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>✓ Done!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// ── MAIN DIAGNOSTIC SCREEN ────────────────────────────────
export default function DiagnosticScreen() {
  const router  = useRouter();
  const [phase,    setPhase]    = useState('select');  // select | intro | questions | results
  const [subject,  setSubject]  = useState(null);
  const [qIndex,   setQIndex]   = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [analysis, setAnalysis] = useState(null);

  const questions = subject ? DIAGNOSTIC_QUESTIONS[subject] : [];

  const handleSubjectSelect = (subj) => {
    setSubject(subj);
    setPhase('intro');
    setQIndex(0);
    setAnswers({});
    setAnalysis(null);
  };

  const handleAnswer = (answer) => {
    const q   = questions[qIndex];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);
    if (qIndex + 1 >= questions.length) {
      // Done — analyze results
      const result = analyzeResults(subject, newAnswers, questions);
      setAnalysis(result);
      // Save to Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          setDoc(doc(db, 'users', user.uid), {
            [`diagnostic_${subject.toLowerCase()}`]: {
              score:            result.score,
              recommendedLevel: result.recommendedLevel,
              weakSkills:       result.weakSkills,
              completedAt:      new Date().toISOString(),
            }
          }, { merge: true });
        }
      } catch(e) { console.warn('Diagnostic save failed', e); }
      setPhase('results');
    } else {
      setQIndex(i => i + 1);
    }
  };

  // ── SELECT SUBJECT ──────────────────────────────────────
  if (phase === 'select') return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.orange, C.orange2]} style={{ padding:20, paddingBottom:28 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom:12 }}>
          <Text style={{ color:'#fff', fontSize:18 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:26, fontWeight:'900', color:'#fff' }}>🔍 Diagnostic Test</Text>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginTop:4 }}>
          Find out your level and get a personalized learning path!
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, gap:14 }}>
        <View style={{ backgroundColor:'#fffbe6', borderWidth:2, borderColor:C.amber,
          borderRadius:14, padding:14, flexDirection:'row', gap:10 }}>
          <Text style={{ fontSize:20 }}>💡</Text>
          <View style={{ flex:1 }}>
            <Text style={{ fontWeight:'700', color:'#7a5c00', fontSize:13 }}>How it works</Text>
            <Text style={{ color:'#9a7000', fontSize:12, marginTop:2, lineHeight:18 }}>
              Answer 10 questions per subject. We'll find your level and recommend the best worksheets for you!
            </Text>
          </View>
        </View>

        <Text style={{ fontSize:18, fontWeight:'900', color:C.text }}>Choose a Subject:</Text>

        {SUBJECTS.map(subj => (
          <TouchableOpacity key={subj.id} onPress={() => handleSubjectSelect(subj.id)}
            style={{ backgroundColor:C.white, borderRadius:20, overflow:'hidden',
              elevation:4, shadowColor:'#000', shadowOffset:{width:0,height:3},
              shadowOpacity:0.1, shadowRadius:10 }}>
            <LinearGradient colors={subj.gradient} style={{ padding:20, flexDirection:'row',
              alignItems:'center', gap:16 }}>
              <Text style={{ fontSize:44 }}>{subj.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:20, fontWeight:'900', color:'#fff' }}>{subj.id}</Text>
                <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:13, marginTop:2 }}>{subj.desc}</Text>
                <View style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:8,
                  paddingVertical:3, paddingHorizontal:10, alignSelf:'flex-start', marginTop:8 }}>
                  <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>10 questions · ~5 mins</Text>
                </View>
              </View>
              <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:28 }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // ── INTRO ───────────────────────────────────────────────
  if (phase === 'intro') {
    const subj = SUBJECTS.find(s => s.id === subject);
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
        <LinearGradient colors={subj.gradient} style={{ flex:1, justifyContent:'center',
          alignItems:'center', padding:32 }}>
          <Text style={{ fontSize:72, marginBottom:16 }}>{subj.emoji}</Text>
          <Text style={{ fontSize:28, fontWeight:'900', color:'#fff', marginBottom:8,
            textAlign:'center' }}>{subject} Diagnostic</Text>
          <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:15, textAlign:'center',
            lineHeight:24, marginBottom:32 }}>
            You'll answer 10 questions across different skill levels.{'\n'}
            Take your time — there's no timer!{'\n\n'}
            We'll use your results to build your personalized learning path. 🦊
          </Text>
          <View style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:16,
            padding:16, width:'100%', marginBottom:32 }}>
            {[
              '10 questions covering Grades 1–5',
              'No time pressure — go at your own pace',
              'Instant personalized recommendations',
              'Your results save to your profile',
            ].map((tip,i) => (
              <View key={i} style={{ flexDirection:'row', gap:10, marginBottom: i<3?10:0 }}>
                <Text style={{ color:C.amber, fontSize:14 }}>✓</Text>
                <Text style={{ color:'rgba(255,255,255,0.9)', fontSize:13 }}>{tip}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setPhase('questions')}
            style={{ backgroundColor:'#fff', borderRadius:16, padding:18,
              paddingHorizontal:40, width:'100%', alignItems:'center' }}>
            <Text style={{ color:subj.color, fontWeight:'900', fontSize:18 }}>
              🚀 Start Diagnostic!
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPhase('select')} style={{ marginTop:16 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:14 }}>← Choose different subject</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ── QUESTIONS ───────────────────────────────────────────
  if (phase === 'questions') return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <QuestionScreen
        key={qIndex}
        question={questions[qIndex]}
        index={qIndex + 1}
        total={questions.length}
        subject={subject}
        onAnswer={handleAnswer} />
    </SafeAreaView>
  );

  // ── RESULTS ─────────────────────────────────────────────
  if (phase === 'results' && analysis) return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <ResultsScreen
        subject={subject}
        analysis={analysis}
        onRetake={() => { setQIndex(0); setAnswers({}); setPhase('intro'); }}
        onDone={() => router.back()} />
    </SafeAreaView>
  );

  return null;
}

const styles = StyleSheet.create({});
