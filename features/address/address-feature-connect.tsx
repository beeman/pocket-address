import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { AppButton } from '@/components/app-button'
import { SCAN_FRAME_PATH } from '@/components/scan-frame'
import { appColors } from '@/constants/app-theme'

export function AddressFeatureConnect() {
  const { connect } = useMobileWallet()
  const [error, setError] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  async function submit() {
    setError(false)
    setIsConnecting(true)
    try {
      await connect()
    } catch {
      setError(true)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Svg height={96} viewBox="0 0 100 100" width={96}>
        <Path d={SCAN_FRAME_PATH} fill="none" stroke={appColors.accent} strokeLinecap="round" strokeWidth={8} />
        <Rect fill={appColors.accent} height={28} rx={6} width={28} x={36} y={36} />
      </Svg>
      <View style={styles.heading}>
        <Text style={styles.title}>Pocket Address</Text>
        <Text style={styles.tagline}>Your Solana address, ready to share</Text>
      </View>
      <View style={styles.actions}>
        <AppButton
          disabled={isConnecting}
          onPress={() => void submit()}
          style={styles.action}
          title={isConnecting ? 'Connecting…' : 'Connect Wallet'}
        />
      </View>
      <Text style={styles.error}>{error ? 'Could not connect. Please try again.' : ' '}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 24,
  },
  container: {
    alignItems: 'center',
    gap: 24,
  },
  error: {
    color: appColors.textMuted,
    fontSize: 14,
  },
  heading: {
    alignItems: 'center',
    gap: 10,
  },
  tagline: {
    color: appColors.textMuted,
    fontSize: 17,
    textAlign: 'center',
  },
  title: {
    color: appColors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
})
