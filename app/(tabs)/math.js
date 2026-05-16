import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';
import { getContent } from '../../src/firebase/content';
import { WORKSHEETS } from '../../src/data/worksheets';

const { width: SW } = Dimensions.get('window');
const C = {
  orange:'#f05a1a', orange2:'#c0392b', amber:'#f7b731',
  green:'#26de81',  blue:'#3b82f6',    purple:'#8b5cf6',
  bg:'#fff8f5',     white:'#ffffff',   text:'#1a0a00',
  muted:'#9a6a50',  border:'#ffe0cc',
};

const GRADES = [1,2,3,4,5];

const MATH_GAMES = [
  { id:'quick_fire', title:'Quick Fire!', icon:'⚡', color:C.amber,  desc:'Answer as fast as you can!' },
  { id:'sort_it',    title:'Sort It Out', icon:'🗂️', color:C.purple, desc:'Sort numbers into groups'   },
  { id:'memory',     title:'Math Match',  icon:'🧠', color:C.blue,   desc:'Match equations to answers' },
];

const SKILL_PROGRESS = {
  1: [{label:'Counting',     pct:90, col:C.green },{label:'Addition',    pct:75, col:C.orange},{label:'Subtraction', pct:60, col:C.amber }],
  2: [{label:'Addition',     pct:85, col:C.green },{label:'Subtraction', pct:70, col:C.orange},{label:'Place Value',  pct:50, col:C.amber }],
  3: [{label:'Multiplication',pct:65,col:C.green },{label:'Division',    pct:40, col:C.orange},{label:'Fractions',   pct:25, col:C.amber }],
  4: [{label:'Fractions',    pct:55, col:C.green },{label:'Decimals',    pct:35, col:C.orange},{label:'Geometry',    pct:20, col:C.amber }],
  5: [{label:'Decimals',     pct:45, col:C.green },{label:'Fractions',   pct:30, col:C.orange},{label:'Percentages', pct:15, col:C.amber }],
};

// ── CONTENT CARD ──────────────────────────────────────────
const ContentCard = ({ item, accent, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={[s.card, { borderColor:accent+'30' }]}>
    <Text style={{ fontSize:34, marginBottom:8 }}>{item.icon}</Text>
    <Text style={{ fontWeight:'800', fontSize:13, color:C.text, marginBottom:3, lineHeight:18 }} numberOfLines={2}>
      {item.title}
    </Text>
    {item.grade && <Text style={{ fontSize:10, color:C.muted, marginBottom:6 }}>Grade {item.grade}{item.questions?` · ${Array.isArray(item.questions)?item.questions.length:item.questions}q`:''}{item.time?` · ${item.time}s`:''}</Text>}
    {item.desc  && <Text style={{ fontSize:10, color:C.muted, marginBottom:6, lineHeight:15 }} numberOfLines={2}>{item.desc}</Text>}
    {item.xp    && <View style={[s.xpChip,{backgroundColor:C.amber}]}><Text style={s.xpChipTxt}>⚡ +{item.xp}</Text></View>}
    {!item.xp   && <View style={[s.xpChip,{backgroundColor:accent+'20'}]}><Text style={[s.xpChipTxt,{color:accent}]}>Play →</Text></View>}
  </TouchableOpacity>
);

// ── HERO CARD ─────────────────────────────────────────────
const HeroCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={{ marginHorizontal:16, marginBottom:16 }}>
    <LinearGradient colors={[C.orange, C.orange2]} style={s.hero}>
      <Text style={s.heroBg}>{item.icon}</Text>
      <View style={s.heroBadge}><Text style={s.heroBadgeTxt}>⭐ RECOMMENDED FOR YOU</Text></View>
      <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
        <Text style={{ fontSize:48 }}>{item.icon}</Text>
        <View style={{ flex:1 }}>
          <Text style={{ fontSize:18, fontWeight:'900', color:'#fff', marginBottom:4 }}>{item.title}</Text>
          <Text style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:12 }}>
            Grade {item.grade} · {Array.isArray(item.questions)?item.questions.length:item.questions||5} questions · +{item.xpReward||item.xp||50} XP
          </Text>
          <View style={s.heroBtn}><Text style={[s.heroBtnTxt,{color:C.orange}]}>Start Now →</Text></View>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// ── SECTION ───────────────────────────────────────────────
const Section = ({ title, accent, items, onSeeAll, children }) => (
  <View style={{ marginBottom:20 }}>
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} style={[s.seeAll,{backgroundColor:accent+'15'}]}>
        <Text style={[s.seeAllTxt,{color:accent}]}>See all →</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal:16, gap:10 }}>
      {children}
    </ScrollView>
  </View>
);

