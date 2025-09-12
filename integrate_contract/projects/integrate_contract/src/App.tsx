import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import Home from './Home'

// Force Pera Wallet only for demo
const supportedWallets: SupportedWallet[] = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
]

export default function App() {
  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: 'testnet',
    networks: {
      testnet: {
        algod: {
          baseServer: 'https://testnet-api.algonode.cloud',
          port: 443,
          token: '',
        },
        indexer: {
          baseServer: 'https://testnet-idx.algonode.cloud',
          port: 443,
          token: '',
        },
      },
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <Home />
      </WalletProvider>
    </SnackbarProvider>
  )
}
