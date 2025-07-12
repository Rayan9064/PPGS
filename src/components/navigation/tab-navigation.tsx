'use client';

import { useState } from 'react';
import { HomeIcon, QrCodeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, QrCodeIcon as QrCodeIconSolid, DocumentTextIcon as DocumentTextIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useTelegram } from '@/components/providers/telegram-provider';
import { HomeTab } from '@/components/navigation/tabs/home-tab';
import { ScanTab } from '@/components/navigation/tabs/scan-tab';
import { ResultsTab } from '@/components/navigation/tabs/results-tab';
import { ChatTab } from '@/components/navigation/tabs/chat-tab';
import { ProfileTab } from '@/components/navigation/tabs/profile-tab';
import { ProductData } from '@/types';

export type TabType = 'home' | 'scan' | 'results' | 'chat' | 'profile';

export const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const { hapticFeedback } = useTelegram();

  const handleTabChange = (tab: TabType) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const handleScanSuccess = (product: ProductData) => {
    setCurrentProduct(product);
    setScannedProducts(prev => [product, ...prev.slice(0, 9)]); // Keep last 10 scans
    setActiveTab('results');
    hapticFeedback.notification('success');
  };

  const handleStartScanning = () => {
    setActiveTab('scan');
    hapticFeedback.impact('light');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            onStartScanning={handleStartScanning}
            recentScans={scannedProducts.slice(0, 3)}
            onProductSelect={(product: ProductData) => {
              setCurrentProduct(product);
              setActiveTab('results');
            }}
          />
        );
      case 'scan':
        return (
          <ScanTab 
            onScanSuccess={handleScanSuccess}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'results':
        return (
          <ResultsTab 
            currentProduct={currentProduct}
            recentScans={scannedProducts}
            onScanAnother={handleStartScanning}
            onProductSelect={(product: ProductData) => setCurrentProduct(product)}
          />
        );
      case 'chat':
        return (
          <ChatTab 
            currentProduct={currentProduct}
            onScanProduct={handleStartScanning}
          />
        );
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab onStartScanning={handleStartScanning} recentScans={[]} onProductSelect={(_product: ProductData) => {}} />;
    }
  };

  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: 'scan' as TabType,
      label: 'Scan',
      icon: QrCodeIcon,
      activeIcon: QrCodeIconSolid,
    },
    {
      id: 'results' as TabType,
      label: 'Results',
      icon: DocumentTextIcon,
      activeIcon: DocumentTextIconSolid,
    },
    {
      id: 'chat' as TabType,
      label: 'AI Chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mobile-scroll">
        {renderActiveTab()}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-padding-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = isActive ? tab.activeIcon : tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium truncate">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
