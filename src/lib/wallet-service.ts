import { PeraWalletConnect } from '@perawallet/connect';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export interface WalletInfo {
  address: string;
  name: string;
  type: 'pera' | 'walletconnect';
  connected: boolean;
}

export class WalletService {
  private peraWallet: PeraWalletConnect | null = null;
  private walletConnectProvider: any = null;
  private currentWallet: WalletInfo | null = null;

  constructor() {
    this.initializePeraWallet();
  }

  private initializePeraWallet() {
    try {
      this.peraWallet = new PeraWalletConnect({
        chainId: 416002, // Algorand Mainnet
        bridge: 'https://bridge.walletconnect.org'
      });
    } catch (error) {
      console.error('Failed to initialize Pera Wallet:', error);
    }
  }

  async connectPeraWallet(): Promise<WalletInfo | null> {
    try {
      if (!this.peraWallet) {
        throw new Error('Pera Wallet not initialized');
      }

      const accounts = await this.peraWallet.connect();
      
      if (accounts && accounts.length > 0) {
        const walletInfo: WalletInfo = {
          address: accounts[0],
          name: 'Pera Wallet',
          type: 'pera',
          connected: true
        };
        
        this.currentWallet = walletInfo;
        this.saveWalletInfo(walletInfo);
        return walletInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to connect Pera Wallet:', error);
      throw error;
    }
  }

  async connectWalletConnect(): Promise<WalletInfo | null> {
    try {
      this.walletConnectProvider = await EthereumProvider.init({
        projectId: 'YOUR_PROJECT_ID', // You'll need to get this from WalletConnect
        chains: [1], // Ethereum mainnet
        showQrModal: true,
        metadata: {
          name: 'NutriGrade',
          description: 'Nutrition Scanner App',
          url: 'https://nutrigrade.app',
          icons: ['https://nutrigrade.app/icon.png']
        }
      });

      const accounts = await this.walletConnectProvider.enable();
      
      if (accounts && accounts.length > 0) {
        const walletInfo: WalletInfo = {
          address: accounts[0],
          name: 'WalletConnect',
          type: 'walletconnect',
          connected: true
        };
        
        this.currentWallet = walletInfo;
        this.saveWalletInfo(walletInfo);
        return walletInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to connect WalletConnect:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (this.currentWallet?.type === 'pera' && this.peraWallet) {
        await this.peraWallet.disconnect();
      } else if (this.currentWallet?.type === 'walletconnect' && this.walletConnectProvider) {
        await this.walletConnectProvider.disconnect();
      }
      
      this.currentWallet = null;
      this.clearWalletInfo();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  getCurrentWallet(): WalletInfo | null {
    return this.currentWallet;
  }

  isConnected(): boolean {
    return this.currentWallet?.connected || false;
  }

  private saveWalletInfo(walletInfo: WalletInfo): void {
    localStorage.setItem('nutripal-wallet-info', JSON.stringify(walletInfo));
    localStorage.setItem('nutripal-wallet-connected', 'true');
  }

  private clearWalletInfo(): void {
    localStorage.removeItem('nutripal-wallet-info');
    localStorage.removeItem('nutripal-wallet-connected');
  }

  loadSavedWallet(): WalletInfo | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const savedWallet = localStorage.getItem('nutripal-wallet-info');
      const isConnected = localStorage.getItem('nutripal-wallet-connected') === 'true';
      
      if (savedWallet && isConnected) {
        const walletInfo = JSON.parse(savedWallet);
        this.currentWallet = walletInfo;
        return walletInfo;
      }
    } catch (error) {
      console.error('Failed to load saved wallet:', error);
    }
    return null;
  }
}

// Create a singleton instance
export const walletService = new WalletService();
