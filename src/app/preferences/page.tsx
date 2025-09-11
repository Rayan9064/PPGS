'use client';

import { useState } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useWeb } from '@/components/providers/web-provider';

interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  category: 'diet' | 'allergy' | 'lifestyle';
}

export default function DietaryPreferences() {
  const { hapticFeedback } = useWeb();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['vegetarian']);

  const preferences: DietaryPreference[] = [
    // Diet Types
    { id: 'vegetarian', name: 'Vegetarian', description: 'No meat or fish', category: 'diet' },
    { id: 'vegan', name: 'Vegan', description: 'No animal products', category: 'diet' },
    { id: 'pescatarian', name: 'Pescatarian', description: 'Fish but no meat', category: 'diet' },
    { id: 'keto', name: 'Ketogenic', description: 'Low carb, high fat', category: 'diet' },
    { id: 'paleo', name: 'Paleo', description: 'Whole foods only', category: 'diet' },
    { id: 'mediterranean', name: 'Mediterranean', description: 'Heart-healthy diet', category: 'diet' },
    
    // Allergies & Intolerances
    { id: 'gluten-free', name: 'Gluten-Free', description: 'No gluten-containing grains', category: 'allergy' },
    { id: 'dairy-free', name: 'Dairy-Free', description: 'No lactose or milk products', category: 'allergy' },
    { id: 'nut-free', name: 'Nut-Free', description: 'No tree nuts or peanuts', category: 'allergy' },
    { id: 'soy-free', name: 'Soy-Free', description: 'No soy products', category: 'allergy' },
    { id: 'egg-free', name: 'Egg-Free', description: 'No eggs or egg products', category: 'allergy' },
    
    // Lifestyle
    { id: 'low-sodium', name: 'Low Sodium', description: 'Reduced salt intake', category: 'lifestyle' },
    { id: 'low-sugar', name: 'Low Sugar', description: 'Minimal added sugars', category: 'lifestyle' },
    { id: 'organic', name: 'Organic Only', description: 'Certified organic products', category: 'lifestyle' },
    { id: 'non-gmo', name: 'Non-GMO', description: 'No genetically modified ingredients', category: 'lifestyle' },
  ];

  const togglePreference = (id: string) => {
    hapticFeedback.impact('light');
    setSelectedPreferences(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const categories = {
    diet: { title: 'Diet Types', color: 'emerald' },
    allergy: { title: 'Allergies & Intolerances', color: 'red' },
    lifestyle: { title: 'Lifestyle Choices', color: 'blue' }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 pt-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dietary Preferences</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Customize your nutrition filters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {Object.entries(categories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {preferences
                .filter(pref => pref.category === categoryKey)
                .map((preference) => (
                  <button
                    key={preference.id}
                    onClick={() => togglePreference(preference.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedPreferences.includes(preference.id)
                            ? `bg-${category.color}-500 border-${category.color}-500`
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedPreferences.includes(preference.id) && (
                            <CheckIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{preference.name}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{preference.description}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}

        {/* Save Button */}
        <div className="sticky bottom-4">
          <button 
            onClick={() => {
              hapticFeedback.notification('success');
              // Save preferences logic here
              window.history.back();
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 font-semibold transition-colors"
          >
            Save Preferences ({selectedPreferences.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
}
