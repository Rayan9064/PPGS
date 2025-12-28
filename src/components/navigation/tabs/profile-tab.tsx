'use client';

import { useWeb } from '@/components/providers/web-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { useUserData } from '@/components/providers/user-data-provider';
import { ConsumptionAnalysis } from '@/components/ai/consumption-analysis';
import {
    BellIcon,
    ChevronRightIcon,
    CogIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    InformationCircleIcon,
    LinkIcon,
    MoonIcon,
    ShareIcon,
    ShieldCheckIcon,
    StarIcon,
    SunIcon,
    UserIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useState, memo, useEffect } from 'react';

export const ProfileTab = memo(function ProfileTab() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showConsumptionAnalysis, setShowConsumptionAnalysis] = useState(false);
  const { hapticFeedback, isAvailable, webUser } = useWeb();
  const { 
    userData, 
    connectionStatus, 
    onboardingState, 
    getBMI, 
    getBMICategory,
    getDailyCalories 
  } = useUserData();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    hapticFeedback.impact('light');
    setter(!currentValue);
  };

  const handleMenuPress = (action: string, route?: string) => {
    hapticFeedback.impact('light');
    if (action === 'theme') {
      toggleTheme();
    } else if (action === 'connect') {
      console.log('Connect to Telegram');
    } else if (action === 'consumption-analysis') {
      setShowConsumptionAnalysis(true);
    } else if (action === 'edit-profile') {
      window.location.href = '/profile/edit-profile';
    } else if (action === 'settings') {
      window.location.href = '/profile/settings';
    } else if (action === 'health-goals') {
      window.location.href = '/profile/health-goals';
    } else if (action === 'dietary-preferences') {
      window.location.href = '/profile/dietary-preferences';
    } else if (action === 'allergies') {
      window.location.href = '/profile/allergies';
    } else if (action === 'help-center') {
      window.location.href = '/profile/help-center';
    } else if (action === 'contact-us') {
      window.location.href = '/profile/contact-us';
    } else if (route) {
      window.location.href = route;
    } else {
      console.log(`Profile action: ${action}`);
    }
  };

  const menuSections = [
    {
      title: 'Account & Profile',
      items: [
        { icon: UserIcon, label: 'Edit Profile', action: 'edit-profile' },
        { icon: CogIcon, label: 'Settings', action: 'settings' },
      ]
    },
    {
      title: 'Health & Preferences',
      items: [
        { icon: HeartIcon, label: 'Health Goals', action: 'health-goals' },
        { icon: ShieldCheckIcon, label: 'Dietary Preferences', action: 'dietary-preferences' },
        { icon: ExclamationTriangleIcon, label: 'Allergies', action: 'allergies' },
      ]
    },
    {
      title: 'Your Data',
      items: [
        { icon: ShieldCheckIcon, label: 'Data Privacy', action: 'data-privacy' },
        { icon: ShareIcon, label: 'Data Export', action: 'data-export' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: InformationCircleIcon, label: 'Help Center', action: 'help-center' },
        { icon: LinkIcon, label: 'Contact Us', action: 'contact-us' },
      ]
    }
  ];

  return (
    <div className="flex-1 w-full bg-primary-50 overflow-y-auto no-scrollbar pb-20">
      {/* Header */}
      <div className="px-6 py-4 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-secondary-900">Profile</h1>
          <button 
            onClick={() => handleMenuPress('settings')}
            className="p-2 hover:bg-primary-100 rounded-xl transition-all duration-200"
          >
            <CogIcon className="w-6 h-6 text-primary-600" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 mb-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-1">Sophia Carter</h2>
          <p className="text-primary-500 mb-1">@sophiacarter</p>
          <p className="text-secondary-500 text-sm">Joined 2021</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-2xl font-bold text-secondary-900 mb-1">
              {getBMI()?.toFixed(1) || '--'}
            </div>
            <div className="text-primary-500 text-sm">BMI</div>
          </div>
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-2xl font-bold text-secondary-900 mb-1">
              {getDailyCalories()?.toFixed(0) || '--'}
            </div>
            <div className="text-primary-500 text-sm">Daily Calories</div>
          </div>
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-2xl font-bold text-secondary-900 mb-1">
              {userData?.activityLevel ? userData.activityLevel.replace('_', ' ') : '--'}
            </div>
            <div className="text-primary-500 text-sm">Activity Level</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-secondary-900 font-medium text-sm mb-1">Products Scanned</div>
            <div className="text-2xl font-bold text-secondary-900">120</div>
          </div>
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-secondary-900 font-medium text-sm mb-1">Healthy Choices</div>
            <div className="text-2xl font-bold text-secondary-900">85</div>
          </div>
          <div className="bg-primary-100 rounded-2xl p-4 text-center border border-primary-200">
            <div className="text-secondary-900 font-medium text-sm mb-1">AI Insights</div>
            <div className="text-2xl font-bold text-secondary-900">3</div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleMenuPress(item.action)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    (item as any).isDestructive 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'bg-primary-100 hover:bg-primary-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      (item as any).isDestructive 
                        ? 'bg-red-200' 
                        : 'bg-primary-200'
                    }`}>
                      <item.icon className={`w-4 h-4 ${
                        (item as any).isDestructive 
                          ? 'text-red-600' 
                          : 'text-primary-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        (item as any).isDestructive 
                          ? 'text-red-900' 
                          : 'text-secondary-900'
                      }`}>{item.label}</div>
                      {(item as any).description && (
                        <div className={`text-sm ${
                          (item as any).isDestructive 
                            ? 'text-red-600' 
                            : 'text-secondary-600'
                        }`}>
                          {(item as any).description}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className={`w-5 h-5 ${
                    (item as any).isDestructive 
                      ? 'text-red-400' 
                      : 'text-secondary-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Consumption Analysis Modal */}
      {showConsumptionAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ConsumptionAnalysis
              onClose={() => setShowConsumptionAnalysis(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
});