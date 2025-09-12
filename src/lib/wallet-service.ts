import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { getAlgorandNetworkConfig } from './network-config';

// Get network configuration
const networkConfig = getAlgorandNetworkConfig();

export interface WalletInfo {
  address: string;
  name: string;
  type: 'pera' | 'lute' | 'defly' | 'exodus';
  connected: boolean;
  accounts?: string[];
}

export class WalletService {
  private peraWallet: PeraWalletConnect | null = null;
  private currentWallet: WalletInfo | null = null;

  constructor() {
    this.initializeWallets();
  }

  private initializeWallets() {
    this.initializePeraWallet();
  }

  private initializePeraWallet() {
    try {
      this.peraWallet = new PeraWalletConnect({
        shouldShowSignTxnToast: true,
        chainId: networkConfig.network === 'mainnet' ? 416001 : 416002
      });
    } catch (error) {
      console.error('Failed to initialize Pera Wallet:', error);
    }
  }

  async connectWallet(walletType: 'pera' | 'lute' | 'defly' | 'exodus'): Promise<WalletInfo | null> {
    try {
      // For now, only Pera wallet is fully implemented
      if (walletType === 'pera' && this.peraWallet) {
        return await this.connectPeraWallet();
      }

      // Other wallets will be added later
      throw new Error(`${walletType} wallet support coming soon!`);
    } catch (error) {
      console.error(`Failed to connect ${walletType} wallet:`, error);
      throw error;
    }
  }

  private async connectPeraWallet(): Promise<WalletInfo | null> {
    if (!this.peraWallet) {
      throw new Error('Pera Wallet not initialized');
    }

    // Force disconnect any existing sessions first
    try {
      await this.peraWallet.disconnect();
    } catch {
      // Ignore disconnect errors
    }

    const accounts = await this.peraWallet.connect();
    
    if (accounts && accounts.length > 0) {
      const walletInfo: WalletInfo = {
        address: accounts[0],
        name: 'Pera Wallet',
        type: 'pera',
        connected: true,
        accounts
      };
      
      this.currentWallet = walletInfo;
      this.saveWalletInfo(walletInfo);
      return walletInfo;
    }
    
    return null;
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (this.currentWallet?.type === 'pera' && this.peraWallet) {
        await this.peraWallet.disconnect();
      }

      this.currentWallet = null;
      this.clearWalletInfo();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async forceDisconnectAll(): Promise<void> {
    try {
      // Disconnect Pera
      if (this.peraWallet) {
        try {
          await this.peraWallet.disconnect();
        } catch {
          // Ignore errors
        }
      }

      // Clear stored data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('PeraWallet.Wallet');
        localStorage.removeItem('wallet-service-info');
        sessionStorage.removeItem('PeraWallet.Wallet');
      }

      this.currentWallet = null;
    } catch (error) {
      console.error('Failed to force disconnect wallets:', error);
    }
  }

  getCurrentWallet(): WalletInfo | null {
    return this.currentWallet;
  }

  isWalletConnected(): boolean {
    return this.currentWallet !== null && this.currentWallet.connected;
  }

  getConnectedAccounts(): string[] {
    return this.currentWallet?.accounts || [];
  }

  getDefaultAccount(): string | null {
    const accounts = this.getConnectedAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  async reconnectWallet(): Promise<string[]> {
    try {
      // Try to load saved wallet info
      const savedWallet = this.loadWalletInfo();
      if (savedWallet) {
        this.currentWallet = savedWallet;
        return savedWallet.accounts || [savedWallet.address];
      }

      // Try Pera wallet reconnection
      if (this.peraWallet?.isConnected) {
        const accounts = this.peraWallet.connector?.accounts || [];
        if (accounts.length > 0) {
          const walletInfo: WalletInfo = {
            address: accounts[0],
            name: 'Pera Wallet',
            type: 'pera',
            connected: true,
            accounts
          };
          this.currentWallet = walletInfo;
          return accounts;
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
      return [];
    }
  }

  // Sign transaction with current wallet
  async signTransaction(txn: algosdk.Transaction, account?: string): Promise<Uint8Array> {
    const defaultAccount = account || this.getDefaultAccount();
    
    if (!defaultAccount) {
      throw new Error('No account available for signing');
    }

    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (this.currentWallet.type === 'pera' && this.peraWallet) {
      // For now, throw an error indicating this needs to be implemented properly
      throw new Error('Transaction signing implementation needs to be updated for new Pera wallet version');
    }

    throw new Error('Unsupported wallet type for signing');
  }

  private saveWalletInfo(walletInfo: WalletInfo): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet-service-info', JSON.stringify(walletInfo));
      }
    } catch (error) {
      console.error('Failed to save wallet info:', error);
    }
  }

  private loadWalletInfo(): WalletInfo | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wallet-service-info');
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to load wallet info:', error);
      return null;
    }
  }

  private clearWalletInfo(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-service-info');
      }
    } catch (error) {
      console.error('Failed to clear wallet info:', error);
    }
  }
}

// Export singleton instance
export const walletService = new WalletService();

// Utility functions for backward compatibility
export const connectWallet = (walletType: 'pera' | 'lute' | 'defly' | 'exodus' = 'pera') => 
  walletService.connectWallet(walletType);

export const disconnectWallet = () => 
  walletService.disconnectWallet();

export const getConnectedAccounts = () => 
  walletService.getConnectedAccounts();

export const isWalletConnected = () => 
  walletService.isWalletConnected();

export const ensureWalletConnected = async (): Promise<string> => {
  if (!walletService.isWalletConnected()) {
    throw new Error('Wallet not connected');
  }
  
  const defaultAccount = walletService.getDefaultAccount();
  if (!defaultAccount) {
    throw new Error('No accounts available');
  }
  
  return defaultAccount;
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};