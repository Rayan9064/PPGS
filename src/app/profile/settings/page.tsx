'use client';

import { ArrowLeftIcon, UserIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { optimizedStorage } from '@/utils/optimized-storage';

const SettingsPage = memo(function SettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    weight: '',
    height: '',
  });

  // Load user data from localStorage
  useEffect(() => {
    try {
      const userData = optimizedStorage.get('nutripal-user-data');
      if (userData) {
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          age: userData.age || '',
          weight: userData.weight || '',
          height: userData.height || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Update using optimized storage (debounced and cached)
      const existingData = optimizedStorage.get('nutripal-user-data');
      const userData = existingData || {};
      userData.firstName = formData.firstName;
      userData.lastName = formData.lastName;
      userData.age = parseInt(formData.age) || 0;
      userData.weight = parseFloat(formData.weight) || 0;
      userData.height = parseFloat(formData.height) || 0;
      userData.updatedAt = new Date();
      optimizedStorage.set('nutripal-user-data', userData);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

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
              <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
              <p className="text-sm text-secondary-600">Update your personal information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Profile Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-900">Personal Information</h2>
          <p className="text-secondary-600">Keep your profile up to date</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="1"
              max="120"
              className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your age"
            />
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="1"
                max="300"
                step="0.1"
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="50"
                max="250"
                step="0.1"
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter height"
              />
            </div>
          </div>

          {/* BMI Display */}
          {formData.weight && formData.height && (
            <div className="bg-primary-100 rounded-xl p-4">
              <h3 className="text-sm font-medium text-secondary-700 mb-2">Your BMI</h3>
              <div className="text-2xl font-bold text-secondary-900">
                {((parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1))}
              </div>
              <p className="text-sm text-secondary-600 mt-1">
                {(() => {
                  const bmi = parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2);
                  if (bmi < 18.5) return 'Underweight';
                  if (bmi < 25) return 'Normal weight';
                  if (bmi < 30) return 'Overweight';
                  return 'Obese';
                })()}
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <CheckIcon className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Settings saved successfully!</span>
            </div>
          )}

          {/* Account Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                // Clear all data
                localStorage.removeItem('nutripal-user-data');
                localStorage.removeItem('nutripal-onboarding-completed');
                // Reload to show onboarding
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Reset Account Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SettingsPage;
