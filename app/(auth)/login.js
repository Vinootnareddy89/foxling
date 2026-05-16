import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../../src/firebase/config';

const C = { orange:'#f05a1a', orange2:'#c0392b', border:'#ffe0cc', muted:'#9a6a50' };

export default function LoginScreen() {
  const router = useRouter();
  const [tab,      setTab]      = useState('options'); // 'options' | 'email' | 'pin'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pin,      setPin]      = useState('');
  const [loading,  setLoading]  = useState(false);

  // ── EMAIL LOGIN ──────────────────────────────────────────
  const handleEmailLogin = async () => {
    if (!email || !password) { Alert.alert('Oops!', 'Please enter email and password.'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert('Login Failed', 'Invalid email or password.');
    }
    setLoading(false);
  };

  // ── GOOGLE LOGIN ─────────────────────────────────────────
  const handleGoogleLogin = async () => {
    Alert.alert('Google Sign-In', 'Google Sign-In requires additional setup for mobile. Please use email or username/PIN for now.');
  };

  // ── PIN LOGIN ────────────────────────────────────────────
  const handlePinLogin = async () => {
    if (!username.trim()) { Alert.alert('Oops!', 'Please enter your username.'); return; }
    if (pin.length < 4)   { Alert.alert('Oops!', 'Please enter your 4-digit PIN.'); return; }
    setLoading(true);
    try {
      // PIN login uses email format: username@foxling.kids
      const fakeEmail = `${username.trim().toLowerCase().replace(/\s+/g,'')}@foxling.kids`;
      await signInWithEmailAndPassword(auth, fakeEmail, pin);
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert('Login Failed', 'Wrong username or PIN. Ask a parent for help!');
    }
    setLoading(false);
  };

  // ── GUEST MODE ───────────────────────────────────────────
  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert('Error', 'Could not start guest session. Please try again.');
    }
    setLoading(false);
  };

  // ── PIN PAD ──────────────────────────────────────────────
  const PinPad = () => (
    <View style={{ alignItems:'center' }}>
      {/* PIN dots */}
      <View style={{ flexDirection:'row', gap:12, marginBottom:20 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={{ width:20, height:20, borderRadius:10,
            backgroundColor: pin.length > i ? C.orange : '#ddd' }} />
        ))}
      </View>
      {/* Number pad */}
      {[[1,2,3],[4,5,6],[7,8,9],['',0,'⌫']].map((row, ri) => (
        <View key={ri} style={{ flexDirection:'row', gap:12, marginBottom:12 }}>
          {row.map((num, ci) => (
            <TouchableOpacity key={ci}
              onPress={() => {
                if (num === '⌫') setPin(p => p.slice(0,-1));
                else if (num !== '' && pin.length < 4) setPin(p => p + String(num));
              }}
              style={{ width:72, height:72, borderRadius:36,
                backgroundColor: num === '' ? 'transparent' : num === '⌫' ? '#ffe0cc' : '#fff',
                borderWidth: num === '' ? 0 : 2, borderColor: '#ffe0cc',
                alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize: num === '⌫' ? 20 : 24, fontWeight:'700', color: C.orange }}>
                {num}
              </Text>
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
          <Text style={s.appName}>Foxling</Text>
          <Text style={s.tagline}>Learn. Explore. Grow.</Text>

          <View style={s.card}>

            {/* ── OPTIONS TAB ── */}
            {tab === 'options' && (
              <View style={{ gap:12 }}>
                <Text style={s.cardTitle}>Welcome Back! 👋</Text>

                {/* Kid PIN login */}
                <TouchableOpacity onPress={() => setTab('pin')} style={s.optionBtn}>
                  <Text style={{ fontSize:28 }}>🎮</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.optionTitle}>I'm a Kid</Text>
                    <Text style={s.optionSub}>Sign in with username + PIN</Text>
                  </View>
                  <Text style={{ color:C.orange, fontSize:18 }}>›</Text>
                </TouchableOpacity>

                {/* Parent email login */}
                <TouchableOpacity onPress={() => setTab('email')} style={s.optionBtn}>
                  <Text style={{ fontSize:28 }}>👨‍👩‍👧</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.optionTitle}>Parent Sign In</Text>
                    <Text style={s.optionSub}>Use email & password</Text>
                  </View>
                  <Text style={{ color:C.orange, fontSize:18 }}>›</Text>
                </TouchableOpacity>

                {/* Google login */}
                <TouchableOpacity onPress={handleGoogleLogin} disabled={loading}
                  style={[s.optionBtn, { opacity: loading ? 0.6 : 1 }]}>
                  <View style={{ width:28, height:28, borderRadius:14, backgroundColor:'#4285F4',
                    alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ color:'#fff', fontWeight:'900', fontSize:14 }}>G</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={s.optionTitle}>Sign in with Google</Text>
                    <Text style={s.optionSub}>Use your Google account</Text>
                  </View>
                  <Text style={{ color:C.orange, fontSize:18 }}>›</Text>
                </TouchableOpacity>

                {/* Guest mode */}
                <TouchableOpacity onPress={handleGuest} disabled={loading}
                  style={[s.guestBtn, { opacity: loading ? 0.6 : 1 }]}>
                  <Text style={{ color:'#888', fontWeight:'700', fontSize:14 }}>
                    {loading ? 'Loading...' : '👀 Continue as Guest'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ alignItems:'center', marginTop:4 }}>
                  <Text style={{ fontSize:13, color:'#888' }}>
                    No account? <Text style={{ color:C.orange, fontWeight:'800' }}>Sign Up Free</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── EMAIL TAB ── */}
            {tab === 'email' && (
              <View>
                <TouchableOpacity onPress={() => setTab('options')} style={{ marginBottom:16 }}>
                  <Text style={{ color:C.muted, fontSize:14 }}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.cardTitle}>Parent Sign In 👨‍👩‍👧</Text>
                <TextInput style={s.input} placeholder="Email address" placeholderTextColor="#aaa"
                  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={s.input} placeholder="Password" placeholderTextColor="#aaa"
                  value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity onPress={handleEmailLogin} disabled={loading}
                  style={[s.btn, { backgroundColor: loading?'#ddd':C.orange, marginTop:8 }]}>
                  <Text style={s.btnTxt}>{loading?'Signing in...':'Sign In →'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── PIN TAB ── */}
            {tab === 'pin' && (
              <View>
                <TouchableOpacity onPress={() => { setTab('options'); setPin(''); }} style={{ marginBottom:16 }}>
                  <Text style={{ color:C.muted, fontSize:14 }}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.cardTitle}>Kid Sign In 🎮</Text>
                <TextInput style={[s.input, { marginBottom:16 }]} placeholder="Your username" placeholderTextColor="#aaa"
                  value={username} onChangeText={setUsername} autoCapitalize="none" />
                <Text style={{ fontSize:13, fontWeight:'700', color:C.muted, textAlign:'center', marginBottom:12 }}>
                  Enter your 4-digit PIN
                </Text>
                <PinPad />
                <TouchableOpacity onPress={handlePinLogin} disabled={loading || pin.length < 4}
                  style={[s.btn, { backgroundColor: pin.length < 4 ? '#ddd' : C.orange, marginTop:8 }]}>
                  <Text style={s.btnTxt}>{loading ? 'Signing in...' : '🚀 Let\'s Go!'}</Text>
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
  container:    { flexGrow:1, justifyContent:'center', alignItems:'center', padding:24 },
  logo:         { fontSize:72, marginBottom:8 },
  appName:      { fontSize:34, fontWeight:'900', color:'#fff', letterSpacing:1 },
  tagline:      { fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:'600', marginBottom:32 },
  card:         { width:'100%', maxWidth:380, backgroundColor:'#fff', borderRadius:24, padding:24,
                  shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.18, shadowRadius:20, elevation:8 },
  cardTitle:    { fontSize:20, fontWeight:'900', color:'#1a0a00', marginBottom:18, textAlign:'center' },
  optionBtn:    { flexDirection:'row', alignItems:'center', gap:14, padding:14, borderRadius:14,
                  borderWidth:2, borderColor:'#ffe0cc', backgroundColor:'#fff8f5' },
  optionTitle:  { fontSize:14, fontWeight:'800', color:'#1a0a00' },
  optionSub:    { fontSize:12, color:'#9a6a50', marginTop:1 },
  guestBtn:     { padding:14, borderRadius:14, borderWidth:2, borderColor:'#eee',
                  backgroundColor:'#fafafa', alignItems:'center' },
  input:        { borderWidth:2, borderColor:'#ffe0cc', borderRadius:14, paddingVertical:14,
                  paddingHorizontal:16, fontSize:15, marginBottom:12, color:'#1a0a00', backgroundColor:'#fafafa' },
  btn:          { borderRadius:14, paddingVertical:14, alignItems:'center' },
  btnTxt:       { color:'#fff', fontSize:16, fontWeight:'800' },
});
