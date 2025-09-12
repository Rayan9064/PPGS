'use client';

import { ArrowLeftIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { optimizedStorage } from '@/utils/optimized-storage';

const DietaryPreferencesPage = memo(function DietaryPreferencesPage() {
  const router = useRouter();
  
  // Get current dietary restrictions from user data
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  
  // Load user data directly from localStorage (much faster)
  useEffect(() => {
    try {
      const userData = optimizedStorage.get('nutripal-user-data');
      if (userData && userData.dietaryRestrictions) {
        setSelectedRestrictions(userData.dietaryRestrictions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const restrictions = [
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 
    'nut_free', 'low_sodium', 'diabetic'
  ];

  const handleBack = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const toggleRestriction = useCallback((restriction: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Update using optimized storage (debounced and cached)
      const existingData = optimizedStorage.get('nutripal-user-data');
      const userData = existingData || {};
      userData.dietaryRestrictions = selectedRestrictions;
      userData.updatedAt = new Date();
      optimizedStorage.set('nutripal-user-data', userData);
      console.log('Dietary preferences updated successfully');
    } catch (error) {
      console.error('Failed to update dietary preferences:', error);
    }
  }, [selectedRestrictions]);

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary-50 border-b border-primary-200 shadow-sm">
        <div className="px-6 py-4 pt-12">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl"
            >
              <ArrowLeftIcon className="w-6 h-6 text-secondary-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Dietary Preferences</h1>
              <p className="text-sm text-secondary-600">Select your dietary restrictions and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-secondary-900">Dietary Restrictions</h2>
          </div>
          <p className="text-secondary-600">
            Select any dietary restrictions or preferences that apply to you.
          </p>
        </div>

        {/* Restrictions Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {restrictions.map((restriction) => (
            <button
              key={restriction}
              onClick={() => toggleRestriction(restriction)}
              className={`p-3 rounded-xl border-2 text-sm transition-all ${
                selectedRestrictions.includes(restriction)
                  ? 'border-primary-500 bg-primary-100 text-primary-700'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              {restriction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
});

export default DietaryPreferencesPage;
