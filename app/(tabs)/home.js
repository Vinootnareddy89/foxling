import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevelInfo, getXPProgress, BADGES } from '../../src/utils/gamification';

const { width: SW } = Dimensions.get('window');
const C = {
  orange:'#f05a1a', orange2:'#c0392b', amber:'#f7b731',
  green:'#26de81',  blue:'#3b82f6',    purple:'#8b5cf6',
  bg:'#fff8f5',     white:'#ffffff',   text:'#1a0a00',
  muted:'#9a6a50',  border:'#ffe0cc',
};

// ── FOX PAW ───────────────────────────────────────────────
const FoxPaw = ({ color, emoji, label, onPress, delay, size=80 }) => {
  const scale  = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue:1, delay, useNativeDriver:true,
      tension:60, friction:6,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue:0.88, duration:80,  useNativeDriver:true }),
      Animated.spring(bounce,  { toValue:1,    tension:200, friction:5, useNativeDriver:true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}
      style={{ alignItems:'center', gap:6 }}>
      <Animated.View style={{ transform:[{scale:Animated.multiply(scale,bounce)}] }}>
        <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
          {/* Paw SVG approximation with React Native */}
          {/* Main pad */}
          <View style={{ position:'absolute', bottom:4, width:size*0.6, height:size*0.5,
            borderRadius:size*0.25, backgroundColor:color, opacity:0.95 }}/>
          {/* Top toe pads */}
          <View style={{ position:'absolute', top:size*0.05, left:size*0.05,
            width:size*0.24, height:size*0.22, borderRadius:size*0.12, backgroundColor:color }}/>
          <View style={{ position:'absolute', top:size*0,    left:'50%', marginLeft:-size*0.12,
            width:size*0.24, height:size*0.22, borderRadius:size*0.12, backgroundColor:color }}/>
          <View style={{ position:'absolute', top:size*0.05, right:size*0.05,
            width:size*0.24, height:size*0.22, borderRadius:size*0.12, backgroundColor:color }}/>
          {/* Emoji */}
          <Text style={{ position:'absolute', bottom:size*0.08, fontSize:size*0.3, zIndex:2 }}>{emoji}</Text>
          {/* Shine */}
          <View style={{ position:'absolute', bottom:size*0.18, left:size*0.15,
            width:size*0.15, height:size*0.1, borderRadius:99, backgroundColor:'rgba(255,255,255,0.35)' }}/>
        </View>
      </Animated.View>
      <Text style={{ fontSize:12, fontWeight:'800', color:C.text }}>{label}</Text>
    </TouchableOpacity>
  );
};

// ── DAILY BONUS ───────────────────────────────────────────
const BONUS_KEY = 'foxling_daily_bonus';
const DailyBonus = ({ onClaim }) => {
  const [claimed,  setClaimed]  = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { checkBonus(); }, []);
  useEffect(() => {
    if (!claimed) return;
    const i = setInterval(updateTimer, 60000);
    updateTimer();
    return () => clearInterval(i);
  }, [claimed]);

  const checkBonus = async () => {
    const stored = await AsyncStorage.getItem(BONUS_KEY).catch(()=>null);
    if (stored) {
      const last = new Date(stored);
      if (last.toDateString() === new Date().toDateString()) {
        setClaimed(true); updateTimer();
      }
    }
    setLoading(false);
  };

  const updateTimer = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
    const diff = tomorrow - now;
    const h = Math.floor(diff/(1000*60*60));
    const m = Math.floor((diff%(1000*60*60))/(1000*60));
    setTimeLeft(`${h}h ${m}m`);
  };

  const handleClaim = async () => {
    await AsyncStorage.setItem(BONUS_KEY, new Date().toISOString()).catch(()=>{});
    setClaimed(true); onClaim(); updateTimer();
    Alert.alert('🎉 Daily Bonus!', 'You earned +20 XP! Come back tomorrow! 🦊');
  };

  if (loading) return null;
  return (
    <TouchableOpacity onPress={claimed ? null : handleClaim} activeOpacity={claimed?1:0.85}
      style={[s.bonusCard, { backgroundColor: claimed?'#f5f5f5':'#fffbe6',
        borderColor: claimed?'#e5e5e5':C.amber+'50', opacity:claimed?0.7:1 }]}>
      <Text style={{ fontSize:26 }}>{claimed?'✅':'🎁'}</Text>
      <View style={{ flex:1 }}>
        <Text style={{ fontWeight:'800', color:claimed?'#888':C.amber, fontSize:14 }}>
          {claimed?'Daily Bonus Claimed!':'Daily Bonus! 🦊'}
        </Text>
        <Text style={{ color:C.muted, fontSize:12, marginTop:2 }}>
          {claimed?`Next bonus in ${timeLeft}`:'Tap to claim your free +20 XP!'}
        </Text>
      </View>
      {!claimed && <View style={s.xpPill}><Text style={s.xpPillTxt}>+20 ⚡</Text></View>}
    </TouchableOpacity>
  );
};

