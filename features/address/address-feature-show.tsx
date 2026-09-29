import Clipboard from '@react-native-clipboard/clipboard'
import * as Haptics from 'expo-haptics'
import { Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { AppButton } from '@/components/app-button'
import { useAppToast } from '@/components/app-toast'
import { QrCode } from '@/components/qr-code'
import { ScanFrame } from '@/components/scan-frame'
import { appColors } from '@/constants/app-theme'
import { ellipsify } from '@/utils/ellipsify'

const CARD_PADDING = 20
const FRAME_INSET = 28

export function AddressFeatureShow({ address }: { address: string }) {
  const { disconnect } = useMobileWallet()
  const { width } = useWindowDimensions()
  const copied = useAppToast('Copied')
  const cardSize = Math.min(width - 2 * (32 + FRAME_INSET), 340)
  const frameSize = cardSize + 2 * FRAME_INSET

  function copy() {
    Clipboard.setString(address)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    copied.show()
  }

  return (
    <View style={styles.container}>
      <View style={{ height: frameSize, width: frameSize }}>
        <ScanFrame size={frameSize} />
        <View
          accessibilityLabel={`QR code for ${address}`}
          style={[styles.card, { height: cardSize, left: FRAME_INSET, top: FRAME_INSET, width: cardSize }]}
        >
          <QrCode size={cardSize - 2 * CARD_PADDING} value={address} />
        </View>
      </View>
      <View style={styles.addressBlock}>
        <Text style={styles.caption}>Your address</Text>
        <Text accessibilityLabel={address} style={styles.address}>
          {ellipsify(address)}
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton onPress={copy} style={styles.action} title="Copy" />
        <AppButton
          onPress={() => void Share.share({ message: address })}
          style={styles.action}
          title="Share"
          variant="secondary"
        />
      </View>
      <AppButton onPress={() => void disconnect()} title="Disconnect" variant="text" />
      {copied.toast}
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
    gap: 12,
  },
  address: {
    color: appColors.text,
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  addressBlock: {
    alignItems: 'center',
    gap: 6,
  },
  caption: {
    color: appColors.textMuted,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    backgroundColor: appColors.qrBackground,
    borderRadius: 20,
    justifyContent: 'center',
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 28,
    justifyContent: 'center',
  },
})
