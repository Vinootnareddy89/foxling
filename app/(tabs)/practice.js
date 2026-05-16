import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getContent } from '../../src/firebase/content';
import { SUBJECTS } from '../../src/data/worksheets';

const C = {
  orange:'#f05a1a', green:'#26de81', amber:'#f7b731',
  text:'#1a0a00', muted:'#9a6a50', bg:'#fff8f5', border:'#ffe0cc',
};

const GRADES = [1, 2, 3, 4, 5];

export default function PracticeScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams();

  const [worksheets,    setWorksheets]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterSubject, setFilterSubject] = useState(params.subject || 'All');
  const [filterGrade,   setFilterGrade]   = useState('All');

  // Load from Firestore (falls back to local data)
  useEffect(() => {
    setLoading(true);
    getContent()
      .then(data => { setWorksheets(data); setLoading(false); })
      .catch(()  => setLoading(false));
  }, []);

  // Apply filters
  const filtered = worksheets.filter(w => {
    const matchSub   = filterSubject === 'All' || w.subject === filterSubject;
    const matchGrade = filterGrade   === 'All' || w.grade   === Number(filterGrade);
    return matchSub && matchGrade;
  });

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={[C.green, '#1aaf5e']} style={{ padding:20, paddingBottom:28 }}>
        <Text style={{ fontSize:26, fontWeight:'900', color:'#fff' }}>Explore & Practice</Text>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginTop:2 }}>Choose a worksheet to begin</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Subject filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap:8, padding:14 }}>
          {['All', ...SUBJECTS.map(s => s.id)].map(f => {
            const sub    = SUBJECTS.find(s => s.id === f);
            const active = filterSubject === f;
            const col    = sub?.color || C.orange;
            return (
              <TouchableOpacity key={f} onPress={() => setFilterSubject(f)}
                style={{ paddingVertical:8, paddingHorizontal:18, borderRadius:99, borderWidth:1.5,
                  borderColor: active ? col : C.border,
                  backgroundColor: active ? col : '#fff' }}>
                <Text style={{ fontWeight:'700', fontSize:13, color: active ? '#fff' : C.muted }}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grade filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap:8, paddingHorizontal:14, paddingBottom:14 }}>
          {['All', ...GRADES].map(g => {
            const active = filterGrade === String(g);
            return (
              <TouchableOpacity key={g} onPress={() => setFilterGrade(String(g))}
                style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:99, borderWidth:1.5,
                  borderColor: active ? C.text : C.border,
                  backgroundColor: active ? C.text : '#fff' }}>
                <Text style={{ fontWeight:'700', fontSize:12, color: active ? '#fff' : C.muted }}>
                  {g === 'All' ? 'All Grades' : `Grade ${g}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Loading */}
        {loading && (
          <View style={{ alignItems:'center', padding:48 }}>
            <ActivityIndicator size="large" color={C.orange} />
            <Text style={{ color:C.muted, marginTop:12, fontSize:13 }}>Loading worksheets...</Text>
          </View>
        )}

        {/* Results */}
        {!loading && (
          <>
            <Text style={{ paddingHorizontal:14, fontSize:12, color:'#aaa', fontWeight:'600', marginBottom:4 }}>
              {filtered.length} worksheet{filtered.length !== 1 ? 's' : ''} found
            </Text>
            <View style={{ padding:14, gap:12 }}>
              {filtered.length === 0 ? (
                <View style={{ alignItems:'center', padding:40 }}>
                  <Text style={{ fontSize:48, marginBottom:12 }}>🔭</Text>
                  <Text style={{ fontWeight:'700', color:C.muted, fontSize:16 }}>No worksheets found</Text>
                  <Text style={{ color:'#bbb', fontSize:13, marginTop:4 }}>Try a different subject or grade</Text>
                </View>
              ) : filtered.map(ws => (
                <TouchableOpacity key={ws.id}
                  onPress={() => router.push(`/worksheet/${ws.id}`)}
                  style={{ backgroundColor:'#fff', borderRadius:16, padding:18,
                    shadowColor:'#000', shadowOffset:{width:0,height:2},
                    shadowOpacity:0.07, shadowRadius:8, elevation:3 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
                    <Text style={{ fontSize:40 }}>{ws.icon}</Text>
                    <View style={{ flex:1 }}>
                      <Text style={{ fontWeight:'800', fontSize:15, color:C.text }}>{ws.title}</Text>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:3, flexWrap:'wrap' }}>
                        <View style={{ backgroundColor:(SUBJECTS.find(s=>s.id===ws.subject)?.color||C.orange)+'20', borderRadius:6, paddingVertical:2, paddingHorizontal:8 }}>
                          <Text style={{ fontSize:11, fontWeight:'800', color:SUBJECTS.find(s=>s.id===ws.subject)?.color||C.orange }}>{ws.subject}</Text>
                        </View>
                        <Text style={{ color:C.muted, fontSize:12 }}>Grade {ws.grade}</Text>
                        <Text style={{ color:C.border }}>·</Text>
                        <Text style={{ color:C.muted, fontSize:12 }}>{ws.questions?.length||0} questions</Text>
                        {ws.passage && (
                          <View style={{ backgroundColor:'#e8faf1', borderRadius:6, paddingVertical:2, paddingHorizontal:8 }}>
                            <Text style={{ fontSize:10, color:C.green, fontWeight:'800' }}>📖 Passage</Text>
                          </View>
                        )}
                        {ws.type && ws.type !== 'worksheet' && (
                          <View style={{ backgroundColor:'#f0eeff', borderRadius:6, paddingVertical:2, paddingHorizontal:8 }}>
                            <Text style={{ fontSize:10, color:'#6c63ff', fontWeight:'800' }}>
                              {ws.type==='quiz'?'⏱️ Quiz':ws.type==='game'?'🎮 Game':ws.type==='reading'?'📖 Reading':''}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ backgroundColor:'#f7b731', borderRadius:99, paddingVertical:3, paddingHorizontal:10, alignSelf:'flex-start', marginTop:8 }}>
                        <Text style={{ color:'#fff', fontWeight:'800', fontSize:11 }}>⚡ +{ws.xpReward} XP</Text>
                      </View>
                    </View>
                    <Text style={{ color:C.border, fontSize:22 }}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
