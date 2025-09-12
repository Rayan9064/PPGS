'use client';

import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/algorand';
import { clsx } from 'clsx';
import { Copy, LogOut, RefreshCw, Wallet } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
  className?: string;
  showBalance?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  variant = 'default',
  className = '',
  showBalance = true
}) => {
  const { accounts, isConnected, balance, loading, connect, disconnect, forceDisconnect, refetchBalance } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Connection error:', error);
      
      // If it's a "Session currently connected" error, offer to force disconnect
      if (error.message?.includes('Session currently connected')) {
        toast.error('Wallet session exists. Try force disconnect first.', {
          duration: 5000,
        });
      } else {
        toast.error(error.message || 'Failed to connect wallet. Please try again.');
      }
    }
  };

  const copyAddress = () => {
    if (accounts[0]) {
      navigator.clipboard.writeText(accounts[0]);
      toast.success('Address copied to clipboard');
    }
  };

  const handleRefresh = async () => {
    await refetchBalance();
    toast.success('Balance updated');
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleForceDisconnect = async () => {
    try {
      await forceDisconnect();
      toast.success('Wallet force disconnected');
    } catch (error: any) {
      toast.error('Failed to force disconnect wallet');
    }
  };

  if (loading) {
    return (
      <button 
        disabled 
        className={clsx(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
          'bg-gray-100 text-gray-400 cursor-not-allowed',
          className
        )}
      >
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button 
        onClick={handleConnect} 
        disabled={loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
          'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          className
        )}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Pera Wallet
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={clsx('relative', className)}>
        <button className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          <Wallet className="mr-2 h-4 w-4 text-green-600" />
          {formatAddress(accounts[0])}
        </button>
        
        {/* This would be expanded with a dropdown menu for full functionality */}
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-900">Connected Wallet</h3>
            <p className="text-xs text-gray-500">{formatAddress(accounts[0])}</p>
          </div>
        </div>
        {showBalance && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {balance.toFixed(2)} ALGO
            </div>
            <div className="text-xs text-gray-500">TestNet Balance</div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={copyAddress}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Copy className="mr-1 h-3 w-3" />
          Copy
        </button>
        <button
          onClick={handleRefresh}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh
        </button>
        <button
          onClick={handleDisconnect}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          <LogOut className="mr-1 h-3 w-3" />
          Disconnect
        </button>
      </div>
      
      {/* Debug option for development */}
      <button
        onClick={handleForceDisconnect}
        className="w-full text-xs text-orange-600 hover:text-orange-700 py-1"
      >
        Force Disconnect (Debug)
      </button>
    </div>
  );
};