import { PropsWithChildren } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppConfig } from '@/constants/app-config'
import { appColors } from '@/constants/app-theme'

export function AppScreen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>{children}</View>
      <Pressable
        accessibilityRole="link"
        hitSlop={12}
        onPress={() => void Linking.openURL(AppConfig.privacyPolicyUrl)}
        style={styles.footer}
      >
        <Text style={styles.footerText}>Privacy policy</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  footer: {
    alignSelf: 'center',
    paddingBottom: 16,
    paddingTop: 8,
  },
  footerText: {
    color: appColors.textMuted,
    fontSize: 13,
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
})
