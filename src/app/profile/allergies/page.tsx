'use client';

import { ArrowLeftIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { optimizedStorage } from '@/utils/optimized-storage';

const AllergiesPage = memo(function AllergiesPage() {
  const router = useRouter();
  
  // Get current medical conditions from user data
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Load user data directly from localStorage (much faster)
  useEffect(() => {
    try {
      const userData = optimizedStorage.get('nutripal-user-data');
      if (userData && userData.medicalConditions) {
        setSelectedConditions(userData.medicalConditions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const conditions = [
    'diabetes', 'hypertension', 'heart_disease', 'kidney_disease', 'none'
  ];

  const handleBack = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const toggleCondition = useCallback((condition: string) => {
    if (condition === 'none') {
      setSelectedConditions(['none']);
    } else {
      setSelectedConditions(prev => {
        const filtered = prev.filter(c => c !== 'none');
        return filtered.includes(condition)
          ? filtered.filter(c => c !== condition)
          : [...filtered, condition];
      });
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Update using optimized storage (debounced and cached)
      const userData = optimizedStorage.get('nutripal-user-data', {}) as any;
      if (userData) {
        userData.medicalConditions = selectedConditions;
        userData.updatedAt = new Date();
        optimizedStorage.set('nutripal-user-data', userData);
        console.log('Medical conditions updated successfully');
      }
    } catch (error) {
      console.error('Failed to update medical conditions:', error);
    }
  }, [selectedConditions]);

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
              <h1 className="text-2xl font-bold text-secondary-900">Allergies & Medical Conditions</h1>
              <p className="text-sm text-secondary-600">Select any medical conditions or allergies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-secondary-900">Medical Conditions</h2>
          </div>
          <p className="text-secondary-600">
            Select any medical conditions that apply to you. This helps us provide better nutrition recommendations.
          </p>
        </div>

        {/* Conditions Selection */}
        <div className="space-y-2 mb-6">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => toggleCondition(condition)}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                selectedConditions.includes(condition)
                  ? 'border-primary-500 bg-primary-100'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedConditions.includes(condition)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-secondary-300'
                }`}>
                  {selectedConditions.includes(condition) && (
                    <CheckIcon className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-secondary-900">
                  {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
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

export default AllergiesPage;
