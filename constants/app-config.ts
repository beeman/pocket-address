import { AppIdentity, createSolanaMainnet, SolanaCluster } from '@wallet-ui/react-native-kit'

export class AppConfig {
  static cluster: SolanaCluster = createSolanaMainnet({ url: 'https://api.mainnet.solana.com' })
  static identity: AppIdentity = { name: 'Pocket Address' }
  static privacyPolicyUrl = 'https://beeman.github.io/sandbox-bitterbal/privacy-policy/'
}
