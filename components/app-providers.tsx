import { PropsWithChildren } from 'react'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { AppConfig } from '@/constants/app-config'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MobileWalletProvider cluster={AppConfig.cluster} identity={AppConfig.identity}>
      {children}
    </MobileWalletProvider>
  )
}