// ── MAIN HOME SCREEN ──────────────────────────────────────
export default function HomeScreen() {
  const router  = useRouter();
  const [profile, setProfile] = useState(null);
  const [xp,      setXp]      = useState(0);
  const [loading, setLoading] = useState(true);
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Blaze float animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue:-8, duration:1800, useNativeDriver:true }),
        Animated.timing(floatAnim, { toValue:0,  duration:1800, useNativeDriver:true }),
      ])
    ).start();
  }, []);

  // Load profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace('/(auth)/login'); return; }
      try {
        const snap = await getDoc(doc(db,'users',user.uid));
        if (snap.exists()) {
          const data = { uid:user.uid, ...snap.data() };
          setProfile(data);
          setXp(data.xp||0);
        } else {
          setProfile({ uid:user.uid, name:user.displayName||'Explorer', grade:1, xp:0, streak:0, badges:[] });
        }
      } catch(e) {
        setProfile({ uid:user.uid, name:user.displayName||'Explorer', grade:1, xp:0, streak:0, badges:[] });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading || !profile) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:C.bg }}>
      <Text style={{ fontSize:48 }}>🦊</Text>
    </View>
  );

  const lvl = getLevelInfo(xp);
  const pct = getXPProgress(xp);
  const earnedBadges = new Set(profile.badges||[]);

  // Paw subjects
  const PAWS = [
    { id:'math',    label:'Math',    emoji:'🔢', color:C.orange,  pos:'left',   route:'/(tabs)/math'    },
    { id:'reading', label:'Reading', emoji:'📖', color:C.green,   pos:'center', route:'/(tabs)/reading'  },
    { id:'grammar', label:'Grammar', emoji:'✏️', color:C.blue,    pos:'right',  route:'/(tabs)/grammar'  },
    { id:'games',   label:'Games',   emoji:'🎮', color:C.purple,  pos:'left',   route:'/(tabs)/games'   },
    { id:'quiz',    label:'Quiz',    emoji:'⏱️', color:C.amber,   pos:'right',  route:'/(tabs)/practice' },
    { id:'diag',    label:'Diagnose',emoji:'🔍', color:'#e11d48', pos:'center', route:'/diagnostic'      },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <LinearGradient colors={[C.orange, C.orange2]} style={s.header}>
          {/* Background paw decorations */}
          <Text style={s.bgPaw1}>🐾</Text>
          <Text style={s.bgPaw2}>🐾</Text>

          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>Hi, {profile.name?.split(' ')[0]||'Explorer'}! 👋</Text>
              <Text style={s.greetingSub}>{lvl.emoji} {lvl.name}</Text>
            </View>
            <TouchableOpacity onPress={()=>Alert.alert('Sign Out','Are you sure?',[
              {text:'Cancel',style:'cancel'},
              {text:'Sign Out',style:'destructive',onPress:()=>{signOut(auth);router.replace('/(auth)/login');}},
            ])} style={s.avatar}>
              <Text style={{ fontSize:22 }}>{lvl.emoji}</Text>
            </TouchableOpacity>
          </View>

          {/* XP + Streak row */}
          <View style={s.statsRow}>
            <View style={s.statPill}>
              <Text style={{ fontSize:14 }}>⚡</Text>
              <Text style={s.statTxt}>{xp} XP</Text>
            </View>
            <View style={[s.statPill, { marginLeft:8 }]}>
              <Text style={{ fontSize:14 }}>🔥</Text>
              <Text style={[s.statTxt, { color:'#ffd700' }]}>{profile.streak||0} day streak</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={s.barTrack}>
            <View style={[s.barFill, { width:`${pct}%` }]} />
          </View>
          <Text style={s.xpHint}>🐾 {pct}% to {BADGES[Math.min(lvl.level, BADGES.length-1)]?.name||'next level'}</Text>
        </LinearGradient>

        {/* ── BLAZE CARD ── */}
        <View style={s.blazeCard}>
          <Animated.Text style={{ fontSize:52, transform:[{translateY:floatAnim}] }}>🦊</Animated.Text>
          <View style={{ flex:1 }}>
            <Text style={{ fontWeight:'800', fontSize:16, color:C.orange, marginBottom:3 }}>
              Hey! I'm Blaze! 🦊
            </Text>
            <Text style={{ fontSize:13, color:C.muted, lineHeight:19 }}>
              Follow my paw prints to choose your adventure — each paw leads somewhere new!
            </Text>
          </View>
        </View>

        {/* ── PAW TRAIL ── */}
        <View style={s.pawTrailCard}>
          <Text style={s.trailTitle}>🐾 Follow Blaze's Trail</Text>
          <Text style={s.trailSub}>Tap a paw print to begin your journey</Text>

          {/* Trail layout — 3 columns */}
          <View style={{ marginTop:8 }}>
            {/* Row 1: Math · Reading · Grammar */}
            <View style={s.pawRow}>
              <FoxPaw color={C.orange} emoji="🔢" label="Math"    delay={0}   onPress={()=>router.push('/(tabs)/math')}     />
              <FoxPaw color={C.green}  emoji="📖" label="Reading" delay={120} onPress={()=>router.push('/(tabs)/reading')} />
              <FoxPaw color={C.blue}   emoji="✏️" label="Grammar" delay={240} onPress={()=>router.push('/(tabs)/grammar')} />
            </View>

            {/* Dashed trail connector */}
            <View style={s.trailConnector}>
              <View style={s.dashLine}/>
              <Text style={{ fontSize:20 }}>🦊</Text>
              <View style={s.dashLine}/>
            </View>

            {/* Row 2: Games · Diagnose · Quiz */}
            <View style={s.pawRow}>
              <FoxPaw color={C.purple}  emoji="🎮" label="Games"    delay={360} onPress={()=>router.push('/(tabs)/games')} />
              <FoxPaw color={'#e11d48'} emoji="🔍" label="Diagnose" delay={480} onPress={()=>router.push('/diagnostic')}   />
              <FoxPaw color={C.amber}   emoji="⏱️" label="Quiz"     delay={600} onPress={()=>router.push('/(tabs)/practice')} />
            </View>
          </View>
        </View>

        {/* ── DAILY BONUS ── */}
        <DailyBonus onClaim={()=>setXp(x=>x+20)} />

        {/* ── BADGES ── */}
        <View style={s.badgesCard}>
          <Text style={s.sectionTitle}>🏅 Blaze's Badges</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
            {BADGES.slice(0,4).map(b=>(
              <View key={b.id} style={{ alignItems:'center', opacity:earnedBadges.has(b.id)?1:0.3 }}>
                <Text style={{ fontSize:30 }}>{b.emoji}</Text>
                <Text style={{ fontSize:9, fontWeight:'800', color:C.text, marginTop:4, textAlign:'center' }}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:       { padding:20, paddingTop:16, paddingBottom:24, overflow:'hidden' },
  bgPaw1:       { position:'absolute', right:-16, top:-10, fontSize:80, opacity:0.08, transform:[{rotate:'15deg'}] },
  bgPaw2:       { position:'absolute', left:-12, bottom:-8, fontSize:60, opacity:0.08, transform:[{rotate:'-20deg'}] },
  headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  greeting:     { fontSize:22, fontWeight:'900', color:'#fff' },
  greetingSub:  { fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:'600', marginTop:2 },
  avatar:       { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center' },
  statsRow:     { flexDirection:'row', marginBottom:12 },
  statPill:     { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:99, paddingVertical:5, paddingHorizontal:12 },
  statTxt:      { fontSize:13, fontWeight:'800', color:'#fff' },
  barTrack:     { backgroundColor:'rgba(255,255,255,0.3)', borderRadius:99, height:10, overflow:'hidden' },
  barFill:      { backgroundColor:'#fff', height:'100%', borderRadius:99 },
  xpHint:       { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:6 },
  blazeCard:    { margin:16, marginBottom:12, backgroundColor:'#fff', borderRadius:20, padding:16, flexDirection:'row', alignItems:'center', gap:14, borderWidth:2, borderColor:'#fff0e8', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8, elevation:3 },
  pawTrailCard: { marginHorizontal:16, marginBottom:12, backgroundColor:'#fffbf8', borderRadius:24, padding:16, borderWidth:2, borderColor:'#ffe5d4', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:8, elevation:2 },
  trailTitle:   { fontSize:13, fontWeight:'800', color:C.muted, textAlign:'center', letterSpacing:0.5 },
  trailSub:     { fontSize:12, color:C.muted, textAlign:'center', marginTop:2 },
  pawRow:       { flexDirection:'row', justifyContent:'space-around', paddingHorizontal:8, paddingVertical:4 },
  trailConnector:{ flexDirection:'row', alignItems:'center', paddingHorizontal:24, marginVertical:4 },
  dashLine:     { flex:1, height:2, borderRadius:99, backgroundColor:C.border, borderStyle:'dashed' },
  bonusCard:    { marginHorizontal:16, marginBottom:12, borderRadius:18, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:2 },
  xpPill:       { backgroundColor:C.amber, borderRadius:99, paddingVertical:4, paddingHorizontal:12 },
  xpPillTxt:    { color:'#fff', fontWeight:'800', fontSize:12 },
  badgesCard:   { marginHorizontal:16, marginBottom:12, backgroundColor:'#fff', borderRadius:18, padding:18, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8, elevation:3 },
  sectionTitle: { fontSize:15, fontWeight:'800', color:C.text, marginBottom:14 },
});
