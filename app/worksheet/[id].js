import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';
import { saveProgress, updateUserStats } from '../../src/firebase/progress';
import { WORKSHEETS } from '../../src/data/worksheets';
import { getLevelInfo, checkNewBadges, calcStreak } from '../../src/utils/gamification';
import { getContent } from '../../src/firebase/content';

const C = {
  orange:'#f05a1a', orange2:'#c0392b', green:'#26de81',
  blue:'#2563eb', amber:'#f7b731',
  bg:'#fff8f5', text:'#1a0a00', muted:'#9a6a50', border:'#ffe0cc',
};

// ── PASSAGE READER ────────────────────────────────────────
const PassageReader = ({ passage, grade, onStart, onBack }) => (
  <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
    <LinearGradient colors={[C.green, '#1aaf5e']} style={{ padding:20 }}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom:12 }}>
        <Text style={{ color:'#fff', fontSize:18 }}>←</Text>
      </TouchableOpacity>
      <Text style={{ fontSize:40, marginBottom:6 }}>{passage.emoji}</Text>
      <Text style={{ fontSize:22, fontWeight:'900', color:'#fff' }}>{passage.title}</Text>
      <Text style={{ fontSize:13, color:'rgba(255,255,255,0.85)', marginTop:2, marginBottom:10 }}>
        Reading Comprehension · Grade {grade}
      </Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
        {[`⏱️ ${passage.readingTime}`, `📝 ${passage.wordCount} words`, '❓ Questions'].map((c,i)=>(
          <View key={i} style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:99, paddingVertical:3, paddingHorizontal:10 }}>
            <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>{c}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <View style={{ backgroundColor:'#fffbe6', borderWidth:2, borderColor:C.amber, borderRadius:14, padding:12, marginBottom:16, flexDirection:'row', gap:10 }}>
        <Text style={{ fontSize:18 }}>💡</Text>
        <Text style={{ fontSize:13, color:'#7a5c00', flex:1, lineHeight:18 }}>
          Read carefully — you can come back to re-read before answering!
        </Text>
      </View>
      <View style={{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', marginBottom:20, elevation:3 }}>
        <View style={{ height:5, backgroundColor:C.green }} />
        <View style={{ padding:20 }}>
          <Text style={{ fontSize:18, fontWeight:'900', color:C.text, marginBottom:16 }}>
            {passage.emoji} {passage.title}
          </Text>
          {passage.text.split('\n\n').filter(Boolean).map((para,i)=>{
            const isD = para.startsWith('"') || para.includes('" said') || para.includes('" asked');
            return <Text key={i} style={[{ fontSize:15, lineHeight:26, color:'#333', marginBottom:12 },
              isD && { fontStyle:'italic', fontWeight:'600', paddingLeft:12, borderLeftWidth:3, borderLeftColor:'#26de8155' }]}>{para}</Text>;
          })}
        </View>
      </View>
      <TouchableOpacity onPress={onStart}
        style={{ backgroundColor:C.green, borderRadius:14, padding:16, alignItems:'center', marginBottom:32 }}>
        <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>✅ I've Read It — Start Questions!</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// ── QUIZ TIMER ────────────────────────────────────────────
const QuizTimer = ({ timeLimit, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit || 60);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 0) { onTimeUp(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 10) {
      Animated.sequence([
        Animated.timing(anim, { toValue:1.2, duration:200, useNativeDriver:true }),
        Animated.timing(anim, { toValue:1,   duration:200, useNativeDriver:true }),
      ]).start();
    }
  }, [timeLeft]);

  const pct = (timeLeft / (timeLimit || 60)) * 100;
  const col = timeLeft > 20 ? C.green : timeLeft > 10 ? C.amber : '#ff4444';

  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:10, padding:12 }}>
      <Animated.Text style={{ fontSize:20, fontWeight:'900', color:col, transform:[{scale:anim}] }}>
        ⏱️ {timeLeft}s
      </Animated.Text>
      <View style={{ flex:1, backgroundColor:'#ffe0cc', borderRadius:99, height:8, overflow:'hidden' }}>
        <View style={{ width:`${pct}%`, backgroundColor:col, height:'100%', borderRadius:99 }} />
      </View>
    </View>
  );
};

