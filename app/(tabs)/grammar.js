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
  accent:'#3b82f6', accent2:'#1a4bc4', amber:'#f7b731',
  green:'#26de81',  orange:'#f05a1a',  purple:'#8b5cf6',
  bg:'#f5f8ff',     white:'#ffffff',   text:'#0a0f1a',
  muted:'#4a5a7a',  border:'#c8d8f0',
};
const GRADES = [1,2,3,4,5];

const SKILL_PROGRESS = {
  1:[{label:'Nouns & Verbs',  pct:80,col:C.accent},{label:'Sentences',    pct:65,col:C.green},{label:'Punctuation',  pct:50,col:C.amber}],
  2:[{label:'Adjectives',     pct:70,col:C.accent},{label:'Punctuation',  pct:60,col:C.green},{label:'Pronouns',     pct:45,col:C.amber}],
  3:[{label:'Verb Tenses',    pct:65,col:C.accent},{label:'Plurals',      pct:55,col:C.green},{label:'Conjunctions', pct:40,col:C.amber}],
  4:[{label:'Commas',         pct:60,col:C.accent},{label:'Complex Sent.',pct:45,col:C.green},{label:'Adverbs',      pct:35,col:C.amber}],
  5:[{label:'Subject/Pred.',  pct:55,col:C.accent},{label:'Clauses',      pct:40,col:C.green},{label:'Active/Passive',pct:25,col:C.amber}],
};

const GRAMMAR_TIPS = [
  { emoji:'💡', tip:'Use a comma before "and", "but", "or" in compound sentences.' },
  { emoji:'📌', tip:'"Their" shows ownership, "there" is a place, "they\'re" = they are.' },
  { emoji:'✅', tip:'Every sentence needs a subject AND a verb to be complete.' },
];

