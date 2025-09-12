'use client';

import { useWallet } from '@/hooks/useWallet';
import { formatAddress, getAccountInfo } from '@/lib/algorand';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AccountInfoProps {
  className?: string;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ className }) => {
  const { accounts, isConnected, balance, refetchBalance } = useWallet();
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAccountInfo = async () => {
    if (!isConnected || !accounts[0]) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const info = await getAccountInfo(accounts[0]);
      setAccountInfo(info);
      toast.success('Account information updated');
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      toast.error('Failed to fetch account information');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([refetchBalance(), fetchAccountInfo()]);
  };

  if (!isConnected) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Wallet Required</h3>
          <p className="text-gray-600">
            Connect your Algorand wallet to view account information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Algorand Account</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAccountInfo}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              <Info className="mr-1 h-4 w-4" />
              {loading ? 'Loading...' : 'Fetch Info'}
            </button>
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={clsx('mr-1 h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {accountInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-mono text-gray-900">{formatAddress(accounts[0])}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="text-gray-900">{(Number(accountInfo.amount) / 1000000).toFixed(6)} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Balance:</span>
                  <span className="text-gray-900">{(Number(accountInfo['min-balance']) / 1000000).toFixed(6)} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Round:</span>
                  <span className="text-gray-900">{accountInfo.round}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Account Stats</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assets:</span>
                  <span className="text-gray-900">{accountInfo.assets?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created Assets:</span>
                  <span className="text-gray-900">{accountInfo['created-assets']?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Apps Opted In:</span>
                  <span className="text-gray-900">{accountInfo['apps-local-state']?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created Apps:</span>
                  <span className="text-gray-900">{accountInfo['created-apps']?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
              TestNet
            </div>
            <span className="text-sm text-gray-600">
              Connected to Algorand TestNet for development
            </span>
          </div>
          <p className="text-xs text-gray-500">
            This shows basic wallet integration with Algorand. Nutrition data storage capabilities will be added with smart contract integration.
          </p>
        </div>
      </div>
    </div>
  );
};