// ── SUMMARY ───────────────────────────────────────────────
const Summary = ({ score, correct, total, xpEarned, title, isQuiz, onRetry, onDone, saving }) => (
  <SafeAreaView style={{ flex:1 }}>
    <LinearGradient colors={[C.orange, C.orange2]}
      style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24 }}>
      <Text style={{ fontSize:72 }}>{score>=80?'🎉':score>=60?'😊':'💪'}</Text>
      <Text style={{ fontSize:28, fontWeight:'900', color:'#fff', marginTop:12 }}>
        {score>=80?'Amazing!':score>=60?'Good Job!':'Keep Going!'}
      </Text>
      <Text style={{ color:'rgba(255,255,255,0.8)', marginTop:4, marginBottom:20 }}>{title}</Text>
      {isQuiz && <View style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:10, paddingVertical:6, paddingHorizontal:14, marginBottom:12 }}>
        <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>⏱️ Timed Quiz</Text>
      </View>}
      <View style={{ flexDirection:'row', gap:4, marginBottom:12 }}>
        {[1,2,3].map(i=><Text key={i} style={{ fontSize:28, opacity:i<=(score>=90?3:score>=60?2:1)?1:0.3 }}>⭐</Text>)}
      </View>
      <Text style={{ fontSize:52, fontWeight:'900', color:'#fff', marginBottom:4 }}>{score}%</Text>
      <Text style={{ color:'rgba(255,255,255,0.8)', marginBottom:20 }}>{correct} of {total} correct</Text>
      <View style={{ backgroundColor:C.amber, borderRadius:99, paddingVertical:6, paddingHorizontal:16, marginBottom:28 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>⚡ +{xpEarned} XP earned!</Text>
      </View>
      {saving ? (
        <ActivityIndicator color="#fff" style={{ marginBottom:20 }} />
      ) : (
        <View style={{ flexDirection:'row', gap:12 }}>
          <TouchableOpacity onPress={onRetry}
            style={{ borderWidth:2, borderColor:'#fff', borderRadius:12, paddingVertical:12, paddingHorizontal:20 }}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>↺ Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDone}
            style={{ backgroundColor:'#fff', borderRadius:12, paddingVertical:12, paddingHorizontal:20 }}>
            <Text style={{ color:C.orange, fontWeight:'800' }}>✓ Done!</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  </SafeAreaView>
);

// ── SINGLE QUESTION VIEW ──────────────────────────────────
const QuestionView = ({ question, index, total, isQuiz, isReading, worksheet, onAnswer, onBack, showPassage, onShowPassage }) => {
  const [selected,   setSelected]   = useState(null);
  const [textInput,  setTextInput]  = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    Animated.timing(fadeAnim, { toValue:1, duration:250, useNativeDriver:true }).start();
  }, [index]);

  const handleAnswer = (ans) => {
    if (selected !== null) return;
    const correct = ans.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase();
    setSelected(ans);
    setTimeout(() => onAnswer(ans, correct), isQuiz ? 400 : 800);
  };

  const progress = ((index) / total) * 100;
  const accentColor = isQuiz ? C.blue : isReading ? C.green : C.orange;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      {/* Top bar */}
      <View style={{ backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:C.border }}>
        <View style={{ flexDirection:'row', alignItems:'center', padding:12 }}>
          <TouchableOpacity onPress={onBack} style={{ padding:4 }}>
            <Text style={{ fontSize:20 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex:1, backgroundColor:'#ffe0cc', borderRadius:99, height:10, overflow:'hidden', marginHorizontal:12 }}>
            <View style={{ width:`${progress}%`, backgroundColor:accentColor, height:'100%', borderRadius:99 }} />
          </View>
          <Text style={{ fontWeight:'700', fontSize:13, color:C.muted }}>{index+1}/{total}</Text>
          {isReading && (
            <TouchableOpacity onPress={onShowPassage}
              style={{ backgroundColor:'#e8faf1', borderWidth:2, borderColor:C.green, borderRadius:8, paddingVertical:5, paddingHorizontal:10, marginLeft:8 }}>
              <Text style={{ color:'#1aaf5e', fontWeight:'700', fontSize:12 }}>📖 Re-read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity:fadeAnim }}>
          {/* Tags */}
          <View style={{ flexDirection:'row', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            <View style={{ backgroundColor:accentColor+'18', borderRadius:8, paddingVertical:4, paddingHorizontal:12 }}>
              <Text style={{ fontSize:12, fontWeight:'800', color:accentColor }}>
                {worksheet.icon} {isQuiz?'Quiz':isReading?'Reading Comprehension':worksheet.subject} · Grade {worksheet.grade}
              </Text>
            </View>
            {isQuiz && <View style={{ backgroundColor:C.blue+'15', borderRadius:8, paddingVertical:4, paddingHorizontal:10 }}>
              <Text style={{ fontSize:11, fontWeight:'700', color:C.blue }}>⏱️ Timed</Text>
            </View>}
          </View>

          <Text style={{ fontSize:11, fontWeight:'700', color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
            Question {index+1} of {total}
          </Text>
          <Text style={{ fontSize:19, fontWeight:'900', color:C.text, lineHeight:28, marginBottom:20 }}>
            {question.question}
          </Text>

          {/* MULTIPLE CHOICE */}
          {question.type === 'multiple_choice' && (
            <View style={{ gap:10 }}>
              {(question.options||[]).map((opt,i)=>{
                const isSel    = selected === opt;
                const isRight  = opt === question.correctAnswer;
                let bg = '#fff', bc = C.border;
                if (selected !== null) {
                  if (isRight)            { bg='#e8faf1'; bc=C.green; }
                  else if (isSel)         { bg='#fff0f0'; bc='#ff6b6b'; }
                }
                return (
                  <TouchableOpacity key={i} onPress={()=>handleAnswer(opt)} disabled={selected!==null}
                    style={{ backgroundColor:bg, borderWidth:2, borderColor:bc, borderRadius:14, padding:16, flexDirection:'row', alignItems:'center', gap:12 }}>
                    <View style={{ width:28, height:28, borderRadius:14, backgroundColor:bc, alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{'ABCD'[i]}</Text>
                    </View>
                    <Text style={{ fontSize:15, fontWeight:'600', color:C.text, flex:1 }}>{opt}</Text>
                    {selected!==null && isRight  && <Text>✅</Text>}
                    {selected!==null && isSel && !isRight && <Text>❌</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* TRUE / FALSE */}
          {question.type === 'true_false' && (
            <View style={{ flexDirection:'row', gap:12 }}>
              {['True','False'].map(tf=>{
                const isSel   = selected === tf;
                const isRight = tf === question.correctAnswer;
                let bg = '#fff', bc = C.border;
                if (selected !== null) {
                  if (isRight) { bg='#e8faf1'; bc=C.green; }
                  else if (isSel) { bg='#fff0f0'; bc='#ff6b6b'; }
                }
                return (
                  <TouchableOpacity key={tf} onPress={()=>handleAnswer(tf)} disabled={selected!==null}
                    style={{ flex:1, backgroundColor:bg, borderWidth:2, borderColor:bc, borderRadius:14, padding:18, alignItems:'center' }}>
                    <Text style={{ fontSize:18, marginBottom:4 }}>{tf==='True'?'✓':'✗'}</Text>
                    <Text style={{ fontSize:16, fontWeight:'800', color:C.text }}>{tf}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* FILL IN BLANK */}
          {question.type === 'fill_blank' && (
            <View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {'abcdefghijklmnopqrstuvwxyz'.split('').map(l=>(
                  <TouchableOpacity key={l} onPress={()=>selected===null&&setTextInput(t=>t+l)}
                    style={{ backgroundColor:'#fff', borderWidth:1, borderColor:C.border, borderRadius:8, width:34, height:34, alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ fontWeight:'700', fontSize:12 }}>{l}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={()=>setTextInput(t=>t.slice(0,-1))}
                  style={{ backgroundColor:'#ffe0cc', borderRadius:8, width:34, height:34, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontWeight:'700' }}>⌫</Text>
                </TouchableOpacity>
              </View>
              <View style={{ borderWidth:2, borderColor: selected!==null?(selected===question.correctAnswer?C.green:'#ff6b6b'):C.border,
                borderRadius:14, padding:14, marginBottom:12, minHeight:52,
                backgroundColor: selected!==null?(selected===question.correctAnswer?'#e8faf1':'#fff0f0'):'#fff' }}>
                <Text style={{ fontSize:16, color:textInput||selected!==null?C.text:C.muted }}>
                  {selected!==null?selected:textInput||'Tap letters above...'}
                </Text>
              </View>
              {selected===null && (
                <TouchableOpacity onPress={()=>textInput&&handleAnswer(textInput)} disabled={!textInput}
                  style={{ borderRadius:14, padding:14, alignItems:'center', backgroundColor:textInput?C.orange:'#ddd' }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:15 }}>Check Answer ✓</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Feedback + Explanation */}
          {selected !== null && (
            <>
              <View style={{ marginTop:14, borderRadius:12, padding:14,
                backgroundColor: selected===question.correctAnswer?'#e8faf1':'#fff0f0' }}>
                <Text style={{ fontWeight:'800', fontSize:15,
                  color: selected===question.correctAnswer?'#1a9e5c':'#d63031' }}>
                  {selected===question.correctAnswer ? '✅ Correct!' : `❌ Answer: ${question.correctAnswer}`}
                </Text>
              </View>
              {question.explanation && (
                <View style={{ marginTop:10, backgroundColor:'#fff0e8', borderRadius:12, padding:14 }}>
                  <Text style={{ fontSize:14, color:'#555', lineHeight:22 }}>💡 {question.explanation}</Text>
                </View>
              )}
              {!isQuiz && (
                <TouchableOpacity onPress={()=>onAnswer(selected, selected===question.correctAnswer)}
                  style={{ marginTop:14, backgroundColor:accentColor, borderRadius:14, padding:14, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:15 }}>
                    {index < total-1 ? 'Next Question →' : 'See Results 🎉'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── MAIN SCREEN ───────────────────────────────────────────
export default function WorksheetScreen() {
  const { id }   = useLocalSearchParams();
  const router   = useRouter();

  const [worksheet, setWorksheet] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [user,      setUser]      = useState(null);
  const [phase,     setPhase]     = useState('loading'); // loading|reading|questions|results
  const [qIndex,    setQIndex]    = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [showPassagePanel, setShowPassagePanel] = useState(false);

  // Load worksheet — from Firestore first, fallback to local
  useEffect(()=>{
    const loadWS = async () => {
      setLoading(true);
      try {
        const content = await getContent();
        const found = content.find(w=>w.id===id);
        if (found) {
          setWorksheet(found);
          setPhase(found.hasPassage && found.passage?.text ? 'reading' : 'questions');
        } else {
          // Fallback to local data
          const local = WORKSHEETS.find(w=>w.id===id);
          if (local) {
            setWorksheet(local);
            setPhase(local.passage ? 'reading' : 'questions');
          }
        }
      } catch (e) {
        const local = WORKSHEETS.find(w=>w.id===id);
        if (local) { setWorksheet(local); setPhase(local.passage?'reading':'questions'); }
      }
      setLoading(false);
    };
    loadWS();
  },[id]);

  // Auth
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>setUser(u));
    return unsub;
  },[]);

  const isQuiz    = worksheet?.type === 'quiz';
  const isReading = worksheet?.type === 'reading' || !!worksheet?.passage;
  const questions = worksheet?.questions || [];

  const handleAnswer = (ans, correct) => {
    const newAnswers = [...answers, { qId: questions[qIndex]?.id, ans, correct }];
    setAnswers(newAnswers);

    if (qIndex + 1 >= questions.length) {
      // Done
      const correctCount = newAnswers.filter(a=>a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      setSummary({ score, correct: correctCount });
      setPhase('results');
    } else {
      if (isQuiz) {
        // Quiz: auto-advance immediately
        setTimeout(()=>setQIndex(i=>i+1), 400);
      } else {
        // Worksheet: wait for "Next" button tap (handled in QuestionView)
        setTimeout(()=>setQIndex(i=>i+1), 100);
      }
    }
  };

  const handleTimeUp = () => {
    const correctCount = answers.filter(a=>a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    setSummary({ score, correct: correctCount, timeUp: true });
    setPhase('results');
  };

  const handleDone = async () => {
    if (!summary) return;
    setSaving(true);
    const xpEarned = Math.round((worksheet.xpReward||50) * (summary.score/100));
    try {
      if (user) {
        await saveProgress(user.uid, worksheet.id, summary.score, xpEarned);
        const userSnap = await getDoc(doc(db,'users',user.uid));
        if (userSnap.exists()) {
          const ud = userSnap.data();
          const newXP     = (ud.xp||0) + xpEarned;
          const newStreak = calcStreak(ud.lastActive?.toDate?.()?.getTime(), ud.streak||0);
          const { allBadges } = checkNewBadges({...ud,xp:newXP,streak:newStreak},[]);
          await updateUserStats(user.uid, newXP, newStreak, allBadges);
          const oldLevel = getLevelInfo(ud.xp||0).level;
          if (getLevelInfo(newXP).level > oldLevel) {
            Alert.alert('⬆️ Level Up!', `You're now a ${getLevelInfo(newXP).name}! 🎉`);
          }
        }
      }
    } catch(e){ console.warn('Save error:',e); }
    setSaving(false);
    router.back();
  };

  const resetAndRetry = () => {
    setQIndex(0);
    setAnswers([]);
    setSummary(null);
    setPhase(isReading && worksheet?.passage?.text ? 'reading' : 'questions');
  };

  // ── LOADING ──────────────────────────────────────────────
  if (loading || phase==='loading') return (
    <SafeAreaView style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.bg }}>
      <ActivityIndicator size="large" color={C.orange} />
    </SafeAreaView>
  );

  if (!worksheet) return (
    <SafeAreaView style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.bg }}>
      <Text style={{ fontSize:48 }}>🔭</Text>
      <Text style={{ color:C.muted, marginTop:12 }}>Content not found</Text>
      <TouchableOpacity onPress={()=>router.back()}
        style={{ marginTop:20, backgroundColor:C.orange, borderRadius:12, padding:14 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── PASSAGE ──────────────────────────────────────────────
  if (phase==='reading') return (
    <PassageReader passage={worksheet.passage} grade={worksheet.grade}
      onStart={()=>setPhase('questions')} onBack={()=>router.back()} />
  );

  // ── RESULTS ──────────────────────────────────────────────
  if (phase==='results' && summary) {
    const xpEarned = Math.round((worksheet.xpReward||50) * (summary.score/100));
    return (
      <Summary score={summary.score} correct={summary.correct}
        total={questions.length} xpEarned={xpEarned}
        title={worksheet.title} isQuiz={isQuiz}
        saving={saving} onRetry={resetAndRetry} onDone={handleDone} />
    );
  }

  // ── QUESTIONS ─────────────────────────────────────────────
  if (phase==='questions' && questions.length > 0) {
    return (
      <>
        {/* Passage slide panel */}
        {showPassagePanel && worksheet.passage && (
          <View style={{ position:'absolute', inset:0, zIndex:50, flexDirection:'row' }}>
            <TouchableOpacity style={{ flex:0.25, backgroundColor:'rgba(0,0,0,0.4)' }} onPress={()=>setShowPassagePanel(false)} />
            <View style={{ flex:0.75, backgroundColor:'#fff', elevation:20 }}>
              <LinearGradient colors={[C.green,'#1aaf5e']} style={{ padding:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={{ fontWeight:'900', fontSize:16, color:'#fff', flex:1 }}>{worksheet.passage.emoji} {worksheet.passage.title}</Text>
                <TouchableOpacity onPress={()=>setShowPassagePanel(false)}
                  style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:99, width:28, height:28, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800' }}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>
              <ScrollView contentContainerStyle={{ padding:18 }}>
                {worksheet.passage.text.split('\n\n').filter(Boolean).map((para,i)=>{
                  const isD = para.startsWith('"') || para.includes('" said');
                  return <Text key={i} style={[{ fontSize:14, lineHeight:24, color:'#333', marginBottom:12 }, isD&&{ fontStyle:'italic', fontWeight:'600' }]}>{para}</Text>;
                })}
              </ScrollView>
              <View style={{ padding:14 }}>
                <TouchableOpacity onPress={()=>setShowPassagePanel(false)}
                  style={{ backgroundColor:C.green, borderRadius:12, padding:12, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800' }}>✓ Back to Questions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Quiz timer lives here so it doesn't reset between questions */}
        {isQuiz && (
          <QuizTimer timeLimit={worksheet.timeLimit||60} onTimeUp={handleTimeUp} />
        )}
        <QuestionView
          key={qIndex}
          question={questions[qIndex]}
          index={qIndex}
          total={questions.length}
          isQuiz={isQuiz}
          isReading={isReading}
          worksheet={worksheet}
          onAnswer={handleAnswer}
          onBack={()=>router.back()}
          onShowPassage={()=>setShowPassagePanel(true)}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.bg }}>
      <Text style={{ fontSize:48 }}>📭</Text>
      <Text style={{ color:C.muted, marginTop:12 }}>No questions found</Text>
      <TouchableOpacity onPress={()=>router.back()}
        style={{ marginTop:20, backgroundColor:C.orange, borderRadius:12, padding:14 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({});
