'use client';

import { WebConnectionPrompt } from '@/components/connection/web-connection-prompt';
import { TabNavigation } from '@/components/navigation/tab-navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useUserData } from '@/components/providers/user-data-provider';
import { useState } from 'react';

export default function Home() {
  const { connectionStatus, onboardingState } = useUserData();
  const [showConnectionPrompt, setShowConnectionPrompt] = useState(false); // Start with false to skip connection prompt
  const [showOnboarding, setShowOnboarding] = useState(false); // Start with false to show main app

  // Show connection prompt if not connected or missing data
  const shouldShowConnectionPrompt = (!connectionStatus.isConnected || 
    (connectionStatus.isConnected && !connectionStatus.hasUserData)) && showConnectionPrompt;

  // Show onboarding if connected, has data, but needs onboarding
  const shouldShowOnboarding = connectionStatus.isConnected && 
    connectionStatus.hasUserData && 
    connectionStatus.needsOnboarding && 
    !onboardingState.isCompleted;

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
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <TabNavigation />
      
      {/* Show connection prompt automatically on first load if needed */}
      {shouldShowConnectionPrompt && !showOnboarding && (
        <WebConnectionPrompt 
          onClose={handleConnectionPromptClose}
          showDemoMode={true}
        />
      )}
      
      {/* Show onboarding if needed */}
      {(shouldShowOnboarding || showOnboarding) && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
}
