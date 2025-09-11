'use client';

import { WebConnectionPrompt } from '@/components/connection/web-connection-prompt';
import { TabNavigation } from '@/components/navigation/tab-navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useUserData } from '@/components/providers/user-data-provider';
import { useState } from 'react';

export default function Home() {
  const { connectionStatus, onboardingState } = useUserData();
  const [showConnectionPrompt, setShowConnectionPrompt] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show connection prompt if not connected or missing data
  const shouldShowConnectionPrompt = !connectionStatus.isConnected || 
    (connectionStatus.isConnected && !connectionStatus.hasUserData);

  // Show onboarding if connected, has data, but needs onboarding
  const shouldShowOnboarding = connectionStatus.isConnected && 
    connectionStatus.hasUserData && 
    connectionStatus.needsOnboarding && 
    !onboardingState.isCompleted;

  const handleConnectionPromptClose = () => {
    setShowConnectionPrompt(false);
    if (shouldShowOnboarding) {
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
      {(shouldShowConnectionPrompt || showConnectionPrompt) && !showOnboarding && (
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
