import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';
import { getContent } from '../../src/firebase/content';
import { WORKSHEETS } from '../../src/data/worksheets';

const C = {
  accent:'#26de81', accent2:'#1aaf5e', amber:'#f7b731',
  blue:'#3b82f6',   orange:'#f05a1a',  purple:'#8b5cf6',
  bg:'#f5fff9',     white:'#ffffff',   text:'#0a1a0f',
  muted:'#4a7a5a',  border:'#c8f0d8',
};
const GRADES = [1,2,3,4,5];

const SKILL_PROGRESS = {
  1:[{label:'Phonics',       pct:85,col:C.accent},{label:'Sight Words',  pct:70,col:C.amber},{label:'Comprehension',pct:50,col:C.blue}],
  2:[{label:'Comprehension', pct:75,col:C.accent},{label:'Vocabulary',   pct:60,col:C.amber},{label:'Fluency',      pct:55,col:C.blue}],
  3:[{label:'Inference',     pct:60,col:C.accent},{label:'Main Idea',    pct:50,col:C.amber},{label:'Author Purpose',pct:35,col:C.blue}],
  4:[{label:'Summarizing',   pct:55,col:C.accent},{label:'Point of View',pct:40,col:C.amber},{label:'Theme',        pct:30,col:C.blue}],
  5:[{label:'Theme',         pct:50,col:C.accent},{label:'Figurative Lang',pct:35,col:C.amber},{label:'Text Structure',pct:25,col:C.blue}],
};

const ContentCard = ({ item, accent, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={[s.card, { borderColor:accent+'40' }]}>
    <Text style={{ fontSize:34, marginBottom:8 }}>{item.icon}</Text>
    <Text style={{ fontWeight:'800', fontSize:13, color:C.text, marginBottom:3, lineHeight:18 }} numberOfLines={2}>{item.title}</Text>
    {item.grade && <Text style={{ fontSize:10, color:C.muted, marginBottom:6 }}>Grade {item.grade}{item.questions?` · ${item.questions}q`:''}</Text>}
    {item.passage && <View style={[s.chip,{backgroundColor:C.accent+'20'}]}><Text style={[s.chipTxt,{color:C.accent}]}>📖 Passage</Text></View>}
    {item.xpReward && <View style={[s.chip,{backgroundColor:C.amber}]}><Text style={s.chipTxt}>⚡ +{item.xpReward}</Text></View>}
  </TouchableOpacity>
);

const Section = ({ title, accent, items, onSeeAll, renderCard }) => (
  <View style={{ marginBottom:20 }}>
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} style={[s.seeAll,{backgroundColor:accent+'15'}]}>
        <Text style={[s.seeAllTxt,{color:accent}]}>See all →</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal:16, gap:10 }}>
      {items.map((item,i)=><View key={i}>{renderCard(item)}</View>)}
    </ScrollView>
  </View>
);

