'use client';

import { useTelegram } from '@/components/providers/telegram-provider';
import { useUserData } from '@/components/providers/user-data-provider';
import { UserData } from '@/types';
import Image from 'next/image';
import {
    ArrowLeftIcon,
    CheckIcon,
    CogIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    ScaleIcon,
    TrashIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const router = useRouter();
  const { 
    userData, 
    updateUserData, 
    deleteUserData,
    getBMI,
    getBMICategory,
    getDailyCalories,
    connectionStatus
  } = useUserData();
  const { hapticFeedback, tgUser } = useTelegram();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    age: userData?.age || '',
    weight: userData?.weight || '',
    height: userData?.height || '',
    activityLevel: userData?.activityLevel || '',
    healthGoals: userData?.healthGoals || [],
    dietaryRestrictions: userData?.dietaryRestrictions || [],
    medicalConditions: userData?.medicalConditions || [],
    preferences: {
      maxSugar: userData?.preferences?.maxSugar || '',
      maxFat: userData?.preferences?.maxFat || '',
      maxSalt: userData?.preferences?.maxSalt || '',
      notifications: userData?.preferences?.notifications ?? true,
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    hapticFeedback.impact('medium');
    
    try {
      const updates: Partial<UserData> = {
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        activityLevel: formData.activityLevel as any || undefined,
        healthGoals: formData.healthGoals as any,
        dietaryRestrictions: formData.dietaryRestrictions as any,
        medicalConditions: formData.medicalConditions as any,
        preferences: {
          ...userData?.preferences,
          maxSugar: formData.preferences.maxSugar ? Number(formData.preferences.maxSugar) : undefined,
          maxFat: formData.preferences.maxFat ? Number(formData.preferences.maxFat) : undefined,
          maxSalt: formData.preferences.maxSalt ? Number(formData.preferences.maxSalt) : undefined,
          notifications: formData.preferences.notifications,
        }
      };

      const success = await updateUserData(updates);
      if (success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        hapticFeedback.notification('success');
      } else {
        toast.error('Failed to update profile');
        hapticFeedback.notification('error');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
      hapticFeedback.notification('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    hapticFeedback.impact('heavy');
    deleteUserData();
    toast.success('Account deleted successfully');
    router.push('/');
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updatePreferences = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const toggleArrayItem = (key: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key as keyof typeof prev] as string[]).includes(item)
        ? (prev[key as keyof typeof prev] as string[]).filter(i => i !== item)
        : [...(prev[key as keyof typeof prev] as string[]), item]
    }));
  };

  if (!connectionStatus.isConnected || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No User Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please connect to Telegram and complete setup first.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const bmi = getBMI();
  const bmiCategory = getBMICategory();
  const dailyCalories = getDailyCalories();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your health profile</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              isEditing 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Telegram User Info */}
        {tgUser && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Telegram Account
            </h3>
            <div className="flex items-center gap-3">
              {tgUser.photo_url && (
                <Image
                  src={tgUser.photo_url}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600"
                  unoptimized
                />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </div>
                {userData.username && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{userData.username}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ID: {userData.telegramId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Stats */}
        {(bmi || dailyCalories) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HeartIcon className="w-5 h-5" />
              Health Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {bmi && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bmi.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">BMI</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {bmiCategory}
                  </div>
                </div>
              )}
              {dailyCalories && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyCalories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Calories</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Estimated need
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ScaleIcon className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  min="13"
                  max="120"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.age || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  step="0.1"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.weight || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateFormData('height', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.height || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Nutrition Limits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Custom Nutrition Limits (per 100g)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Sugar (g)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.preferences.maxSugar}
                  onChange={(e) => updatePreferences('maxSugar', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  step="0.1"
                  placeholder="22.5"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.preferences?.maxSugar || 'Default (22.5g)'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Fat (g)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.preferences.maxFat}
                  onChange={(e) => updatePreferences('maxFat', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  step="0.1"
                  placeholder="17.5"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.preferences?.maxFat || 'Default (17.5g)'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Salt (g)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.preferences.maxSalt}
                  onChange={(e) => updatePreferences('maxSalt', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  step="0.01"
                  placeholder="1.5"
                />
              ) : (
                <div className="text-gray-900 dark:text-white">
                  {userData.preferences?.maxSalt || 'Default (1.5g)'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Goals & Restrictions - only show if user has data */}
        {(userData.healthGoals?.length || userData.dietaryRestrictions?.length || userData.medicalConditions?.length) && (
          <div className="space-y-4">
            {userData.healthGoals && userData.healthGoals.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Health Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.healthGoals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                    >
                      {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userData.dietaryRestrictions && userData.dietaryRestrictions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.dietaryRestrictions.map((restriction) => (
                    <span
                      key={restriction}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                    >
                      {restriction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userData.medicalConditions && userData.medicalConditions.length > 0 && userData.medicalConditions[0] !== 'none' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Medical Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.medicalConditions.map((condition) => (
                    <span
                      key={condition}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm"
                    >
                      {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save/Delete Actions */}
        {isEditing && (
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center">
              <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Delete Account?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                This will permanently delete all your profile data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
