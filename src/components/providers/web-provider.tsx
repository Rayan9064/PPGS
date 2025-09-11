'use client';

import { createContext, useContext, ReactNode } from 'react';

interface WebContextType {
  // Mock user for web app
  webUser: {
    id: string;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  } | null;
  // Mock functions that don't do anything in web context
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  hapticFeedback: {
    impact: (style?: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  closeApp: () => void;
  getThemeParams: () => any;
  isAvailable: boolean;
}

const WebContext = createContext<WebContextType | null>(null);

export const WebProvider = ({ children }: { children: ReactNode }) => {
  // Create a mock user for web app
  const webUser = {
    id: 'web-user-123',
    firstName: 'Web',
    lastName: 'User',
    username: 'webuser',
    photoUrl: undefined,
  };

  const showMainButton = (text: string, onClick: () => void) => {
    // In web context, we could show a floating action button or similar
    console.log('Main button would show:', text);
  };

  const hideMainButton = () => {
    console.log('Main button would hide');
  };

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      // In web context, we could use browser vibration API if available
      if (navigator.vibrate) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };
        navigator.vibrate(patterns[style]);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      // In web context, we could show browser notifications or use other feedback
      console.log('Notification:', type);
    },
    selection: () => {
      // Light haptic feedback for selection
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    },
  };

  const closeApp = () => {
    // In web context, we could close the tab or show a message
    if (window.confirm('Are you sure you want to close the app?')) {
      window.close();
    }
  };

  const getThemeParams = () => {
    return {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#0088cc',
      button_color: '#0088cc',
      button_text_color: '#ffffff',
    };
  };

  const contextValue: WebContextType = {
    webUser,
    showMainButton,
    hideMainButton,
    hapticFeedback,
    closeApp,
    getThemeParams,
    isAvailable: true,
  };

  return (
    <WebContext.Provider value={contextValue}>
      {children}
    </WebContext.Provider>
  );
};

export const useWeb = () => {
  const context = useContext(WebContext);
  if (!context) {
    throw new Error('useWeb must be used within a WebProvider');
  }
  return context;
};
