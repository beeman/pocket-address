import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { AddressFeatureConnect } from '@/features/address/address-feature-connect'
import { AddressFeatureShow } from '@/features/address/address-feature-show'
import { AppScreen } from '@/components/app-screen'

export default function HomeScreen() {
  const { account } = useMobileWallet()

  return <AppScreen>{account ? <AddressFeatureShow address={account.address} /> : <AddressFeatureConnect />}</AppScreen>
}
