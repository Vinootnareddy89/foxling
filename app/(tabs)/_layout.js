import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';

const TAB_ICON = (emoji) => ({ focused }) => (
  <Text style={{ fontSize:20, opacity:focused?1:0.45 }}>{emoji}</Text>
);

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ffe0cc',
        paddingBottom: Platform.OS==='ios'?20:8,
        paddingTop: 8,
        height: Platform.OS==='ios'?80:62,
      },
      tabBarActiveTintColor:   '#f05a1a',
      tabBarInactiveTintColor: '#bbb',
      tabBarLabelStyle: { fontSize:10, fontWeight:'800' },
    }}>
      <Tabs.Screen name="home"     options={{ title:'Home',    tabBarIcon:TAB_ICON('🏠') }}/>
      <Tabs.Screen name="math"     options={{ title:'Math',    tabBarIcon:TAB_ICON('🔢') }}/>
      <Tabs.Screen name="reading"  options={{ title:'Reading', tabBarIcon:TAB_ICON('📖') }}/>
      <Tabs.Screen name="grammar"  options={{ title:'Grammar', tabBarIcon:TAB_ICON('✏️') }}/>
      <Tabs.Screen name="games"    options={{ title:'Games',   tabBarIcon:TAB_ICON('🎮') }}/>
      <Tabs.Screen name="progress" options={{ title:'Progress',tabBarIcon:TAB_ICON('📊') }}/>
    </Tabs>
  );
}
