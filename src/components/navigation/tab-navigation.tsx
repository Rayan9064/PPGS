'use client';

import { ChatTab } from '@/components/navigation/tabs/chat-tab';
import { HomeTab } from '@/components/navigation/tabs/home-tab';
import { ProfileTab } from '@/components/navigation/tabs/profile-tab';
import { ResultsTab } from '@/components/navigation/tabs/results-tab';
import { ScanTab } from '@/components/navigation/tabs/scan-tab';
import { useTelegram } from '@/components/providers/telegram-provider';
import { ProductData } from '@/types';
import { ChatBubbleLeftRightIcon, DocumentTextIcon, HomeIcon, QrCodeIcon, UserIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, DocumentTextIcon as DocumentTextIconSolid, HomeIcon as HomeIconSolid, QrCodeIcon as QrCodeIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export type TabType = 'home' | 'scan' | 'results' | 'chat' | 'profile';

export const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const { hapticFeedback } = useTelegram();

  // Load scan history from localStorage on mount
  useEffect(() => {
    const scanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
    const products = scanHistory.map((scan: any) => scan.product).slice(0, 10);
    setScannedProducts(products);
  }, []);

  const handleTabChange = (tab: TabType) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const handleScanSuccess = (product: ProductData) => {
    setCurrentProduct(product);
    setScannedProducts(prev => [product, ...prev.slice(0, 9)]); // Keep last 10 scans
    
    // Store scan results in localStorage
    const scanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
    const newScan = {
      id: Date.now().toString(),
      product,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newScan, ...scanHistory.slice(0, 49)]; // Keep last 50 scans
    localStorage.setItem('nutripal-scan-history', JSON.stringify(updatedHistory));
    
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
    <div className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 no-horizontal-scroll">
      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto mobile-scroll pb-16 sm:pb-20">
        {renderActiveTab()}
      </div>

      {/* Bottom Tab Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 bottom-nav-safe-area shadow-lg">
        <div className="flex justify-around items-center w-full px-2 sm:px-4 py-1 sm:py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = isActive ? tab.activeIcon : tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1" />
                <span className="text-xs font-medium truncate max-w-full">
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
