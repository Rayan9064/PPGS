'use client';

import { useState } from 'react';
import { walletService, WalletInfo } from '@/lib/wallet-service';
import { CheckIcon, XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WalletSelectorProps {
  onWalletConnected?: (walletInfo: WalletInfo) => void;
  onClose?: () => void;
}

export const WalletSelector = ({ onWalletConnected, onClose }: WalletSelectorProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(
    walletService.getCurrentWallet()
  );

  const wallets = [
    {
      id: 'pera' as const,
      name: 'Pera Wallet',
      description: 'Mobile-first Algorand wallet',
      icon: '📱',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'lute' as const,
      name: 'Lute Wallet',
      description: 'Desktop browser extension',
      icon: '🌐',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'defly' as const,
      name: 'Defly Wallet',
      description: 'Multi-platform wallet',
      icon: '🦋',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'exodus' as const,
      name: 'Exodus Wallet',
      description: 'Multi-currency wallet',
      icon: '🚀',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleConnectWallet = async (walletType: 'pera' | 'lute' | 'defly' | 'exodus') => {
    setConnecting(walletType);
    
    try {
      const walletInfo = await walletService.connectWallet(walletType);
      
      if (walletInfo) {
        setConnectedWallet(walletInfo);
        toast.success(`${walletInfo.name} connected successfully!`);
        onWalletConnected?.(walletInfo);
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error);
      toast.error(`Failed to connect ${walletType}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
      setConnectedWallet(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Connect Wallet</h2>
                <p className="text-sm text-gray-600">Choose your preferred wallet</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Connected Wallet */}
          {connectedWallet && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">{connectedWallet.name}</p>
                    <p className="text-sm text-green-600">
                      {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                disabled={connecting === wallet.id || !!connectedWallet}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                  connectedWallet?.type === wallet.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${wallet.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {connecting === wallet.id ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      wallet.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                    <p className="text-sm text-gray-600">{wallet.description}</p>
                  </div>
                  {connectedWallet?.type === wallet.id && (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-sm text-blue-800">
              💡 <strong>Why connect a wallet?</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
              <li>• Store scan history on blockchain</li>
              <li>• Contribute to nutrition database</li>
              <li>• Earn rewards for participation</li>
              <li>• Access premium features</li>
            </ul>
          </div>

          {/* Optional note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You can use NutriGrade without a wallet, but blockchain features won't be available.
          </p>
        </div>
      </div>
    </div>
  );
};