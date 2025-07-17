'use client';

import { useTelegram } from '@/components/providers/telegram-provider';
import { useTheme } from '@/components/providers/theme-provider';
import {
    BellIcon,
    ChevronRightIcon,
    CogIcon,
    HeartIcon,
    InformationCircleIcon,
    MoonIcon,
    ShareIcon,
    ShieldCheckIcon,
    StarIcon,
    SunIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

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
    <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-y-auto no-scrollbar">
      {/* Enhanced Header */}
      <div className="w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 opacity-90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10 px-4 py-8 pt-12">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg float-animation">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back!</h1>
              <p className="text-emerald-100 font-medium">
                {isAvailable ? 'Telegram User' : 'Nutrition Enthusiast'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6">
        {/* Enhanced Quick Stats */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-600/50 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center float-animation">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your Progress</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-white/60 dark:border-gray-600/60 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <p className={`text-3xl font-bold ${stat.color} drop-shadow-sm`}>{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Health Score */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800/70 dark:to-gray-700/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100 dark:border-gray-600/50 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center float-animation">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Health Score</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                A
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">85/100</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full shadow-lg transition-all duration-1000" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 font-medium">
            Great job! You&apos;re making healthy choices consistently.
          </p>
        </div>

        {/* Enhanced Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-600/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: `${(sectionIndex + 2) * 100}ms` }}>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-b border-gray-100 dark:border-gray-600">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-600">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleMenuPress(item.action, (item as any).route)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-xl flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-100 dark:group-hover:from-emerald-900/50 dark:group-hover:to-teal-900/50 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.value && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.value}</span>
                    )}
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Enhanced Dietary Restrictions */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800/70 dark:to-gray-700/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-600/50 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center float-animation">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Quick Filters</h2>
          </div>
          <div className="flex flex-wrap gap-3">
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
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  dietaryRestrictions.includes(filter.toLowerCase())
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200 dark:shadow-emerald-900/50'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 shadow-gray-200 dark:shadow-gray-900/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced App Version */}
        <div className="text-center py-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              NutriPal v1.0.0 • Made with ❤️ for better nutrition
            </p>
            {isAvailable && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Optimized for Telegram Mini Apps
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
