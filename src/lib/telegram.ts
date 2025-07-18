import { TelegramWebApp } from '@/types';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const app = window.Telegram?.WebApp || null;
      setWebApp(app);
      setTgUser(app?.initDataUnsafe?.user || null);
    }
  }, []);

  const initializeApp = () => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
      
      // Disable vertical swipe to close if available and supported
      // This feature is only supported in newer versions of Telegram WebApp
      try {
        const version = (webApp as any).version || '6.0';
        const majorVersion = parseFloat(version);
        
        // Only try to disable vertical swipes for versions that support it (7.0+)
        if (majorVersion >= 7.0 && typeof (webApp as any).disableVerticalSwipes === 'function') {
          (webApp as any).disableVerticalSwipes();
        }
      } catch (e) {
        // Silently ignore if not available - this is expected for older versions
      }
      
      // Set viewport height for mobile
      const viewportHeight = (webApp as any).viewportHeight;
      if (viewportHeight) {
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
      }
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.text = text;
      webApp.MainButton.show();
      webApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged();
    },
  };

  const closeApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  const getThemeParams = () => {
    return webApp?.themeParams || {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#0088cc',
      button_color: '#0088cc',
      button_text_color: '#ffffff',
    };
  };

  return {
    webApp,
    tgUser,
    initializeApp,
    showMainButton,
    hideMainButton,
    hapticFeedback,
    closeApp,
    getThemeParams,
    isAvailable: !!webApp,
  };
};
