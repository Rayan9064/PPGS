import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { getAlgorandNetworkConfig } from './network-config';

// Get network configuration
const networkConfig = getAlgorandNetworkConfig();

// Initialize Pera Wallet Connect
export const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true,
  chainId: networkConfig.network === 'mainnet' ? 416001 : 416002 // MainNet: 416001, TestNet: 416002
});

// Algorand node configuration (dynamic based on environment)
export const algodClient = new algosdk.Algodv2(
  networkConfig.algodToken,
  networkConfig.algodServer,
  networkConfig.algodPort
);

// Indexer configuration (dynamic based on environment)
export const indexerClient = new algosdk.Indexer(
  networkConfig.indexerToken,
  networkConfig.indexerServer,
  networkConfig.indexerPort
);

// Wallet connection functions
export const connectWallet = async (): Promise<string[]> => {
  try {
    // Check if already connected
    if (peraWallet.isConnected) {
      const existingAccounts = peraWallet.connector?.accounts || [];
      if (existingAccounts.length > 0) {
        return existingAccounts;
      }
    }
    
    // Force disconnect any existing sessions first
    try {
      await peraWallet.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    
    // Connect with explicit options to prevent redirects
    const newAccounts = await peraWallet.connect();
    
    return newAccounts;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    await peraWallet.disconnect();
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
    throw error;
  }
};

// Reconnect to existing session
export const reconnectWallet = async (): Promise<string[]> => {
  try {
    if (peraWallet.isConnected) {
      const accounts = peraWallet.connector?.accounts || [];
      return accounts;
    }
    
    // Try to reconnect to existing session
    await peraWallet.reconnectSession();
    return peraWallet.connector?.accounts || [];
  } catch (error) {
    console.error('Failed to reconnect wallet:', error);
    return [];
  }
};

// Force disconnect and clear any stuck sessions
export const forceDisconnectWallet = async (): Promise<void> => {
  try {
    if (peraWallet.isConnected || peraWallet.connector) {
      await peraWallet.disconnect();
    }
    
    // Clear any stored connection data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('PeraWallet.Wallet');
      sessionStorage.removeItem('PeraWallet.Wallet');
    }
  } catch (error) {
    console.error('Failed to force disconnect wallet:', error);
  }
};

// Get connected accounts
export const getConnectedAccounts = (): string[] => {
  return peraWallet.connector?.accounts || [];
};

// Get account balance
export const getAccountBalance = async (address: string): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return Number(accountInfo.amount) / 1000000; // Convert microAlgos to Algos
  } catch (error) {
    console.error('Failed to get account balance:', error);
    throw error;
  }
};

// Get account information
export const getAccountInfo = async (address: string) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo;
  } catch (error) {
    console.error('Failed to get account info:', error);
    throw error;
  }
};

// Check if address is valid
export const isValidAddress = (address: string): boolean => {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};

// Format address for display (show first 6 and last 4 characters)
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get AlgorandClient instance for contract interactions
export const getAlgorandClient = async (): Promise<AlgorandClient> => {
  return AlgorandClient.fromConfig({
    algodConfig: {
      server: networkConfig.algodServer,
      port: networkConfig.algodPort,
      token: networkConfig.algodToken,
    },
    indexerConfig: {
      server: networkConfig.indexerServer,
      port: networkConfig.indexerPort,
      token: networkConfig.indexerToken,
    },
  });
};

// Ensure wallet is connected and return default sender
export const ensureWalletConnected = async (): Promise<string> => {
  if (!peraWallet.isConnected) {
    throw new Error('Wallet not connected');
  }
  
  const accounts = peraWallet.connector?.accounts || [];
  if (accounts.length === 0) {
    throw new Error('No accounts available');
  }
  
  return accounts[0];
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  return peraWallet.isConnected && (peraWallet.connector?.accounts?.length || 0) > 0;
};

// Nutrition-specific contract interaction interfaces
export interface NutritionData {
  productId: string;
  nutritionFacts: any;
  healthScore: number;
  timestamp: string;
  userAddress: string;
}

export interface AlgorandNutritionRecord {
  assetId?: string;
  transactionId: string;
  nutritionData: NutritionData;
  explorerUrl: string;
}

// Store nutrition data on Algorand (placeholder for future implementation)
export const storeNutritionData = async (
  account: string, 
  nutritionData: NutritionData
): Promise<AlgorandNutritionRecord> => {
  // This will be implemented later with smart contract integration
  throw new Error('Nutrition data storage not yet implemented');
};

// Retrieve nutrition history from Algorand (placeholder for future implementation)
export const getNutritionHistory = async (account: string): Promise<NutritionData[]> => {
  // This will be implemented later with smart contract integration
  throw new Error('Nutrition history retrieval not yet implemented');
};