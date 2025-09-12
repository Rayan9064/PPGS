'use client';

import {
  connectWallet,
  disconnectWallet,
  forceDisconnectWallet,
  getAccountBalance,
  getConnectedAccounts,
  isWalletConnected,
  peraWallet,
  reconnectWallet
} from '@/lib/algorand';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface WalletContextType {
  accounts: string[];
  isConnected: boolean;
  balance: number;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  forceDisconnect: () => Promise<void>;
  refetchBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async (address: string) => {
    try {
      const accountBalance = await getAccountBalance(address);
      setBalance(accountBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    }
  };

  const refetchBalance = async () => {
    if (accounts.length > 0) {
      await fetchBalance(accounts[0]);
    }
  };

  const connect = async () => {
    try {
      setLoading(true);
      
      // Check if already connected first
      if (isWalletConnected()) {
        const existingAccounts = getConnectedAccounts();
        if (existingAccounts.length > 0) {
          setAccounts(existingAccounts);
          setIsConnected(true);
          await fetchBalance(existingAccounts[0]);
          return;
        }
      }
      
      const newAccounts = await connectWallet();
      setAccounts(newAccounts);
      setIsConnected(true);
      
      if (newAccounts.length > 0) {
        await fetchBalance(newAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      await disconnectWallet();
      setAccounts([]);
      setIsConnected(false);
      setBalance(0);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceDisconnect = async () => {
    try {
      setLoading(true);
      await forceDisconnectWallet();
      setAccounts([]);
      setIsConnected(false);
      setBalance(0);
    } catch (error) {
      console.error('Failed to force disconnect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to reconnect to existing session first
        const reconnectedAccounts = await reconnectWallet();
        if (reconnectedAccounts.length > 0) {
          setAccounts(reconnectedAccounts);
          setIsConnected(true);
          await fetchBalance(reconnectedAccounts[0]);
        } else if (isWalletConnected()) {
          const connectedAccounts = getConnectedAccounts();
          if (connectedAccounts.length > 0) {
            setAccounts(connectedAccounts);
            setIsConnected(true);
            await fetchBalance(connectedAccounts[0]);
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for account changes
    peraWallet.connector?.on('disconnect', () => {
      setAccounts([]);
      setIsConnected(false);
      setBalance(0);
    });

    return () => {
      peraWallet.connector?.off('disconnect');
    };
  }, []);

  const value: WalletContextType = {
    accounts,
    isConnected,
    balance,
    loading,
    connect,
    disconnect,
    forceDisconnect,
    refetchBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};