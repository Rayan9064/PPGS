'use client';

import { UserDataService } from '@/lib/user-data';
import { contractService, getUserBlockchainStats, getGlobalBlockchainStats, optIntoContract, optOutOfContract } from '@/lib/contract-service';
import { getContractAppId } from '@/config/contract-config';
import type { UserStats, ContractStats } from '@/lib/contract-service';
import { OnboardingState, UserConnectionStatus, UserData } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useWeb } from './web-provider';

interface UserDataContextType {
  userData: UserData | null;
  onboardingState: OnboardingState;
  connectionStatus: UserConnectionStatus;
  isLoading: boolean;
  error: string | null;
  
  // User data methods
  updateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  createUserAccount: (user: any) => Promise<boolean>;
  deleteUserData: () => void;
  
  // Onboarding methods
  updateOnboardingStep: (step: OnboardingState['currentStep']) => void;
  updateOnboardingProgress: (progress: number) => void;
  completeOnboarding: () => void;
  
  // Blockchain integration
  blockchainStats: {
    userStats: UserStats | null;
    globalStats: ContractStats | null;
    isOptedIn: boolean;
    isLoading: boolean;
    error: string | null;
  };
  
  // Blockchain methods
  initializeBlockchain: () => Promise<boolean>;
  optInToContract: () => Promise<boolean>;
  optOutOfContract: () => Promise<boolean>;
  refreshBlockchainStats: () => Promise<void>;
  
