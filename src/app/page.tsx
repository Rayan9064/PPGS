'use client';

import { useState } from 'react';
import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductResult } from '@/components/product/product-result';
import { WelcomeScreen } from '@/components/welcome/welcome-screen';
import { ProductData } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'welcome' | 'scanner' | 'result'>('welcome');
  const [productData, setProductData] = useState<ProductData | null>(null);

  const handleScanSuccess = (data: ProductData) => {
    setProductData(data);
    setCurrentView('result');
  };

  const handleStartScanning = () => {
    setCurrentView('scanner');
  };

  const handleBackToHome = () => {
    setCurrentView('welcome');
    setProductData(null);
  };

  const handleScanAnother = () => {
    setCurrentView('scanner');
    setProductData(null);
  };

  return (
    <>
      {currentView === 'welcome' && (
        <WelcomeScreen onStartScanning={handleStartScanning} />
      )}
      
      {currentView === 'scanner' && (
        <ScannerComponent 
          onScanSuccess={handleScanSuccess}
          onBack={handleBackToHome}
        />
      )}
      
      {currentView === 'result' && productData && (
        <ProductResult 
          product={productData}
          onScanAnother={handleScanAnother}
          onBack={handleBackToHome}
        />
      )}
    </>
  );
}
