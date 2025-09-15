import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ChatProvider>
    </AuthProvider>
  );
}