'use client';

import { useState } from 'react';
import { 
  UserIcon, 
  CogIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  BellIcon, 
  InformationCircleIcon,
  ChevronRightIcon,
  StarIcon,
  ShareIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useTelegram } from '@/components/providers/telegram-provider';
import { useTheme } from '@/components/providers/theme-provider';

export const ProfileTab = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['vegetarian']);
  const { hapticFeedback, isAvailable } = useTelegram();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    hapticFeedback.impact('light');
    setter(!currentValue);
  };

  const handleMenuPress = (action: string, route?: string) => {
    hapticFeedback.impact('light');
    if (action === 'theme') {
      toggleTheme();
    } else if (route) {
      // Navigate to the route
      window.location.href = route;
    } else {
      console.log(`Profile action: ${action}`);
    }
  };

  const menuSections = [
    {
      title: 'Appearance & Preferences',
      items: [
        { 
          icon: isDark ? SunIcon : MoonIcon, 
          label: 'Dark Mode', 
          value: isDark ? 'On' : 'Off', 
          action: 'theme',
          isToggle: true
        },
        { icon: HeartIcon, label: 'Dietary Preferences', value: dietaryRestrictions.join(', '), action: 'dietary', route: '/preferences' },
        { icon: ShieldCheckIcon, label: 'Health Goals', value: 'Balanced nutrition', action: 'goals' },
        { icon: BellIcon, label: 'Notifications', value: notificationsEnabled ? 'On' : 'Off', action: 'notifications' },
      ]
    },
    {
      title: 'Your Data',
      items: [
        { icon: CogIcon, label: 'Consumed Products', value: 'Track daily intake', action: 'consumed', route: '/profile/consumed' },
        { icon: StarIcon, label: 'Scan History', value: 'View all scans', action: 'history', route: '/profile/history' },
        { icon: InformationCircleIcon, label: 'Favorites', value: 'Saved products', action: 'favorites', route: '/profile/favorites' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: ShareIcon, label: 'Share App', value: '', action: 'share' },
        { icon: InformationCircleIcon, label: 'About NutriPal', value: 'v1.0.0', action: 'about' },
        { icon: ShieldCheckIcon, label: 'Privacy Policy', value: '', action: 'privacy' },
      ]
    }
  ];

  const stats = [
    { label: 'Products Scanned', value: '47', color: 'text-blue-600' },
    { label: 'Healthy Choices', value: '32', color: 'text-green-600' },
    { label: 'Days Active', value: '12', color: 'text-purple-600' },
  ];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
        <div className="px-4 py-6 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="text-emerald-100">
                {isAvailable ? 'Telegram User' : 'Nutrition Enthusiast'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Score</h2>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className="text-lg font-bold text-green-600">85/100</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Great job! You&apos;re making healthy choices consistently.
          </p>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleMenuPress(item.action, (item as any).route)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.value}</span>
                    )}
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Dietary Restrictions Quick Edit */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Filters</h2>
          <div className="flex flex-wrap gap-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Low Sugar', 'Low Sodium', 'Organic'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  hapticFeedback.impact('light');
                  setDietaryRestrictions(prev => 
                    prev.includes(filter.toLowerCase()) 
                      ? prev.filter(f => f !== filter.toLowerCase())
                      : [...prev, filter.toLowerCase()]
                  );
                }}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  dietaryRestrictions.includes(filter.toLowerCase())
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            NutriPal v1.0.0 • Made with ❤️ for better nutrition
          </p>
          {isAvailable && (
            <p className="text-xs text-gray-400 mt-1">
              Optimized for Telegram Mini Apps
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
