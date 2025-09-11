'use client';

import { ArrowLeftIcon, CheckIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HealthGoalsPage() {
  const router = useRouter();
  
  // Get current health goals from user data
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Load user data directly from localStorage (much faster)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nutripal-user-data');
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData.healthGoals) {
          setSelectedGoals(userData.healthGoals);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const goals = [
    'weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight', 'improve_health'
  ];

  const handleBack = () => {
    router.push('/profile');
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSave = async () => {
    try {
      // Update localStorage directly (much faster)
      const stored = localStorage.getItem('nutripal-user-data');
      if (stored) {
        const userData = JSON.parse(stored);
        userData.healthGoals = selectedGoals;
        userData.updatedAt = new Date();
        localStorage.setItem('nutripal-user-data', JSON.stringify(userData));
        console.log('Health goals updated successfully');
      }
    } catch (error) {
      console.error('Failed to update health goals:', error);
    }
  };

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
              <h1 className="text-2xl font-bold text-secondary-900">Health Goals</h1>
              <p className="text-sm text-secondary-600">Select your health and wellness goals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <HeartIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-secondary-900">Your Health Goals</h2>
          </div>
          <p className="text-secondary-600">
            Select all the health goals that apply to you. You can change these anytime.
          </p>
        </div>

        {/* Goals Selection */}
        <div className="space-y-3 mb-6">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedGoals.includes(goal)
                  ? 'border-primary-500 bg-primary-100'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedGoals.includes(goal)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-secondary-300'
                }`}>
                  {selectedGoals.includes(goal) && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-semibold text-secondary-900 text-lg">
                  {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
}