const ContentCard = ({ item, accent, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={[s.card,{borderColor:accent+'40'}]}>
    <Text style={{ fontSize:34, marginBottom:8 }}>{item.icon||'✏️'}</Text>
    <Text style={{ fontWeight:'800', fontSize:13, color:C.text, marginBottom:3, lineHeight:18 }} numberOfLines={2}>{item.title}</Text>
    {item.grade&&<Text style={{ fontSize:10, color:C.muted, marginBottom:6 }}>Grade {item.grade}{item.questions?` · ${item.questions}q`:''}</Text>}
    {item.xpReward&&<View style={[s.chip,{backgroundColor:C.amber}]}><Text style={s.chipTxt}>⚡ +{item.xpReward}</Text></View>}
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

export default function GrammarScreen() {
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
          const data=snap.data();
          setProfile(data);
          setGrade(data.diagnostic_grammar?.recommendedLevel||data.grade||2);
        }
      } catch(e){}
    });
    return unsub;
  },[]);

  useEffect(()=>{
    getContent().then(data=>{
      const g=data.filter(c=>c.subject==='Grammar');
      setContent(g.length>0?g:[]);
    }).catch(()=>setContent([]));
  },[]);

  const worksheets = content.filter(c=>(!c.type||c.type==='worksheet')&&c.grade===grade);
  const quizzes    = content.filter(c=>c.type==='quiz'&&c.grade===grade);
  const recommended = worksheets[0]||content[0];
  const skills = SKILL_PROGRESS[grade]||SKILL_PROGRESS[2];
  const diagResult = profile?.diagnostic_grammar;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.accent, C.accent2]}
        style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:16 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 }}>
          <TouchableOpacity onPress={()=>router.back()}
            style={{ width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#fff', fontSize:18 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:22, fontWeight:'900', color:'#fff' }}>✏️ Grammar</Text>
            <Text style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>Sentences, punctuation & word types</Text>
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
            <LinearGradient colors={[C.accent,C.accent2]} style={s.hero}>
              <Text style={s.heroBg}>{recommended.icon||'✏️'}</Text>
              <View style={s.heroBadge}><Text style={s.heroBadgeTxt}>⭐ RECOMMENDED FOR YOU</Text></View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
                <Text style={{ fontSize:48 }}>{recommended.icon||'✏️'}</Text>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:18, fontWeight:'900', color:'#fff', marginBottom:4 }}>{recommended.title}</Text>
                  <Text style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:12 }}>
                    Grade {recommended.grade} · {recommended.questions?.length||5} questions · +{recommended.xpReward||50} XP
                  </Text>
                  <View style={s.heroBtn}><Text style={[s.heroBtnTxt,{color:C.accent}]}>Start Now →</Text></View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Grammar Tips */}
        <View style={{ marginHorizontal:16, marginBottom:16 }}>
          <Text style={{ fontSize:14, fontWeight:'800', color:C.text, marginBottom:10 }}>💬 Quick Grammar Tips</Text>
          {GRAMMAR_TIPS.map((t,i)=>(
            <View key={i} style={{ flexDirection:'row', gap:10, alignItems:'flex-start', backgroundColor:C.white, borderRadius:12, padding:12, marginBottom:8, borderWidth:1.5, borderColor:C.border }}>
              <Text style={{ fontSize:18 }}>{t.emoji}</Text>
              <Text style={{ flex:1, fontSize:12, color:C.muted, lineHeight:18, fontWeight:'600' }}>{t.tip}</Text>
            </View>
          ))}
        </View>

        {/* Worksheets */}
        {worksheets.length>0?(
          <Section title="📋 Worksheets" accent={C.accent} items={worksheets.slice(0,4)}
            onSeeAll={()=>setModal('worksheets')}
            renderCard={item=><ContentCard item={item} accent={C.accent} onPress={()=>router.push(`/worksheet/${item.id}`)}/>}/>
        ):(
          <View style={{ margin:16, padding:32, backgroundColor:C.white, borderRadius:18, alignItems:'center', borderWidth:2, borderColor:C.border, borderStyle:'dashed', marginBottom:20 }}>
            <Text style={{ fontSize:40, marginBottom:8 }}>✏️</Text>
            <Text style={{ fontWeight:'700', color:C.muted, fontSize:15, marginBottom:4 }}>No Grammar content for Grade {grade} yet</Text>
            <Text style={{ fontSize:12, color:'#aaa' }}>Add content via the admin panel</Text>
          </View>
        )}

        {/* Quizzes */}
        {quizzes.length>0&&(
          <Section title="⏱️ Grammar Quizzes" accent={C.amber} items={quizzes.slice(0,4)}
            onSeeAll={()=>setModal('quizzes')}
            renderCard={item=><ContentCard item={item} accent={C.amber} onPress={()=>router.push(`/worksheet/${item.id}`)}/>}/>
        )}

        {/* Diagnostic */}
        <TouchableOpacity onPress={()=>router.push('/diagnostic')} activeOpacity={0.88}
          style={{ marginHorizontal:16, marginBottom:20, borderRadius:18, overflow:'hidden', elevation:4 }}>
          <LinearGradient colors={['#0a0f1a','#1a2040']} style={{ padding:18, flexDirection:'row', alignItems:'center', gap:14 }}>
            <Text style={{ fontSize:36 }}>🔍</Text>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'900', color:'#fff', marginBottom:3 }}>
                {diagResult?`Grammar Level: Grade ${diagResult.recommendedLevel}`:'Take Grammar Diagnostic'}
              </Text>
              <Text style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>
                {diagResult?'Tap to retake or see weak areas':'Find your level · Get personalized content'}
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
          <Text style={[s.sectionTitle,{marginBottom:14}]}>📊 Grammar Skills — Grade {grade}</Text>
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

      <Modal visible={!!modal} animationType="slide" transparent onRequestClose={()=>setModal(null)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex:1 }} onPress={()=>setModal(null)}/>
          <View style={s.modalSheet}>
            <View style={s.modalHandle}/>
            <Text style={s.modalTitle}>{modal==='worksheets'?'📋 All Worksheets':'⏱️ All Quizzes'}</Text>
            <ScrollView>
              {(modal==='worksheets'?worksheets:quizzes).map(item=>(
                <TouchableOpacity key={item.id} onPress={()=>{setModal(null);router.push(`/worksheet/${item.id}`);}} style={s.modalRow}>
                  <Text style={{ fontSize:30 }}>{item.icon||'✏️'}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'800', fontSize:14, color:C.text }}>{item.title}</Text>
                    <Text style={{ fontSize:11, color:C.muted, marginTop:2 }}>Grade {item.grade}</Text>
                  </View>
                  <View style={[s.chip,{backgroundColor:C.amber}]}><Text style={s.chipTxt}>⚡ +{item.xpReward||50}</Text></View>
                </TouchableOpacity>
              ))}
              {(modal==='worksheets'?worksheets:quizzes).length===0&&(
                <Text style={{ textAlign:'center', color:C.muted, padding:32 }}>No content yet for Grade {grade}</Text>
              )}
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
  sectionTitle: { fontSize:15, fontWeight:'800', color:C.text },
  seeAll:      { borderRadius:8, paddingVertical:4, paddingHorizontal:10 },
  seeAllTxt:   { fontSize:12, fontWeight:'700' },
  gradePill:   { flex:1, paddingVertical:7, borderRadius:10, borderWidth:2, alignItems:'center' },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  modalSheet:  { backgroundColor:C.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:36, maxHeight:'70%' },
  modalHandle: { width:40, height:4, borderRadius:99, backgroundColor:'#e5e5e5', alignSelf:'center', marginBottom:16 },
  modalTitle:  { fontSize:17, fontWeight:'800', color:C.text, marginBottom:16 },
  modalRow:    { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f5f5f5' },
});
