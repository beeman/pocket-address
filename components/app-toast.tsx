import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { appColors } from '@/constants/app-theme'

/**
 * A small pill that shows `message` for a moment each time `show` is called. Visibility is driven by a timer,
 * not by the animation, so the toast still appears when the system has animations turned off.
 */
export function useAppToast(message: string, duration = 1500) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function show() {
    clearTimeout(timer.current)
    setVisible(true)
    timer.current = setTimeout(() => setVisible(false), duration)
  }

  const toast = visible ? (
    <Animated.View
      accessibilityLiveRegion="polite"
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(250)}
      pointerEvents="none"
      style={styles.toast}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  ) : null

  return { show, toast }
}

const styles = StyleSheet.create({
  text: {
    color: appColors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: appColors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    position: 'absolute',
    top: 8,
  },
})
