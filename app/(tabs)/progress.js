import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';
import { getUserProgress, getBestScore } from '../../src/firebase/progress';
import { WORKSHEETS, SUBJECTS } from '../../src/data/worksheets';
import { getLevelInfo, getXPProgress, LEVELS, BADGES } from '../../src/utils/gamification';

const C = { orange:'#f05a1a', amber:'#f7b731', green:'#26de81', text:'#1a0a00', muted:'#9a6a50', bg:'#fff8f5', border:'#ffe0cc' };

export default function ProgressScreen() {
  const [profile,  setProfile]  = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const [snap, prog] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getUserProgress(user.uid),
        ]);
        if (snap.exists()) setProfile({ uid: user.uid, ...snap.data() });
        setProgress(prog);
      } catch (e) { console.warn('Progress load error:', e); }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.bg }}>
      <ActivityIndicator size="large" color={C.orange} />
    </View>
  );

  if (!profile) return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color:C.muted }}>Please log in to see your progress</Text>
      </View>
    </SafeAreaView>
  );

  const xp      = profile.xp || 0;
  const lvl     = getLevelInfo(xp);
  const pct     = getXPProgress(xp);
  const earned  = new Set(profile.badges || []);
  const streak  = profile.streak || 0;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={['#fd9644', '#e55039']} style={{ padding:20, paddingBottom:28 }}>
        <Text style={{ fontSize:26, fontWeight:'900', color:'#fff' }}>Blaze's Journey</Text>
        <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginTop:2 }}>Keep up the great work!</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, gap:14 }} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={{ flexDirection:'row', gap:10 }}>
          {[
            { l:'Total XP',   v:xp,             e:'⚡', c:C.amber  },
            { l:'Streak',     v:`${streak} days`,e:'🔥', c:C.orange },
            { l:'Completed',  v:progress.length, e:'📋', c:C.green  },
          ].map((st,i) => (
            <View key={i} style={{ flex:1, backgroundColor:'#fff', borderRadius:14, padding:12, alignItems:'center', borderTopWidth:4, borderTopColor:st.c, elevation:2 }}>
              <Text style={{ fontSize:22 }}>{st.e}</Text>
              <Text style={{ fontSize:20, fontWeight:'900', color:st.c }}>{st.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, fontWeight:'700' }}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Level */}
        <View style={{ backgroundColor:'#fff', borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontWeight:'800', fontSize:15, color:C.text, marginBottom:12 }}>
            {lvl.emoji} Level {lvl.level} — {lvl.name}
          </Text>
          <View style={{ backgroundColor:'#ffe0cc', borderRadius:99, height:12, overflow:'hidden' }}>
            <View style={{ width:`${pct}%`, backgroundColor:lvl.color, height:'100%', borderRadius:99 }} />
          </View>
          <Text style={{ fontSize:12, color:C.muted, marginTop:6 }}>{xp} XP · {pct}% to next level</Text>
          <View style={{ flexDirection:'row', gap:6, marginTop:14 }}>
            {LEVELS.map(l => (
              <View key={l.level} style={{ flex:1, height:8, borderRadius:99, backgroundColor: xp>=l.minXP?l.color:'#ffe0cc' }} />
            ))}
          </View>
          <View style={{ flexDirection:'row', gap:6, marginTop:4 }}>
            {LEVELS.map(l => <Text key={l.level} style={{ flex:1, textAlign:'center', fontSize:13 }}>{l.emoji}</Text>)}
          </View>
        </View>

        {/* Badges */}
        <View style={{ backgroundColor:'#fff', borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontWeight:'800', fontSize:15, color:C.text, marginBottom:14 }}>
            Badges ({earned.size}/{BADGES.length})
          </Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:14, justifyContent:'space-around' }}>
            {BADGES.map(b => (
              <View key={b.id} style={{ alignItems:'center', opacity:earned.has(b.id)?1:0.3, width:70 }}>
                <Text style={{ fontSize:30 }}>{b.emoji}</Text>
                <Text style={{ fontSize:10, fontWeight:'800', color:C.text, textAlign:'center', marginTop:4 }}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject breakdown */}
        <View style={{ backgroundColor:'#fff', borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontWeight:'800', fontSize:15, color:C.text, marginBottom:14 }}>Subject Breakdown</Text>
          {SUBJECTS.map(sub => {
            const subProg = progress.filter(p => WORKSHEETS.find(w => w.id === p.worksheetId)?.subject === sub.id);
            const avg = subProg.length > 0 ? Math.round(subProg.reduce((a,b) => a+b.score, 0) / subProg.length) : 0;
            return (
              <View key={sub.id} style={{ marginBottom:14 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                  <Text style={{ fontWeight:'700', fontSize:13 }}>{sub.emoji} {sub.id}</Text>
                  <Text style={{ fontSize:12, fontWeight:'700', color:sub.color }}>
                    {subProg.length} done · {avg}% avg
                  </Text>
                </View>
                <View style={{ backgroundColor:'#ffe0cc', borderRadius:99, height:9, overflow:'hidden' }}>
                  <View style={{ width:`${avg}%`, backgroundColor:sub.color, height:'100%', borderRadius:99 }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent activity */}
        <View style={{ backgroundColor:'#fff', borderRadius:18, padding:18, elevation:3 }}>
          <Text style={{ fontWeight:'800', fontSize:15, color:C.text, marginBottom:12 }}>Recent Activity</Text>
          {progress.length === 0 ? (
            <Text style={{ color:C.muted, textAlign:'center', padding:20, fontSize:13 }}>
              No worksheets completed yet. Start learning! 🦊
            </Text>
          ) : (
            [...progress].slice(0, 8).map((p, i) => {
              const ws = WORKSHEETS.find(w => w.id === p.worksheetId);
              if (!ws) return null;
              const date = p.completedAt?.toDate?.() ?? new Date();
              return (
                <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10,
                  borderBottomWidth: i < Math.min(progress.length,8)-1 ? 1 : 0, borderBottomColor:'#f5f5f5' }}>
                  <Text style={{ fontSize:24 }}>{ws.icon}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'700', fontSize:13 }}>{ws.title}</Text>
                    <Text style={{ fontSize:11, color:C.muted }}>{ws.subject} · {date.toLocaleDateString()}</Text>
                  </View>
                  <Text style={{ fontWeight:'900', fontSize:15,
                    color: p.score>=80?C.green:p.score>=60?C.amber:'#ff6b6b' }}>
                    {p.score}%
                  </Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
