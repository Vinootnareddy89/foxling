import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const C = {
  orange:'#f05a1a', orange2:'#c0392b', amber:'#f7b731',
  green:'#26de81', purple:'#7c3aed', blue:'#2563eb',
  bg:'#fff8f5', white:'#ffffff', text:'#1a0a00', muted:'#9a6a50', border:'#ffe0cc',
};

// ── GAME DATA ─────────────────────────────────────────────
const QUICK_FIRE_QS = [
  { q:'2 + 3',    a:'5'   }, { q:'7 - 4',    a:'3'   }, { q:'3 × 3',    a:'9'   },
  { q:'10 ÷ 2',  a:'5'   }, { q:'4 + 6',    a:'10'  }, { q:'8 - 5',    a:'3'   },
  { q:'2 × 6',   a:'12'  }, { q:'15 ÷ 3',   a:'5'   }, { q:'9 + 4',    a:'13'  },
  { q:'12 - 7',  a:'5'   }, { q:'5 × 4',    a:'20'  }, { q:'18 ÷ 6',   a:'3'   },
  { q:'6 + 8',   a:'14'  }, { q:'11 - 6',   a:'5'   }, { q:'3 × 7',    a:'21'  },
  { q:'20 ÷ 4',  a:'5'   }, { q:'7 + 9',    a:'16'  }, { q:'13 - 8',   a:'5'   },
];

const MEMORY_PAIRS = [
  { id:'a', emoji:'🐶', match:'dog'  }, { id:'b', emoji:'🐱', match:'cat'   },
  { id:'c', emoji:'🐸', match:'frog' }, { id:'d', emoji:'🦊', match:'fox'   },
  { id:'e', emoji:'🐻', match:'bear' }, { id:'f', emoji:'🦁', match:'lion'  },
];

const PAIR_UP_DATA = [
  { word:'Dog',    match:'Animal'  }, { word:'Apple',  match:'Fruit'   },
  { word:'Red',    match:'Color'   }, { word:'Run',    match:'Action'  },
  { word:'Happy',  match:'Feeling' }, { word:'Tall',   match:'Size'    },
];

const SORT_DATA = {
  cat1: 'Animals', cat2: 'Foods',
  items: [
    { word:'Dog',    cat:'Animals' }, { word:'Pizza',  cat:'Foods'   },
    { word:'Cat',    cat:'Animals' }, { word:'Apple',  cat:'Foods'   },
    { word:'Bird',   cat:'Animals' }, { word:'Bread',  cat:'Foods'   },
    { word:'Fish',   cat:'Animals' }, { word:'Rice',   cat:'Foods'   },
  ],
};

