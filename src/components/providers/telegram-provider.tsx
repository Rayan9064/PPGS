'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTelegramWebApp } from '@/lib/telegram';

interface TelegramContextType {
  webApp: any;
  tgUser: any;
  initializeApp: () => void;
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

const TelegramContext = createContext<TelegramContextType | null>(null);

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const telegram = useTelegramWebApp();

  useEffect(() => {
    telegram.initializeApp();
  }, [telegram]);

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
