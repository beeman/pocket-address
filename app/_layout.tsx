import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { appColors } from '@/constants/app-theme'

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ contentStyle: { backgroundColor: appColors.background }, headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="light" />
    </AppProviders>
  )
}
