import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebase/config';

const C = { orange:'#f05a1a', orange2:'#c0392b', border:'#ffe0cc', muted:'#9a6a50' };
const GRADES  = [1, 2, 3, 4, 5];
const AVATARS = ['🦊','🐶','🐱','🐸','🦁','🐻','🐼','🐨','🦄','🐯'];

export default function RegisterScreen() {
  const router  = useRouter();
  const [tab,      setTab]      = useState('choose'); // 'choose' | 'parent' | 'kid'
  const [loading,  setLoading]  = useState(false);

  // Parent fields
  const [parentName,  setParentName]  = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [kidName,     setKidName]     = useState('');
  const [grade,       setGrade]       = useState(1);

  // Kid fields
  const [username,    setUsername]    = useState('');
  const [pin,         setPin]         = useState('');
  const [avatar,      setAvatar]      = useState('🦊');
  const [kidGrade,    setKidGrade]    = useState(1);

  // ── PARENT REGISTER ──────────────────────────────────────
  const handleParentRegister = async () => {
    if (!parentName || !email || !password || !kidName) {
      Alert.alert('Oops!', 'Please fill in all fields.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: kidName.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:        cred.user.uid,
        name:       kidName.trim(),
        parentName: parentName.trim(),
        email:      email.trim(),
        grade,
        xp:         0,
        streak:     0,
        badges:     [],
        avatar:     '🦊',
        accountType:'parent',
        createdAt:  new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      router.replace('/(tabs)/home');
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        Alert.alert('Email Taken', 'This email is already registered.');
      } else {
        Alert.alert('Registration Failed', e.message);
      }
    }
    setLoading(false);
  };

  // ── KID REGISTER ─────────────────────────────────────────
  const handleKidRegister = async () => {
    if (!username.trim()) { Alert.alert('Oops!', 'Please choose a username.'); return; }
    if (pin.length < 4)   { Alert.alert('Oops!', 'Please set a 4-digit PIN.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Invalid Username', 'Username can only have letters, numbers and underscores.'); return;
    }
    setLoading(true);
    try {
      const fakeEmail = `${username.trim().toLowerCase()}@foxling.kids`;
      const cred = await createUserWithEmailAndPassword(auth, fakeEmail, pin);
      await updateProfile(cred.user, { displayName: username.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:        cred.user.uid,
        name:       username.trim(),
        email:      fakeEmail,
        grade:      kidGrade,
        xp:         0,
        streak:     0,
        badges:     [],
        avatar,
        accountType:'kid',
        createdAt:  new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      router.replace('/(tabs)/home');
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        Alert.alert('Username Taken', 'This username is already taken. Try a different one!');
      } else {
        Alert.alert('Registration Failed', e.message);
      }
    }
    setLoading(false);
  };

  // ── PIN PAD ──────────────────────────────────────────────
  const PinPad = () => (
    <View style={{ alignItems:'center' }}>
      <View style={{ flexDirection:'row', gap:12, marginBottom:16 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={{ width:18, height:18, borderRadius:9,
            backgroundColor: pin.length > i ? C.orange : '#ddd' }} />
        ))}
      </View>
      {[[1,2,3],[4,5,6],[7,8,9],['',0,'⌫']].map((row, ri) => (
        <View key={ri} style={{ flexDirection:'row', gap:10, marginBottom:10 }}>
          {row.map((num, ci) => (
            <TouchableOpacity key={ci}
              onPress={() => {
                if (num === '⌫') setPin(p => p.slice(0,-1));
                else if (num !== '' && pin.length < 4) setPin(p => p + String(num));
              }}
              style={{ width:64, height:64, borderRadius:32,
                backgroundColor: num===''?'transparent':num==='⌫'?'#ffe0cc':'#fff',
                borderWidth: num===''?0:2, borderColor:'#ffe0cc',
                alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize: num==='⌫'?18:22, fontWeight:'700', color:C.orange }}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient colors={[C.orange, C.orange2]} style={{ flex:1 }}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <Text style={s.logo}>🦊</Text>
          <Text style={s.appName}>Join Foxling!</Text>

          <View style={s.card}>

            {/* ── CHOOSE TYPE ── */}
            {tab === 'choose' && (
              <View style={{ gap:12 }}>
                <Text style={s.cardTitle}>Who's signing up? 🌟</Text>

                <TouchableOpacity onPress={() => setTab('kid')} style={s.typeBtn}>
                  <Text style={{ fontSize:36 }}>🧒</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.typeTitle}>I'm a Kid!</Text>
                    <Text style={s.typeSub}>Pick a username + PIN — no email needed!</Text>
                  </View>
                  <Text style={{ color:C.orange, fontSize:18 }}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setTab('parent')} style={s.typeBtn}>
                  <Text style={{ fontSize:36 }}>👨‍👩‍👧</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.typeTitle}>I'm a Parent</Text>
                    <Text style={s.typeSub}>Sign up with email to manage your child's account</Text>
                  </View>
                  <Text style={{ color:C.orange, fontSize:18 }}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ alignItems:'center', marginTop:8 }}>
                  <Text style={{ fontSize:13, color:'#888' }}>
                    Already have an account? <Text style={{ color:C.orange, fontWeight:'800' }}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── KID REGISTER ── */}
            {tab === 'kid' && (
              <View>
                <TouchableOpacity onPress={() => { setTab('choose'); setPin(''); }} style={{ marginBottom:14 }}>
                  <Text style={{ color:C.muted, fontSize:14 }}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.cardTitle}>Create Your Profile 🧒</Text>

                {/* Avatar picker */}
                <Text style={s.label}>Pick your avatar:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  style={{ marginBottom:14 }}>
                  <View style={{ flexDirection:'row', gap:8, paddingVertical:4 }}>
                    {AVATARS.map(av => (
                      <TouchableOpacity key={av} onPress={() => setAvatar(av)}
                        style={{ width:48, height:48, borderRadius:24, borderWidth:3,
                          borderColor: avatar===av ? C.orange : '#eee',
                          backgroundColor: avatar===av ? '#fff0e8' : '#fafafa',
                          alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ fontSize:26 }}>{av}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TextInput style={s.input} placeholder="Choose a username (e.g. BlazeFox22)"
                  placeholderTextColor="#aaa" value={username} onChangeText={setUsername}
                  autoCapitalize="none" autoCorrect={false} />

                <Text style={s.label}>Your Grade:</Text>
                <View style={s.gradeRow}>
                  {GRADES.map(g => (
                    <TouchableOpacity key={g} onPress={() => setKidGrade(g)}
                      style={[s.gradeBtn, kidGrade===g && s.gradeBtnActive]}>
                      <Text style={[s.gradeTxt, kidGrade===g && s.gradeTxtActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.label}>Set your secret PIN:</Text>
                <PinPad />

                <TouchableOpacity onPress={handleKidRegister}
                  disabled={loading || pin.length < 4 || !username.trim()}
                  style={[s.btn, { backgroundColor: (loading||pin.length<4||!username.trim()) ? '#ddd' : C.orange, marginTop:12 }]}>
                  <Text style={s.btnTxt}>{loading ? 'Creating...' : '🦊 Start My Adventure!'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── PARENT REGISTER ── */}
            {tab === 'parent' && (
              <View>
                <TouchableOpacity onPress={() => setTab('choose')} style={{ marginBottom:14 }}>
                  <Text style={{ color:C.muted, fontSize:14 }}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.cardTitle}>Parent Sign Up 👨‍👩‍👧</Text>

                <TextInput style={s.input} placeholder="Your name" placeholderTextColor="#aaa"
                  value={parentName} onChangeText={setParentName} autoCapitalize="words" />
                <TextInput style={s.input} placeholder="Your email" placeholderTextColor="#aaa"
                  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={s.input} placeholder="Password (6+ characters)" placeholderTextColor="#aaa"
                  value={password} onChangeText={setPassword} secureTextEntry />

                <View style={{ height:1, backgroundColor:'#eee', marginVertical:14 }} />
                <Text style={s.label}>Your child's name:</Text>
                <TextInput style={s.input} placeholder="Child's first name" placeholderTextColor="#aaa"
                  value={kidName} onChangeText={setKidName} autoCapitalize="words" />

                <Text style={s.label}>Their grade:</Text>
                <View style={s.gradeRow}>
                  {GRADES.map(g => (
                    <TouchableOpacity key={g} onPress={() => setGrade(g)}
                      style={[s.gradeBtn, grade===g && s.gradeBtnActive]}>
                      <Text style={[s.gradeTxt, grade===g && s.gradeTxtActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleParentRegister} disabled={loading}
                  style={[s.btn, { backgroundColor: loading ? '#ddd' : C.orange, marginTop:8 }]}>
                  <Text style={s.btnTxt}>{loading ? 'Creating account...' : '🌟 Create Account'}</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:      { flexGrow:1, justifyContent:'center', alignItems:'center', padding:24, paddingTop:50 },
  logo:           { fontSize:64, marginBottom:6 },
  appName:        { fontSize:30, fontWeight:'900', color:'#fff', marginBottom:24 },
  card:           { width:'100%', maxWidth:380, backgroundColor:'#fff', borderRadius:24, padding:24,
                    shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.18, shadowRadius:20, elevation:8 },
  cardTitle:      { fontSize:20, fontWeight:'900', color:'#1a0a00', marginBottom:16, textAlign:'center' },
  typeBtn:        { flexDirection:'row', alignItems:'center', gap:14, padding:16, borderRadius:14,
                    borderWidth:2, borderColor:'#ffe0cc', backgroundColor:'#fff8f5' },
  typeTitle:      { fontSize:15, fontWeight:'800', color:'#1a0a00' },
  typeSub:        { fontSize:12, color:'#9a6a50', marginTop:2 },
  label:          { fontSize:12, fontWeight:'700', color:'#666', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 },
  input:          { borderWidth:2, borderColor:'#ffe0cc', borderRadius:14, paddingVertical:13,
                    paddingHorizontal:16, fontSize:14, marginBottom:12, color:'#1a0a00', backgroundColor:'#fafafa' },
  gradeRow:       { flexDirection:'row', gap:8, marginBottom:16 },
  gradeBtn:       { flex:1, height:42, borderRadius:10, borderWidth:2, borderColor:'#ffe0cc',
                    alignItems:'center', justifyContent:'center', backgroundColor:'#fff8f5' },
  gradeBtnActive: { backgroundColor:C.orange, borderColor:C.orange },
  gradeTxt:       { fontSize:15, fontWeight:'800', color:'#888' },
  gradeTxtActive: { color:'#fff' },
  btn:            { borderRadius:14, paddingVertical:14, alignItems:'center' },
  btnTxt:         { color:'#fff', fontSize:15, fontWeight:'800' },
});