export default function ReadingScreen() {
  const router  = useRouter();
  const [grade,   setGrade]   = useState(2);
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState([]);
  const [modal,   setModal]   = useState(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async(user)=>{
      if(!user) return;
      try {
        const snap = await getDoc(doc(db,'users',user.uid));
        if(snap.exists()){
          const data = snap.data();
          setProfile(data);
          setGrade(data.diagnostic_reading?.recommendedLevel||data.grade||2);
        }
      } catch(e){}
    });
    return unsub;
  },[]);

  useEffect(()=>{
    getContent().then(data=>{
      const r = data.filter(c=>c.subject==='Reading'||c.type==='reading');
      setContent(r.length>0?r:WORKSHEETS.filter(w=>w.subject==='Reading'));
    }).catch(()=>setContent(WORKSHEETS.filter(w=>w.subject==='Reading')));
  },[]);

  const passages   = content.filter(c=>(c.type==='reading'||c.passage||c.hasPassage)&&c.grade===grade);
  const worksheets = content.filter(c=>(!c.type||c.type==='worksheet')&&!c.passage&&!c.hasPassage&&c.grade===grade);
  const quizzes    = content.filter(c=>c.type==='quiz'&&c.grade===grade);
  const recommended = passages[0]||worksheets[0]||content[0];
  const skills = SKILL_PROGRESS[grade]||SKILL_PROGRESS[2];
  const diagResult = profile?.diagnostic_reading;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      {/* Header */}
      <LinearGradient colors={[C.accent, C.accent2]}
        style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:16 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 }}>
          <TouchableOpacity onPress={()=>router.back()}
            style={{ width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#fff', fontSize:18 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:22, fontWeight:'900', color:'#fff' }}>📖 Reading</Text>
            <Text style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>Comprehension, vocabulary & stories</Text>
          </View>
          <View style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:99, paddingVertical:5, paddingHorizontal:12 }}>
            <Text style={{ fontSize:13, fontWeight:'800', color:'#fff' }}>⚡ {profile?.xp||0}</Text>
          </View>
        </View>
        <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}>
          <Text style={{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.7)', marginRight:4 }}>Grade:</Text>
          {GRADES.map(g=>(
            <TouchableOpacity key={g} onPress={()=>setGrade(g)}
              style={[s.gradePill,{borderColor:grade===g?'#fff':'rgba(255,255,255,0.3)',backgroundColor:grade===g?'#fff':'transparent'}]}>
              <Text style={{ fontSize:13, fontWeight:'800', color:grade===g?C.accent:'rgba(255,255,255,0.85)' }}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {recommended&&(
          <TouchableOpacity onPress={()=>router.push(`/worksheet/${recommended.id}`)} activeOpacity={0.88}
            style={{ marginHorizontal:16, marginTop:16, marginBottom:16 }}>
            <LinearGradient colors={[C.accent, C.accent2]} style={s.hero}>
              <Text style={s.heroBg}>{recommended.icon||'📖'}</Text>
              <View style={s.heroBadge}><Text style={s.heroBadgeTxt}>⭐ RECOMMENDED FOR YOU</Text></View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
                <Text style={{ fontSize:48 }}>{recommended.icon||'📖'}</Text>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:18, fontWeight:'900', color:'#fff', marginBottom:4 }}>{recommended.title}</Text>
                  <Text style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:12 }}>
                    Grade {recommended.grade} · {recommended.questions?.length||5} questions · +{recommended.xpReward||50} XP
                    {(recommended.passage||recommended.hasPassage)?' · 📖 Passage':''}
                  </Text>
                  <View style={s.heroBtn}><Text style={[s.heroBtnTxt,{color:C.accent}]}>Start Reading →</Text></View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Passages */}
        {passages.length>0&&(
          <Section title="📖 Reading Passages" accent={C.accent} items={passages.slice(0,4)}
            onSeeAll={()=>setModal('passages')}
            renderCard={item=><ContentCard item={item} accent={C.accent} onPress={()=>router.push(`/worksheet/${item.id}`)}/>}/>
        )}

        {/* Worksheets */}
        {worksheets.length>0&&(
          <Section title="📋 Worksheets" accent={C.blue} items={worksheets.slice(0,4)}
            onSeeAll={()=>setModal('worksheets')}
            renderCard={item=><ContentCard item={item} accent={C.blue} onPress={()=>router.push(`/worksheet/${item.id}`)}/>}/>
        )}

        {/* Quizzes */}
        {quizzes.length>0&&(
          <Section title="⏱️ Reading Quizzes" accent={C.amber} items={quizzes.slice(0,4)}
            onSeeAll={()=>setModal('quizzes')}
            renderCard={item=><ContentCard item={item} accent={C.amber} onPress={()=>router.push(`/worksheet/${item.id}`)}/>}/>
        )}

        {passages.length===0&&worksheets.length===0&&(
          <View style={{ margin:16, padding:32, backgroundColor:C.white, borderRadius:18, alignItems:'center', borderWidth:2, borderColor:C.border, borderStyle:'dashed' }}>
            <Text style={{ fontSize:40, marginBottom:8 }}>📖</Text>
            <Text style={{ fontWeight:'700', color:C.muted, fontSize:15, marginBottom:4 }}>No content for Grade {grade} yet</Text>
            <Text style={{ fontSize:12, color:'#aaa' }}>Add content via the admin panel</Text>
          </View>
        )}

        {/* Diagnostic */}
        <TouchableOpacity onPress={()=>router.push('/diagnostic')} activeOpacity={0.88}
          style={{ marginHorizontal:16, marginBottom:20, borderRadius:18, overflow:'hidden', elevation:4 }}>
          <LinearGradient colors={['#0a1a0f','#1a3020']} style={{ padding:18, flexDirection:'row', alignItems:'center', gap:14 }}>
            <Text style={{ fontSize:36 }}>🔍</Text>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'900', color:'#fff', marginBottom:3 }}>
                {diagResult?`Reading Level: Grade ${diagResult.recommendedLevel}`:'Take Reading Diagnostic'}
              </Text>
              <Text style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>
                {diagResult?'Tap to retake or see weak areas':'Find your level · Get personalized stories'}
              </Text>
              {diagResult&&(
                <View style={{ flexDirection:'row', gap:4, marginTop:8 }}>
                  {GRADES.map(g=><View key={g} style={{ flex:1, height:6, borderRadius:99, backgroundColor:g<=diagResult.recommendedLevel?C.accent:'rgba(255,255,255,0.15)' }}/>)}
                </View>
              )}
            </View>
            <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:18 }}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skills */}
        <View style={{ marginHorizontal:16, backgroundColor:C.white, borderRadius:18, padding:18, elevation:3, marginBottom:24 }}>
          <Text style={s.sectionTitle}>📊 Reading Skills — Grade {grade}</Text>
          {skills.map((sk,i)=>(
            <View key={i} style={{ marginBottom:i<skills.length-1?14:0 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                <Text style={{ fontSize:13, fontWeight:'700', color:C.text }}>{sk.label}</Text>
                <Text style={{ fontSize:12, fontWeight:'800', color:sk.col }}>{sk.pct}%</Text>
              </View>
              <View style={{ backgroundColor:C.border, borderRadius:99, height:9, overflow:'hidden' }}>
                <View style={{ width:`${sk.pct}%`, backgroundColor:sk.col, height:'100%', borderRadius:99 }}/>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!modal} animationType="slide" transparent onRequestClose={()=>setModal(null)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex:1 }} onPress={()=>setModal(null)}/>
          <View style={s.modalSheet}>
            <View style={s.modalHandle}/>
            <Text style={s.modalTitle}>
              {modal==='passages'?'📖 All Passages':modal==='worksheets'?'📋 All Worksheets':'⏱️ All Quizzes'}
            </Text>
            <ScrollView>
              {(modal==='passages'?passages:modal==='worksheets'?worksheets:quizzes).map(item=>(
                <TouchableOpacity key={item.id} onPress={()=>{setModal(null);router.push(`/worksheet/${item.id}`);}} style={s.modalRow}>
                  <Text style={{ fontSize:30 }}>{item.icon||'📖'}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'800', fontSize:14, color:C.text }}>{item.title}</Text>
                    <Text style={{ fontSize:11, color:C.muted, marginTop:2 }}>Grade {item.grade} · {Array.isArray(item.questions)?item.questions.length:item.questions||5} questions</Text>
                  </View>
                  <View style={[s.chip,{backgroundColor:C.amber}]}><Text style={s.chipTxt}>⚡ +{item.xpReward||50}</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card:        { width:148, backgroundColor:C.white, borderRadius:16, padding:14, borderWidth:2, elevation:3, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8 },
  chip:        { alignSelf:'flex-start', borderRadius:99, paddingVertical:3, paddingHorizontal:8, marginTop:4 },
  chipTxt:     { fontSize:10, color:'#fff', fontWeight:'800' },
  hero:        { borderRadius:20, padding:18, overflow:'hidden' },
  heroBg:      { position:'absolute', right:-16, top:-16, fontSize:80, opacity:0.15 },
  heroBadge:   { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:99, paddingVertical:3, paddingHorizontal:10, alignSelf:'flex-start', marginBottom:10 },
  heroBadgeTxt:{ fontSize:10, color:'#fff', fontWeight:'800' },
  heroBtn:     { backgroundColor:'#fff', borderRadius:12, paddingVertical:8, paddingHorizontal:18, alignSelf:'flex-start' },
  heroBtnTxt:  { fontSize:13, fontWeight:'800' },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginBottom:10 },
  sectionTitle: { fontSize:15, fontWeight:'800', color:C.text, marginBottom:14 },
  seeAll:      { borderRadius:8, paddingVertical:4, paddingHorizontal:10 },
  seeAllTxt:   { fontSize:12, fontWeight:'700' },
  gradePill:   { flex:1, paddingVertical:7, borderRadius:10, borderWidth:2, alignItems:'center' },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  modalSheet:  { backgroundColor:C.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:36, maxHeight:'70%' },
  modalHandle: { width:40, height:4, borderRadius:99, backgroundColor:'#e5e5e5', alignSelf:'center', marginBottom:16 },
  modalTitle:  { fontSize:17, fontWeight:'800', color:C.text, marginBottom:16 },
  modalRow:    { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f5f5f5' },
});
