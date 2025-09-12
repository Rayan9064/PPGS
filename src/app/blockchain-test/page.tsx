'use client';

import { WalletConnect, AccountInfo } from '@/components/blockchain';
import { useWallet } from '@/hooks/useWallet';
import { getNetworkDisplayName, isBlockchainEnabled } from '@/lib/network-config';
import React from 'react';

export default function BlockchainTestPage() {
  const { accounts, isConnected, balance, loading } = useWallet();

  if (!isBlockchainEnabled()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Features Disabled</h2>
          <p className="text-gray-600">
            Blockchain features are currently disabled. Enable them in environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">NutriGrade Blockchain Integration</h1>
          <p className="text-gray-600">
            Test the Pera wallet integration with Algorand {getNetworkDisplayName()}
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? 'Loading...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium text-gray-900">{getNetworkDisplayName()}</span>
            </div>
            {isConnected && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-mono text-gray-900">{accounts[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium text-gray-900">{balance.toFixed(6)} ALGO</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Wallet Connect Component */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection</h2>
          <WalletConnect />
        </div>

        {/* Account Information Component */}
        {isConnected && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <AccountInfo />
          </div>
        )}

        {/* Future Features */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Future Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Nutrition Data Storage</h3>
              <p className="text-sm text-gray-600">
                Store scanned product nutrition data on Algorand blockchain for immutable health records
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Health NFTs</h3>
              <p className="text-sm text-gray-600">
                Mint NFTs representing health milestones and nutrition achievements
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Smart Contracts</h3>
              <p className="text-sm text-gray-600">
                Automated health goal tracking and rewards through smart contracts
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Data Ownership</h3>
              <p className="text-sm text-gray-600">
                Full user control over personal health data with blockchain verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}