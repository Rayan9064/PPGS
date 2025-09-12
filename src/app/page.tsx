'use client';

import { WebConnectionPrompt } from '@/components/connection/web-connection-prompt';
import { TabNavigation } from '@/components/navigation/tab-navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useUserData } from '@/components/providers/user-data-provider';
import { useState, useEffect } from 'react';

export default function Home() {
  const { connectionStatus, onboardingState } = useUserData();
  const [showConnectionPrompt, setShowConnectionPrompt] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check wallet connection status from localStorage after component mounts
  useEffect(() => {
    const walletStatus = localStorage.getItem('nutripal-wallet-connected') === 'true';
    setIsWalletConnected(walletStatus);
    setIsLoading(false);
  }, []);

  // Show onboarding if wallet is not connected
  const shouldShowOnboarding = !isWalletConnected && !isLoading;

  // Show main app if wallet is connected
  const shouldShowMainApp = isWalletConnected && !isLoading;

  const handleConnectionPromptClose = () => {
    console.log('Connection prompt close called');
    setShowConnectionPrompt(false);
    // Check if user is in demo mode
    const isDemoMode = localStorage.getItem('nutripal-demo-mode') === 'true';
    console.log('Demo mode:', isDemoMode);
    if (isDemoMode) {
      // In demo mode, don't show onboarding
      console.log('In demo mode, skipping onboarding');
      return;
    }
    if (shouldShowOnboarding) {
      console.log('Showing onboarding');
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    // Set wallet as connected when onboarding is completed
    localStorage.setItem('nutripal-wallet-connected', 'true');
    setShowOnboarding(false);
    // Reload the page to show the main app
    window.location.reload();
  };


  // Show loading state while checking wallet status
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show main app if wallet is connected */}
      {shouldShowMainApp && <TabNavigation />}
      
      {/* Show onboarding if wallet is not connected */}
      {shouldShowOnboarding && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}