  // Utility methods
  getBMI: () => number | null;
  getBMICategory: () => string | null;
  getDailyCalories: (gender?: 'male' | 'female') => number | null;
  hasPersonalizedLimits: () => boolean;
  getPersonalizedLimits: () => { sugar: number; fat: number; salt: number } | null;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { webUser, isAvailable } = useWeb();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    currentStep: 'welcome',
    progress: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState<UserConnectionStatus>({
    isConnected: false,
    isTelegramUser: false,
    hasUserData: false,
    needsOnboarding: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Blockchain state
  const [blockchainStats, setBlockchainStats] = useState({
    userStats: null as UserStats | null,
    globalStats: null as ContractStats | null,
    isOptedIn: false,
    isLoading: false,
    error: null as string | null,
  });

  // Initialize user data on mount and when web user changes
  useEffect(() => {
    const initializeUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get connection status
        const status = UserDataService.getUserConnectionStatus(webUser);
        setConnectionStatus(status);

        // Get onboarding state
        const onboarding = UserDataService.getOnboardingState();
        setOnboardingState(onboarding);

        // Get user data if available
        if (status.isConnected && webUser) {
          const data = UserDataService.getUserData(webUser.id);
          setUserData(data);

          // Auto-create basic user data if connected but no data exists
          if (!data) {
            const newUserData = UserDataService.createUserData(webUser);
            const saved = UserDataService.saveUserData(newUserData);
            if (saved) {
              setUserData(newUserData);
              // Update connection status
              setConnectionStatus(prev => ({ ...prev, hasUserData: true }));
            }
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error('Error initializing user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, [webUser, isAvailable]);

  const updateUserData = async (updates: Partial<UserData>): Promise<boolean> => {
    if (!webUser || !userData) {
      setError('User not connected');
      return false;
    }

    try {
      // Validate updates
      const validation = UserDataService.validateUserData({ ...userData, ...updates });
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return false;
      }

      const success = UserDataService.updateUserData(webUser.id, updates);
      if (success) {
        const updatedData = UserDataService.getUserData(webUser.id);
        setUserData(updatedData);
        setError(null);
        return true;
      } else {
        setError('Failed to update user data');
        return false;
      }
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data');
      return false;
    }
  };

  const createUserAccount = async (user: any): Promise<boolean> => {
    try {
      const newUserData = UserDataService.createUserData(user);
      const saved = UserDataService.saveUserData(newUserData);
      
      if (saved) {
        setUserData(newUserData);
        setConnectionStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          isTelegramUser: false, 
          hasUserData: true,
          needsOnboarding: true 
        }));
        setError(null);
        return true;
      } else {
        setError('Failed to create user account');
        return false;
      }
    } catch (err) {
      console.error('Error creating user account:', err);
      setError('Failed to create user account');
      return false;
    }
  };

  const deleteUserData = () => {
    UserDataService.deleteUserData();
    setUserData(null);
    setOnboardingState({
      isCompleted: false,
      currentStep: 'welcome',
      progress: 0,
    });
    setConnectionStatus({
      isConnected: false,
      isTelegramUser: false,
      hasUserData: false,
      needsOnboarding: false,
    });
    setError(null);
  };

  const updateOnboardingStep = (step: OnboardingState['currentStep']) => {
    const stepProgress = {
      welcome: 0,
      basic_info: 20,
      health_info: 40,
      dietary_preferences: 60,
      goals: 80,
      completed: 100,
    };

    const newState: OnboardingState = {
      isCompleted: step === 'completed',
      currentStep: step,
      progress: stepProgress[step],
    };

    UserDataService.saveOnboardingState(newState);
    setOnboardingState(newState);
  };

  const updateOnboardingProgress = (progress: number) => {
    const newState: OnboardingState = {
      ...onboardingState,
      progress: Math.max(0, Math.min(100, progress)),
    };

    UserDataService.saveOnboardingState(newState);
    setOnboardingState(newState);
  };

  const completeOnboarding = () => {
    UserDataService.completeOnboarding();
    setOnboardingState({
      isCompleted: true,
      currentStep: 'completed',
      progress: 100,
    });
    setConnectionStatus(prev => ({ ...prev, needsOnboarding: false }));
  };

  const getBMI = (): number | null => {
    if (!userData) return null;
    return UserDataService.calculateBMI(userData);
  };

  const getBMICategory = (): string | null => {
    const bmi = getBMI();
    if (!bmi) return null;
    return UserDataService.getBMICategory(bmi);
  };

  const getDailyCalories = (gender: 'male' | 'female' = 'male'): number | null => {
    if (!userData) return null;
    return UserDataService.calculateDailyCalories(userData, gender);
  };

  const hasPersonalizedLimits = (): boolean => {
    return !!(userData?.preferences?.maxSugar || userData?.preferences?.maxFat || userData?.preferences?.maxSalt);
  };

  const getPersonalizedLimits = (): { sugar: number; fat: number; salt: number } | null => {
    if (!userData?.preferences) return null;

    return {
      sugar: userData.preferences.maxSugar || 22.5,
      fat: userData.preferences.maxFat || 17.5,
      salt: userData.preferences.maxSalt || 1.5,
    };
  };

  // Blockchain methods
  const initializeBlockchain = async (): Promise<boolean> => {
    setBlockchainStats(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const appId = getContractAppId();
      const success = await contractService.initialize(appId);
      
      if (success) {
        await refreshBlockchainStats();
        return true;
      }
      
      setBlockchainStats(prev => ({ ...prev, error: 'Failed to initialize contract', isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Blockchain initialization failed';
      setBlockchainStats(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  };

  const optInToContract = async (): Promise<boolean> => {
    setBlockchainStats(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await optIntoContract();
      setBlockchainStats(prev => ({ ...prev, isOptedIn: true }));
      await refreshBlockchainStats();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Opt-in failed';
      setBlockchainStats(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  };

  const optOutOfContract = async (): Promise<boolean> => {
    setBlockchainStats(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await optOutOfContract();
      setBlockchainStats(prev => ({ 
        ...prev, 
        isOptedIn: false, 
        userStats: null,
        isLoading: false 
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Opt-out failed';
      setBlockchainStats(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  };

  const refreshBlockchainStats = async (): Promise<void> => {
    if (!contractService.isInitialized()) return;
    
    setBlockchainStats(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Check if user is opted in and get user stats
      let userStats = null;
      let isOptedIn = false;
      
      try {
        userStats = await getUserBlockchainStats();
        isOptedIn = true;
      } catch (error) {
        // User not opted in or no stats available
        isOptedIn = false;
      }
      
      // Get global stats
      const globalStats = await getGlobalBlockchainStats();
      
      setBlockchainStats(prev => ({
        ...prev,
        userStats,
        globalStats,
        isOptedIn,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blockchain stats';
      setBlockchainStats(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  // Initialize blockchain when wallet is connected
  useEffect(() => {
    if (connectionStatus.isConnected && webUser && contractService.isInitialized()) {
      refreshBlockchainStats();
    }
  }, [connectionStatus.isConnected, webUser]);

  const contextValue: UserDataContextType = {
    userData,
    onboardingState,
    connectionStatus,
    isLoading,
    error,
    updateUserData,
    createUserAccount,
    deleteUserData,
    updateOnboardingStep,
    updateOnboardingProgress,
    completeOnboarding,
    blockchainStats,
    initializeBlockchain,
    optInToContract,
    optOutOfContract,
    refreshBlockchainStats,
    getBMI,
    getBMICategory,
    getDailyCalories,
    hasPersonalizedLimits,
    getPersonalizedLimits,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
