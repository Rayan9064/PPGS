'use client';

import { useTelegram } from '@/components/providers/telegram-provider';
import { useUserData } from '@/components/providers/user-data-provider';
import { UserData } from '@/types';
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HeartIcon,
    ScaleIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface OnboardingStepProps {
  children: React.ReactNode;
  title: string;
  description: string;
  progress: number;
  onNext?: () => void;
  onBack?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
}

const OnboardingStep = ({ 
  children, 
  title, 
  description, 
  progress, 
  onNext, 
  onBack, 
  canProceed = true,
  isLoading = false
}: OnboardingStepProps) => (
  <div className="w-full max-w-md mx-auto">
    {/* Progress Bar */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Setup Progress
        </span>
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    {/* Content */}
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>

    <div className="mb-8">
      {children}
    </div>

    {/* Navigation */}
    <div className="flex gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-3 px-4 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl py-3 px-4 font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Continue
              <ChevronRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  </div>
);

export const OnboardingFlow = ({ onComplete, onSkip }: OnboardingFlowProps) => {
  const { userData, updateUserData, updateOnboardingStep, completeOnboarding } = useUserData();
  const { hapticFeedback } = useTelegram();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    age: userData?.age || '',
    weight: userData?.weight || '',
    height: userData?.height || '',
    activityLevel: userData?.activityLevel || '',
    healthGoals: userData?.healthGoals || [],
    dietaryRestrictions: userData?.dietaryRestrictions || [],
    medicalConditions: userData?.medicalConditions || [],
  });

  const steps = [
    {
      key: 'basic_info',
      title: 'Basic Information',
      description: 'Help us understand your profile',
      progress: 25,
    },
    {
      key: 'health_info',
      title: 'Health Metrics',
      description: 'For personalized recommendations',
      progress: 50,
    },
    {
      key: 'dietary_preferences',
      title: 'Dietary Preferences',
      description: 'Any restrictions or special needs?',
      progress: 75,
    },
    {
      key: 'goals',
      title: 'Health Goals',
      description: 'What are you working towards?',
      progress: 100,
    },
  ];

  const handleNext = async () => {
    hapticFeedback.impact('light');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateOnboardingStep(steps[currentStep + 1].key as any);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    hapticFeedback.impact('light');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateOnboardingStep(steps[currentStep - 1].key as any);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save all form data
      const updates: Partial<UserData> = {
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        activityLevel: formData.activityLevel as any,
        healthGoals: formData.healthGoals as any,
        dietaryRestrictions: formData.dietaryRestrictions as any,
        medicalConditions: formData.medicalConditions as any,
      };

      await updateUserData(updates);
      completeOnboarding();
      hapticFeedback.notification('success');
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      hapticFeedback.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key as keyof typeof prev] as string[]).includes(item)
        ? (prev[key as keyof typeof prev] as string[]).filter(i => i !== item)
        : [...(prev[key as keyof typeof prev] as string[]), item]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData('age', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your age"
                min="13"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your weight"
                min="20"
                max="500"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData('height', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your height"
                min="100"
                max="250"
              />
            </div>
          </div>
        );

      case 1: // Health Info
        const activityLevels = [
          { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
          { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
          { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
          { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
          { value: 'extra_active', label: 'Extra Active', description: 'Very hard exercise, physical job' },
        ];

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Activity Level
              </label>
              <div className="space-y-2">
                {activityLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData('activityLevel', level.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.activityLevel === level.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Dietary Preferences
        const restrictions = [
          'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 
          'nut_free', 'low_sodium', 'diabetic'
        ] as const;
        
        const conditions = [
          'diabetes', 'hypertension', 'heart_disease', 'kidney_disease', 'none'
        ] as const;

        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Dietary Restrictions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {restrictions.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => toggleArrayItem('dietaryRestrictions', restriction)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.dietaryRestrictions.includes(restriction)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {restriction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Medical Conditions
              </label>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      if (condition === 'none') {
                        updateFormData('medicalConditions', ['none']);
                      } else {
                        const filtered = formData.medicalConditions.filter(c => c !== 'none');
                        toggleArrayItem('medicalConditions', condition);
                        if (filtered.length === 0 && !formData.medicalConditions.includes(condition)) {
                          updateFormData('medicalConditions', [condition]);
                        }
                      }
                    }}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      formData.medicalConditions.includes(condition)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Goals
        const goals = [
          'weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight', 'improve_health'
        ] as const;

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Health Goals (select all that apply)
              </label>
              <div className="space-y-2">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayItem('healthGoals', goal)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.healthGoals.includes(goal)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.healthGoals.includes(goal)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.healthGoals.includes(goal) && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic info - at least age required
        return formData.age !== '';
      case 1: // Health info - activity level required
        return formData.activityLevel !== '';
      case 2: // Dietary preferences - optional
        return true;
      case 3: // Goals - at least one goal required
        return formData.healthGoals.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {currentStep === 0 && <UserIcon className="w-6 h-6" />}
              {currentStep === 1 && <ScaleIcon className="w-6 h-6" />}
              {currentStep === 2 && <HeartIcon className="w-6 h-6" />}
              {currentStep === 3 && <CheckIcon className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold">Setup Your Profile</h1>
              <p className="text-purple-100 text-sm">Get personalized nutrition insights</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <OnboardingStep
            title={steps[currentStep].title}
            description={steps[currentStep].description}
            progress={steps[currentStep].progress}
            onNext={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
            canProceed={canProceed()}
            isLoading={isLoading}
          >
            {renderStepContent()}
          </OnboardingStep>

          {/* Skip option */}
          {onSkip && currentStep < steps.length - 1 && (
            <div className="mt-4 text-center">
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Skip setup for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
