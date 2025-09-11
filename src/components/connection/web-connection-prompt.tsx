'use client';

import { useUserData } from '@/components/providers/user-data-provider';
import { useWeb } from '@/components/providers/web-provider';
import {
    ArrowRightIcon,
    ExclamationTriangleIcon,
    LinkIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface WebConnectionPromptProps {
  onClose?: () => void;
  showDemoMode?: boolean;
}

export const WebConnectionPrompt = ({ onClose, showDemoMode = true }: WebConnectionPromptProps) => {
  const { connectionStatus, createUserAccount } = useUserData();
  const { webUser, isAvailable } = useWeb();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleCreateAccount = async () => {
    if (!webUser) return;
    
    setIsCreatingAccount(true);
    try {
      const success = await createUserAccount(webUser);
      if (success && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    if (onClose) {
      onClose();
    }
  };

  // Don't show if user is already connected and has data
  if (connectionStatus.isConnected && connectionStatus.hasUserData && !connectionStatus.needsOnboarding) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to NutriGrade</h2>
              <p className="text-blue-100 text-sm">Your personal nutrition scanner</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!connectionStatus.isConnected ? (
            // Not connected - show welcome message
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Get Started with NutriGrade
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Create your account to get personalized nutrition recommendations and save your preferences.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Features:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                  <li>• Scan product barcodes for nutrition info</li>
                  <li>• Get personalized health recommendations</li>
                  <li>• Track your nutrition history</li>
                  <li>• AI-powered nutrition chat</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 px-4 font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isCreatingAccount ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                {showDemoMode && (
                  <button
                    onClick={handleDemoMode}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-3 px-4 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Continue without account (Demo Mode)
                  </button>
                )}
              </div>
            </div>
          ) : connectionStatus.isConnected && !connectionStatus.hasUserData ? (
            // Connected but no user data
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Create Your NutriGrade Account
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Great! Let's create your personalized nutrition profile.
              </p>

              {webUser && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                  {webUser.photoUrl && (
                    <img
                      src={webUser.photoUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {webUser.firstName} {webUser.lastName}
                    </div>
                    {webUser.username && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{webUser.username}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 px-4 font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isCreatingAccount ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                {showDemoMode && (
                  <button
                    onClick={handleDemoMode}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-3 px-4 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Continue without account (Demo Mode)
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Connected with data but needs onboarding
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Complete Your Profile
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Let's set up your health profile to provide better nutrition recommendations.
              </p>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl py-3 px-4 font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Complete Setup
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-start gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-medium">Privacy First:</span> Your data is stored locally on your device. We never share your personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
