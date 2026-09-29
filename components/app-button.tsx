import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { appColors } from '@/constants/app-theme'

export function AppButton({
  disabled,
  onPress,
  style,
  title,
  variant = 'primary',
}: {
  disabled?: boolean
  onPress: () => void
  style?: StyleProp<ViewStyle>
  title: string
  variant?: 'primary' | 'secondary' | 'text'
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  primary: {
    backgroundColor: appColors.accent,
  },
  primaryLabel: {
    color: appColors.accentText,
  },
  secondary: {
    backgroundColor: appColors.surface,
    borderColor: appColors.border,
    borderWidth: 1,
  },
  secondaryLabel: {
    color: appColors.text,
  },
  text: {
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  textLabel: {
    color: appColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
})