// ── QUICK FIRE GAME ───────────────────────────────────────
const QuickFire = ({ onDone }) => {
  const [qIndex,   setQIndex]   = useState(0);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selected, setSelected] = useState(null);
  const [options,  setOptions]  = useState([]);
  const [streak,   setStreak]   = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const questions = useRef([...QUICK_FIRE_QS].sort(() => Math.random() - 0.5)).current;
  const current   = questions[qIndex % questions.length];

  // Generate options
  useEffect(() => {
    const correct = current.a;
    const wrong = [];
    while (wrong.length < 3) {
      const offset = Math.floor(Math.random() * 9) - 4;
      const val = String(parseInt(correct) + offset);
      if (val !== correct && !wrong.includes(val) && parseInt(val) > 0) wrong.push(val);
    }
    setOptions([correct, ...wrong].sort(() => Math.random() - 0.5));
    setSelected(null);
  }, [qIndex]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) { onDone(score); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:10,  duration:50, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:-10, duration:50, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:10,  duration:50, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:0,   duration:50, useNativeDriver:true }),
    ]).start();
  };

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.a) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setTimeout(() => setQIndex(i => i + 1), 600);
    } else {
      shake();
      setStreak(0);
      setTimeout(() => setQIndex(i => i + 1), 800);
    }
  };

  const pct = (timeLeft / 60) * 100;
  const timerColor = timeLeft > 20 ? C.green : timeLeft > 10 ? C.amber : '#ff4444';

  return (
    <View style={{ flex:1 }}>
      {/* Header */}
      <LinearGradient colors={[C.amber, '#e67e22']} style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <View style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:10, padding:10, minWidth:70, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontSize:11, fontWeight:'600' }}>SCORE</Text>
            <Text style={{ color:'#fff', fontSize:22, fontWeight:'900' }}>{score}</Text>
          </View>
          <View style={{ alignItems:'center' }}>
            <Text style={{ color:'#fff', fontSize:36, fontWeight:'900' }}>{timeLeft}</Text>
            <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:11 }}>seconds</Text>
          </View>
          <View style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:10, padding:10, minWidth:70, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontSize:11, fontWeight:'600' }}>STREAK</Text>
            <Text style={{ color:'#fff', fontSize:22, fontWeight:'900' }}>{streak}🔥</Text>
          </View>
        </View>
        {/* Timer bar */}
        <View style={{ backgroundColor:'rgba(255,255,255,0.3)', borderRadius:99, height:8, overflow:'hidden' }}>
          <View style={{ width:`${pct}%`, backgroundColor:timerColor, height:'100%', borderRadius:99 }} />
        </View>
      </LinearGradient>

      {/* Question */}
      <Animated.View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24, transform:[{translateX:shakeAnim}] }}>
        <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
          Question {qIndex + 1}
        </Text>
        <Text style={{ fontSize:52, fontWeight:'900', color:C.text, marginBottom:32 }}>{current.q} = ?</Text>
        <View style={{ width:'100%', gap:12 }}>
          {options.map((opt, i) => {
            const isCorrect = opt === current.a;
            const isSelected = selected === opt;
            let bg = C.white;
            let bc = C.border;
            if (isSelected && isCorrect)  { bg = '#e8faf1'; bc = C.green; }
            if (isSelected && !isCorrect) { bg = '#fff0f0'; bc = '#ff6b6b'; }
            if (selected && !isSelected && isCorrect) { bg = '#e8faf1'; bc = C.green; }
            return (
              <TouchableOpacity key={i} onPress={() => handleAnswer(opt)} disabled={!!selected}
                style={{ backgroundColor:bg, borderWidth:2.5, borderColor:bc, borderRadius:16, padding:18, alignItems:'center' }}>
                <Text style={{ fontSize:26, fontWeight:'900', color:C.text }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

// ── MEMORY MATCH GAME ─────────────────────────────────────
const MemoryMatch = ({ onDone }) => {
  const allCards = [
    ...MEMORY_PAIRS.map((p,i) => ({ id:`e${i}`, value:p.emoji, pairId:p.id, type:'emoji' })),
    ...MEMORY_PAIRS.map((p,i) => ({ id:`w${i}`, value:p.match, pairId:p.id, type:'word' })),
  ].sort(() => Math.random() - 0.5);

  const [cards,    setCards]    = useState(allCards.map(c => ({ ...c, flipped:false, matched:false })));
  const [selected, setSelected] = useState([]);
  const [moves,    setMoves]    = useState(0);
  const [matches,  setMatches]  = useState(0);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (selected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = selected;
      if (cards[a].pairId === cards[b].pairId) {
        setCards(prev => prev.map((c,i) => i===a||i===b ? {...c, matched:true} : c));
        setMatches(m => {
          const newM = m + 1;
          if (newM === MEMORY_PAIRS.length) setTimeout(() => setDone(true), 500);
          return newM;
        });
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c,i) => i===a||i===b ? {...c, flipped:false} : c));
          setSelected([]);
        }, 900);
      }
    }
  }, [selected]);

  const flip = (i) => {
    if (selected.length === 2 || cards[i].flipped || cards[i].matched) return;
    setCards(prev => prev.map((c,j) => j===i ? {...c, flipped:true} : c));
    setSelected(prev => [...prev, i]);
  };

  const score = Math.max(0, 200 - moves * 10);

  if (done) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24, backgroundColor:C.bg }}>
      <Text style={{ fontSize:64, marginBottom:12 }}>🎉</Text>
      <Text style={{ fontSize:28, fontWeight:'900', color:C.text, marginBottom:8 }}>All Matched!</Text>
      <Text style={{ color:C.muted, fontSize:16, marginBottom:4 }}>{moves} moves</Text>
      <Text style={{ fontSize:32, fontWeight:'900', color:C.amber, marginBottom:24 }}>⚡ {score} pts</Text>
      <TouchableOpacity onPress={() => onDone(score)} style={{ backgroundColor:C.orange, borderRadius:14, padding:16, paddingHorizontal:32 }}>
        <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>✓ Done!</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.blue, '#1a4bc4']} style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <View style={{ alignItems:'center' }}>
            <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:11 }}>PAIRS</Text>
            <Text style={{ color:'#fff', fontSize:22, fontWeight:'900' }}>{matches}/{MEMORY_PAIRS.length}</Text>
          </View>
          <Text style={{ color:'#fff', fontSize:22, fontWeight:'900' }}>🧠 Memory Match</Text>
          <View style={{ alignItems:'center' }}>
            <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:11 }}>MOVES</Text>
            <Text style={{ color:'#fff', fontSize:22, fontWeight:'900' }}>{moves}</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
          {cards.map((card, i) => (
            <TouchableOpacity key={card.id} onPress={() => flip(i)}
              style={{ width:90, height:90, borderRadius:14,
                backgroundColor: card.matched ? '#e8faf1' : card.flipped ? '#fff' : C.blue,
                borderWidth:2, borderColor: card.matched ? C.green : card.flipped ? C.border : C.blue,
                alignItems:'center', justifyContent:'center',
                shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:2 }}>
              {(card.flipped || card.matched) ? (
                <Text style={{ fontSize: card.type==='emoji'?36:14, fontWeight:'800', color:C.text, textAlign:'center' }}>
                  {card.value}
                </Text>
              ) : (
                <Text style={{ fontSize:28, color:'rgba(255,255,255,0.7)' }}>?</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ── PAIR UP GAME ──────────────────────────────────────────
const PairUp = ({ onDone }) => {
  const shuffled = [...PAIR_UP_DATA].sort(() => Math.random() - 0.5);
  const [words,    setWords]    = useState(shuffled.map((d,i) => ({ id:`w${i}`, text:d.word,  match:d.match, matched:false })));
  const [matches_, setMatches_] = useState(shuffled.map((d,i) => ({ id:`m${i}`, text:d.match, word:d.word,  matched:false })).sort(() => Math.random() - 0.5));
  const [selWord,  setSelWord]  = useState(null);
  const [selMatch, setSelMatch] = useState(null);
  const [correct,  setCorrect]  = useState(0);
  const [wrong,    setWrong]    = useState(0);

  useEffect(() => {
    if (!selWord || !selMatch) return;
    if (selWord.match === selMatch.text) {
      setWords(p    => p.map(w => w.id===selWord.id  ? {...w, matched:true} : w));
      setMatches_(p => p.map(m => m.id===selMatch.id ? {...m, matched:true} : m));
      setCorrect(c => {
        const next = c + 1;
        if (next === shuffled.length) setTimeout(() => onDone(next * 20), 500);
        return next;
      });
    } else {
      setWrong(w => w + 1);
    }
    setSelWord(null);
    setSelMatch(null);
  }, [selWord, selMatch]);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.green, '#1aaf5e']} style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <Text style={{ color:'#fff', fontSize:20, fontWeight:'900' }}>🎯 Pair Up!</Text>
          <View style={{ flexDirection:'row', gap:16 }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>✅ {correct}</Text>
            <Text style={{ color:'#fff', fontWeight:'700' }}>❌ {wrong}</Text>
          </View>
        </View>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:13, marginTop:4 }}>
          Tap a word then tap its matching category
        </Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <View style={{ flexDirection:'row', gap:12 }}>
          {/* Words column */}
          <View style={{ flex:1, gap:10 }}>
            <Text style={{ fontSize:12, fontWeight:'700', color:C.muted, textAlign:'center', marginBottom:4 }}>WORDS</Text>
            {words.map(w => (
              <TouchableOpacity key={w.id} onPress={() => !w.matched && setSelWord(w)}
                style={{ padding:14, borderRadius:12, borderWidth:2,
                  borderColor: w.matched?C.green:selWord?.id===w.id?C.orange:C.border,
                  backgroundColor: w.matched?'#e8faf1':selWord?.id===w.id?'#fff0e8':'#fff',
                  alignItems:'center' }}>
                <Text style={{ fontWeight:'800', fontSize:14, color:w.matched?C.green:C.text }}>{w.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Arrow */}
          <View style={{ justifyContent:'center', alignItems:'center', width:30 }}>
            <Text style={{ fontSize:20, color:C.muted }}>↔</Text>
          </View>
          {/* Matches column */}
          <View style={{ flex:1, gap:10 }}>
            <Text style={{ fontSize:12, fontWeight:'700', color:C.muted, textAlign:'center', marginBottom:4 }}>CATEGORIES</Text>
            {matches_.map(m => (
              <TouchableOpacity key={m.id} onPress={() => !m.matched && setSelMatch(m)}
                style={{ padding:14, borderRadius:12, borderWidth:2,
                  borderColor: m.matched?C.green:selMatch?.id===m.id?C.orange:C.border,
                  backgroundColor: m.matched?'#e8faf1':selMatch?.id===m.id?'#fff0e8':'#fff',
                  alignItems:'center' }}>
                <Text style={{ fontWeight:'800', fontSize:14, color:m.matched?C.green:C.text }}>{m.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ── SORT IT OUT GAME ──────────────────────────────────────
const SortItOut = ({ onDone }) => {
  const shuffledItems = [...SORT_DATA.items].sort(() => Math.random() - 0.5);
  const [items,   setItems]   = useState(shuffledItems.map((it,i) => ({ ...it, id:i, sorted:false, wrong:false })));
  const [current, setCurrent] = useState(0);
  const [score,   setScore]   = useState(0);
  const [errors,  setErrors]  = useState(0);

  const item = items[current];

  const handleSort = (cat) => {
    if (!item) return;
    const correct = item.cat === cat;
    if (correct) {
      setScore(s => s + 10);
      setItems(prev => prev.map((it,i) => i===current ? {...it, sorted:true} : it));
      if (current + 1 >= items.length) {
        setTimeout(() => onDone(score + 10), 600);
      } else {
        setTimeout(() => setCurrent(c => c + 1), 400);
      }
    } else {
      setErrors(e => e + 1);
      setItems(prev => prev.map((it,i) => i===current ? {...it, wrong:true} : it));
      setTimeout(() => {
        setItems(prev => prev.map((it,i) => i===current ? {...it, wrong:false} : it));
      }, 600);
    }
  };

  const progress = (current / items.length) * 100;

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.purple, '#5b21b6']} style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <Text style={{ color:'#fff', fontSize:20, fontWeight:'900' }}>🗂️ Sort It Out</Text>
          <View style={{ flexDirection:'row', gap:16 }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>✅ {score}</Text>
            <Text style={{ color:'#fff', fontWeight:'700' }}>❌ {errors}</Text>
          </View>
        </View>
        <View style={{ backgroundColor:'rgba(255,255,255,0.3)', borderRadius:99, height:8, overflow:'hidden' }}>
          <View style={{ width:`${progress}%`, backgroundColor:'#fff', height:'100%', borderRadius:99 }} />
        </View>
        <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:12, marginTop:6, textAlign:'center' }}>
          {current + 1} of {items.length}
        </Text>
      </LinearGradient>

      <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24 }}>
        {/* Current word */}
        <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>
          Which category?
        </Text>
        <View style={[{ backgroundColor:'#fff', borderRadius:20, padding:28, marginBottom:36,
          shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:12, elevation:4,
          borderWidth:3, borderColor: item?.wrong ? '#ff6b6b' : C.purple+'40' }]}>
          <Text style={{ fontSize:36, fontWeight:'900', color:C.text }}>{item?.word}</Text>
        </View>

        {/* Category buttons */}
        <View style={{ flexDirection:'row', gap:16, width:'100%' }}>
          {[
            { label:SORT_DATA.cat1, color:C.blue   },
            { label:SORT_DATA.cat2, color:C.orange  },
          ].map(cat => (
            <TouchableOpacity key={cat.label} onPress={() => handleSort(cat.label)}
              style={{ flex:1, backgroundColor:cat.color, borderRadius:18, padding:22, alignItems:'center',
                shadowColor:cat.color, shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:8, elevation:4 }}>
              <Text style={{ color:'#fff', fontSize:18, fontWeight:'900' }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sorted items preview */}
        <View style={{ flexDirection:'row', gap:16, marginTop:28, width:'100%' }}>
          {[SORT_DATA.cat1, SORT_DATA.cat2].map(cat => {
            const sorted = items.filter(it => it.sorted && it.cat === cat);
            return (
              <View key={cat} style={{ flex:1, backgroundColor:'#fff', borderRadius:14, padding:12, minHeight:60,
                borderWidth:1.5, borderColor:C.border }}>
                <Text style={{ fontSize:10, fontWeight:'700', color:C.muted, marginBottom:6 }}>{cat.toUpperCase()}</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4 }}>
                  {sorted.map(it => (
                    <View key={it.id} style={{ backgroundColor:C.green+'20', borderRadius:6, paddingVertical:2, paddingHorizontal:6 }}>
                      <Text style={{ fontSize:11, fontWeight:'700', color:C.green }}>{it.word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ── GAME RESULT ────────────────────────────────────────────
const GameResult = ({ game, score, onPlay, onBack }) => (
  <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24, backgroundColor:C.bg }}>
    <Text style={{ fontSize:64, marginBottom:12 }}>{score >= 100 ? '🏆' : score >= 50 ? '🌟' : '💪'}</Text>
    <Text style={{ fontSize:26, fontWeight:'900', color:C.text, marginBottom:4 }}>
      {score >= 100 ? 'Blazing Fast!' : score >= 50 ? 'Great Job!' : 'Keep Practicing!'}
    </Text>
    <Text style={{ color:C.muted, fontSize:15, marginBottom:16 }}>{game.name}</Text>
    <View style={{ backgroundColor:C.amber, borderRadius:99, paddingVertical:8, paddingHorizontal:20, marginBottom:28 }}>
      <Text style={{ color:'#fff', fontWeight:'900', fontSize:18 }}>⚡ {score} pts earned!</Text>
    </View>
    <View style={{ flexDirection:'row', gap:12 }}>
      <TouchableOpacity onPress={onPlay}
        style={{ borderWidth:2, borderColor:C.orange, borderRadius:14, paddingVertical:12, paddingHorizontal:20 }}>
        <Text style={{ color:C.orange, fontWeight:'800' }}>↺ Play Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}
        style={{ backgroundColor:C.orange, borderRadius:14, paddingVertical:12, paddingHorizontal:20 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>✓ Done</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── GAMES LIST ─────────────────────────────────────────────
const GAMES = [
  { id:'quick_fire', name:'Quick Fire!',  emoji:'⚡', desc:'Answer math questions as fast as you can!', color:C.amber,  gradient:[C.amber,'#e67e22'] },
  { id:'memory',     name:'Memory Match', emoji:'🧠', desc:'Flip cards and find all the matching pairs!', color:C.blue,   gradient:[C.blue,'#1a4bc4']  },
  { id:'pair_up',    name:'Pair Up!',     emoji:'🎯', desc:'Match each word to its correct category!',    color:C.green,  gradient:[C.green,'#1aaf5e'] },
  { id:'sort_it',    name:'Sort It Out',  emoji:'🗂️', desc:'Sort each word into the right group!',       color:C.purple, gradient:[C.purple,'#5b21b6'] },
];

// ── MAIN GAMES SCREEN ─────────────────────────────────────
export default function GamesScreen() {
  const [activeGame,  setActiveGame]  = useState(null);
  const [gameKey,     setGameKey]     = useState(0);
  const [result,      setResult]      = useState(null);

  const handleDone = (score) => setResult({ score });

  const playAgain = () => {
    setResult(null);
    setGameKey(k => k + 1);
  };

  const goBack = () => {
    setActiveGame(null);
    setResult(null);
  };

  // Show result
  if (activeGame && result) return (
    <SafeAreaView style={{ flex:1 }}>
      <GameResult game={GAMES.find(g=>g.id===activeGame)} score={result.score} onPlay={playAgain} onBack={goBack} />
    </SafeAreaView>
  );

  // Show active game
  if (activeGame) return (
    <SafeAreaView style={{ flex:1 }}>
      {/* Back button */}
      <View style={{ padding:12, backgroundColor:C.white, borderBottomWidth:1, borderBottomColor:C.border }}>
        <TouchableOpacity onPress={() => Alert.alert('Quit Game?', 'Your progress will be lost.', [
          { text:'Keep Playing', style:'cancel' },
          { text:'Quit', style:'destructive', onPress:goBack },
        ])}>
          <Text style={{ fontSize:16, color:C.muted }}>← Quit</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex:1 }} key={gameKey}>
        {activeGame === 'quick_fire' && <QuickFire onDone={handleDone} />}
        {activeGame === 'memory'     && <MemoryMatch onDone={handleDone} />}
        {activeGame === 'pair_up'    && <PairUp onDone={handleDone} />}
        {activeGame === 'sort_it'    && <SortItOut onDone={handleDone} />}
      </View>
    </SafeAreaView>
  );

  // Games list
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.amber, '#e67e22']} style={{ padding:20, paddingBottom:28 }}>
        <Text style={{ fontSize:26, fontWeight:'900', color:'#fff' }}>Challenge Zone</Text>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginTop:2 }}>Pick a game and earn XP! 🦊</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, gap:14 }}>
        {GAMES.map(game => (
          <TouchableOpacity key={game.id} onPress={() => { setActiveGame(game.id); setResult(null); setGameKey(k=>k+1); }}
            style={{ backgroundColor:C.white, borderRadius:20, overflow:'hidden',
              shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.1, shadowRadius:10, elevation:4 }}>
            <LinearGradient colors={game.gradient} style={{ padding:20, flexDirection:'row', alignItems:'center', gap:16 }}>
              <Text style={{ fontSize:44 }}>{game.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:20, fontWeight:'900', color:'#fff' }}>{game.name}</Text>
                <Text style={{ fontSize:13, color:'rgba(255,255,255,0.85)', marginTop:2 }}>{game.desc}</Text>
              </View>
              <View style={{ backgroundColor:'rgba(255,255,255,0.25)', borderRadius:12, padding:10 }}>
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>Play ▶</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* XP info */}
        <View style={{ backgroundColor:'#fff', borderRadius:16, padding:16, borderWidth:2, borderColor:'#f7b73130' }}>
          <Text style={{ fontWeight:'800', fontSize:14, color:C.text, marginBottom:8 }}>⚡ How to Earn XP</Text>
          <View style={{ gap:6 }}>
            {[
              { game:'Quick Fire',  xp:'Up to 200 XP (10 pts per answer + streak bonus)' },
              { game:'Memory Match',xp:'Up to 200 XP (fewer moves = more XP)' },
              { game:'Pair Up',     xp:'Up to 120 XP (20 XP per correct pair)' },
              { game:'Sort It Out', xp:'Up to 80 XP (10 XP per correct sort)' },
            ].map(r => (
              <View key={r.game} style={{ flexDirection:'row', gap:8 }}>
                <Text style={{ fontSize:12, fontWeight:'700', color:C.orange, width:80 }}>{r.game}</Text>
                <Text style={{ fontSize:12, color:C.muted, flex:1 }}>{r.xp}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