// ── MAIN MATH HUB ─────────────────────────────────────────
export default function MathScreen() {
  const router   = useRouter();
  const [grade,    setGrade]    = useState(2);
  const [profile,  setProfile]  = useState(null);
  const [content,  setContent]  = useState([]);
  const [modal,    setModal]    = useState(null);

  // Load user + content
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (user)=>{
      if (!user) return;
      try {
        const snap = await getDoc(doc(db,'users',user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setGrade(data.grade||2);
          // Use diagnostic result if available
          if (data.diagnostic_math?.recommendedLevel) {
            setGrade(data.diagnostic_math.recommendedLevel);
          }
        }
      } catch(e){}
    });
    return unsub;
  },[]);

  useEffect(()=>{
    getContent().then(data=>{
      const mathContent = data.filter(c=>c.subject==='Math'||c.subject==='math');
      setContent(mathContent.length>0 ? mathContent : WORKSHEETS.filter(w=>w.subject==='Math'));
    }).catch(()=>{
      setContent(WORKSHEETS.filter(w=>w.subject==='Math'));
    });
  },[]);

  const worksheets = content.filter(c=>(!c.type||c.type==='worksheet')&&c.grade===grade);
  const quizzes    = content.filter(c=>c.type==='quiz'&&c.grade===grade);
  const recommended = worksheets[0] || content.filter(c=>c.subject==='Math')[0] || WORKSHEETS.find(w=>w.subject==='Math');
  const skills      = SKILL_PROGRESS[grade]||SKILL_PROGRESS[2];
  const diagResult  = profile?.diagnostic_math;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      {/* ── STICKY HEADER ── */}
      <LinearGradient colors={[C.orange, C.orange2]}
        style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:16 }}>
        {/* Back + title */}
        <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 }}>
          <TouchableOpacity onPress={()=>router.back()}
            style={{ width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#fff', fontSize:18 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:22, fontWeight:'900', color:'#fff' }}>🔢 Math</Text>
            <Text style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>Numbers, operations & problem solving</Text>
          </View>
          <View style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:99, paddingVertical:5, paddingHorizontal:12 }}>
            <Text style={{ fontSize:13, fontWeight:'800', color:'#fff' }}>⚡ {profile?.xp||0}</Text>
          </View>
        </View>
        {/* Grade pills */}
        <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}>
          <Text style={{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.7)', marginRight:4 }}>Grade:</Text>
          {GRADES.map(g=>(
            <TouchableOpacity key={g} onPress={()=>setGrade(g)}
              style={[s.gradePill, { borderColor:grade===g?'#fff':'rgba(255,255,255,0.3)',
                backgroundColor:grade===g?'#fff':'transparent' }]}>
              <Text style={{ fontSize:13, fontWeight:'800', color:grade===g?C.orange:'rgba(255,255,255,0.85)' }}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        {recommended && (
          <View style={{ marginTop:16 }}>
            <HeroCard item={recommended} onPress={()=>router.push(`/worksheet/${recommended.id}`)} />
          </View>
        )}

        {/* ── WORKSHEETS ── */}
        {worksheets.length > 0 ? (
          <Section title="📋 Worksheets" accent={C.orange} onSeeAll={()=>setModal('worksheets')}>
            {worksheets.slice(0,4).map(w=>(
              <ContentCard key={w.id} item={w} accent={C.orange} onPress={()=>router.push(`/worksheet/${w.id}`)} />
            ))}
          </Section>
        ) : (
          <View style={s.emptySection}>
            <Text style={{ fontSize:28, marginBottom:6 }}>📋</Text>
            <Text style={{ fontSize:13, fontWeight:'700', color:C.muted }}>No worksheets for Grade {grade} yet</Text>
            <TouchableOpacity onPress={()=>setGrade(g=>Math.max(1,g-1))} style={{ marginTop:8 }}>
              <Text style={{ fontSize:12, color:C.orange, fontWeight:'700' }}>Try Grade {Math.max(1,grade-1)} →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── QUIZZES ── */}
        {quizzes.length > 0 ? (
          <Section title="⏱️ Quizzes" accent={C.blue} onSeeAll={()=>setModal('quizzes')}>
            {quizzes.slice(0,4).map(q=>(
              <ContentCard key={q.id} item={q} accent={C.blue} onPress={()=>router.push(`/worksheet/${q.id}`)} />
            ))}
          </Section>
        ) : (
          <View style={s.emptySection}>
            <Text style={{ fontSize:28, marginBottom:6 }}>⏱️</Text>
            <Text style={{ fontSize:13, fontWeight:'700', color:C.muted }}>No quizzes for Grade {grade} yet</Text>
          </View>
        )}

        {/* ── GAMES ── */}
        <Section title="🎮 Math Games" accent={C.purple} onSeeAll={()=>router.push('/(tabs)/games')}>
          {MATH_GAMES.map(g=>(
            <ContentCard key={g.id} item={g} accent={g.color} onPress={()=>router.push('/(tabs)/games')} />
          ))}
        </Section>

        {/* ── DIAGNOSTIC BANNER ── */}
        <TouchableOpacity onPress={()=>router.push('/diagnostic')} activeOpacity={0.88}
          style={s.diagBanner}>
          <LinearGradient colors={['#1a0a00','#3d1a00']} style={s.diagInner}>
            <Text style={{ fontSize:36 }}>🔍</Text>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'900', color:'#fff', marginBottom:3 }}>
                {diagResult ? `Your Math Level: Grade ${diagResult.recommendedLevel}` : 'Take Math Diagnostic'}
              </Text>
              <Text style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:17 }}>
                {diagResult ? 'Tap to retake or see your weak areas' : 'Find your level · Get personalized content'}
              </Text>
              {diagResult && (
                <View style={{ flexDirection:'row', gap:4, marginTop:8 }}>
                  {GRADES.map(g=>(
                    <View key={g} style={{ flex:1, height:6, borderRadius:99,
                      backgroundColor: g<=diagResult.recommendedLevel?C.orange:'rgba(255,255,255,0.15)' }}/>
                  ))}
                </View>
              )}
            </View>
            <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:18 }}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── SKILL PROGRESS ── */}
        <View style={s.progressCard}>
          <Text style={s.sectionTitle}>📊 Your Math Skills — Grade {grade}</Text>
          {skills.map((sk,i)=>(
            <View key={i} style={{ marginBottom:i<skills.length-1?14:0 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                <Text style={{ fontSize:13, fontWeight:'700', color:C.text }}>{sk.label}</Text>
                <Text style={{ fontSize:12, fontWeight:'800', color:sk.col }}>{sk.pct}%</Text>
              </View>
              <View style={{ backgroundColor:'#ffe0cc', borderRadius:99, height:9, overflow:'hidden' }}>
                <Animated.View style={{ width:`${sk.pct}%`, backgroundColor:sk.col, height:'100%', borderRadius:99 }}/>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height:24 }} />
      </ScrollView>

      {/* ── SEE ALL MODAL ── */}
      <Modal visible={!!modal} animationType="slide" transparent onRequestClose={()=>setModal(null)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex:1 }} onPress={()=>setModal(null)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>
              {modal==='worksheets'?'📋 All Math Worksheets':'⏱️ All Math Quizzes'}
            </Text>
            <ScrollView>
              {(modal==='worksheets' ? worksheets : quizzes).map(item=>(
                <TouchableOpacity key={item.id} onPress={()=>{setModal(null);router.push(`/worksheet/${item.id}`);}}
                  style={s.modalRow}>
                  <Text style={{ fontSize:30 }}>{item.icon}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'800', fontSize:14, color:C.text }}>{item.title}</Text>
                    <Text style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                      Grade {item.grade} · {Array.isArray(item.questions)?item.questions.length:item.questions||5} questions
                    </Text>
                  </View>
                  <View style={[s.xpChip,{backgroundColor:C.amber}]}>
                    <Text style={s.xpChipTxt}>⚡ +{item.xpReward||item.xp||50}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {(modal==='worksheets'?worksheets:quizzes).length===0 && (
                <Text style={{ textAlign:'center', color:C.muted, padding:32 }}>
                  No content yet for Grade {grade}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card:         { width:148, backgroundColor:C.white, borderRadius:16, padding:14, borderWidth:2, elevation:3, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8 },
  xpChip:       { alignSelf:'flex-start', borderRadius:99, paddingVertical:3, paddingHorizontal:8 },
  xpChipTxt:    { fontSize:10, color:'#fff', fontWeight:'800' },
  hero:         { borderRadius:20, padding:18, overflow:'hidden' },
  heroBg:       { position:'absolute', right:-16, top:-16, fontSize:80, opacity:0.15 },
  heroBadge:    { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:99, paddingVertical:3, paddingHorizontal:10, alignSelf:'flex-start', marginBottom:10 },
  heroBadgeTxt: { fontSize:10, color:'#fff', fontWeight:'800' },
  heroBtn:      { backgroundColor:'#fff', borderRadius:12, paddingVertical:8, paddingHorizontal:18, alignSelf:'flex-start' },
  heroBtnTxt:   { fontSize:13, fontWeight:'800' },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginBottom:10 },
  sectionTitle: { fontSize:15, fontWeight:'800', color:C.text },
  seeAll:       { borderRadius:8, paddingVertical:4, paddingHorizontal:10 },
  seeAllTxt:    { fontSize:12, fontWeight:'700' },
  gradePill:    { flex:1, paddingVertical:7, borderRadius:10, borderWidth:2, alignItems:'center' },
  emptySection: { marginHorizontal:16, marginBottom:20, padding:20, backgroundColor:C.white, borderRadius:14, borderWidth:2, borderColor:C.border, borderStyle:'dashed', alignItems:'center' },
  diagBanner:   { marginHorizontal:16, marginBottom:20, borderRadius:18, overflow:'hidden', elevation:4 },
  diagInner:    { padding:18, flexDirection:'row', alignItems:'center', gap:14 },
  progressCard: { marginHorizontal:16, backgroundColor:C.white, borderRadius:18, padding:18, elevation:3, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8 },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  modalSheet:   { backgroundColor:C.white, borderRadius:'24px 24px 0 0', padding:20, paddingBottom:36, maxHeight:'70%' },
  modalHandle:  { width:40, height:4, borderRadius:99, backgroundColor:'#e5e5e5', alignSelf:'center', marginBottom:16 },
  modalTitle:   { fontSize:17, fontWeight:'800', color:C.text, marginBottom:16 },
  modalRow:     { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f5f5f5' },
});
