'use client';

import { ChatTab } from '@/components/navigation/tabs/chat-tab';
import { HomeTab } from '@/components/navigation/tabs/home-tab';
import { ProfileTab } from '@/components/navigation/tabs/profile-tab';
import { ResultsTab } from '@/components/navigation/tabs/results-tab';
import { ScanTab } from '@/components/navigation/tabs/scan-tab';
import { useWeb } from '@/components/providers/web-provider';
import { ProductData } from '@/types';
import { ChatBubbleLeftRightIcon, DocumentTextIcon, HomeIcon, QrCodeIcon, UserIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, DocumentTextIcon as DocumentTextIconSolid, HomeIcon as HomeIconSolid, QrCodeIcon as QrCodeIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type TabType = 'home' | 'scan' | 'results' | 'chat' | 'profile';

export const TabNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const { hapticFeedback } = useWeb();

  // Map paths to tab types
  const pathToTab: Record<string, TabType> = {
    '/welcome': 'home',
    '/home': 'home',
    '/chat': 'chat',
    '/scan': 'scan',
    '/result': 'results',
    '/profile': 'profile',
    '/': 'home', // Default to home
  };

  const [activeTab, setActiveTab] = useState<TabType>(pathToTab[pathname] || 'home');

  // Update active tab when pathname changes
  useEffect(() => {
    const newTab = pathToTab[pathname] || 'home';
    setActiveTab(newTab);
  }, [pathname]);

  // Load scan history from localStorage on mount
  useEffect(() => {
    const scanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
    const products = scanHistory.map((scan: any) => scan.product).slice(0, 10);
    setScannedProducts(products);
  }, []);

  const handleTabChange = (tab: TabType) => {
    hapticFeedback.selection();
    setActiveTab(tab);
    
    // Navigate to the corresponding URL
    const tabToPath: Record<TabType, string> = {
      'home': '/home',
      'chat': '/chat',
      'scan': '/scan',
      'results': '/result',
      'profile': '/profile',
    };
    
    router.push(tabToPath[tab]);
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
    router.push('/result');
    hapticFeedback.notification('success');
  };

  const handleStartScanning = () => {
    setActiveTab('scan');
    router.push('/scan');
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
              router.push('/result');
            }}
          />
        );
      case 'scan':
        return (
          <ScanTab
            onScanSuccess={handleScanSuccess}
            onBack={() => {
              setActiveTab('home');
              router.push('/home');
            }}
          />
        );
      case 'results':
        return (
          <ResultsTab 
            currentProduct={currentProduct}
            recentScans={scannedProducts}
            onScanAnother={handleStartScanning}
            onProductSelect={(product: ProductData) => {
              setCurrentProduct(product);
              router.push('/result');
            }}
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
      id: 'chat' as TabType,
      label: 'AI Chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
    },
    {
      id: 'scan' as TabType,
      label: 'Scan',
      icon: QrCodeIcon,
      activeIcon: QrCodeIconSolid,
      isHighlighted: true, // Special styling for the middle scan button
    },
    {
      id: 'results' as TabType,
      label: 'Results',
      icon: DocumentTextIcon,
      activeIcon: DocumentTextIconSolid,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-gray-900 no-horizontal-scroll">
      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto mobile-scroll pb-16 sm:pb-20 bg-white" style={{backgroundColor: 'white', minHeight: 'calc(100vh - 80px)'}}>
        {renderActiveTab()}
      </div>

      {/* Bottom Tab Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 bottom-nav-safe-area shadow-lg" style={{backgroundColor: 'white'}}>
        <div className="flex justify-around items-center w-full px-2 sm:px-4 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = isActive ? tab.activeIcon : tab.icon;
            const isScanButton = tab.id === 'scan';
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 relative ${
                  isScanButton
                    ? isActive
                      ? 'text-white bg-red-500 shadow-lg'
                      : 'text-white bg-red-500 shadow-md'
                    : isActive 
                      ? 'text-red-500' 
                      : 'text-gray-600'
                }`}
              >
                <IconComponent className={`${isScanButton ? 'w-7 h-7' : 'w-6 h-6'} mb-1`} />
                <span className={`text-xs font-medium truncate max-w-full ${isScanButton ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
                {isScanButton && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
