import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown:false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login"    />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="worksheet/[id]"  options={{ presentation:'fullScreenModal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
