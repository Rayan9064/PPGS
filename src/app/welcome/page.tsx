'use client';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useUserData } from '@/components/providers/user-data-provider';
import { useState } from 'react';

export default function WelcomePage() {
  const { connectionStatus, onboardingState } = useUserData();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Show onboarding if connected, has data, but needs onboarding
  const shouldShowOnboarding = connectionStatus.isConnected && 
    connectionStatus.hasUserData && 
    connectionStatus.needsOnboarding && 
    !onboardingState.isCompleted;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect to home after onboarding
    window.location.href = '/home';
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // Redirect to home after skipping
    window.location.href = '/home';
  };

  return (
    <>
      {/* Show onboarding */}
      {(shouldShowOnboarding || showOnboarding) && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
}
