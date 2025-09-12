'use client';

import { useWeb } from '@/components/providers/web-provider';
import { useUserData } from '@/components/providers/user-data-provider';
import { UserData } from '@/types';
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HeartIcon,
    ScaleIcon,
    UserIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    WalletIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingFlow = ({ onComplete, onSkip }: OnboardingFlowProps) => {
  const { userData, updateUserData, updateOnboardingStep, completeOnboarding } = useUserData();
  const { hapticFeedback } = useWeb();
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
      key: 'welcome',
      title: 'Welcome to NutriGrade',
      subtitle: 'Your personal nutrition scanner',
      description: 'Let\'s set up your profile to get personalized nutrition recommendations',
      icon: SparklesIcon,
      progress: 0,
    },
    {
      key: 'basic_info',
      title: 'Basic Information',
      subtitle: 'Help us understand your profile',
      description: 'We need some basic details to personalize your experience',
      icon: UserIcon,
      progress: 20,
    },
    {
      key: 'health_info',
      title: 'Health Metrics',
      subtitle: 'For personalized recommendations',
      description: 'Tell us about your activity level and health goals',
      icon: ScaleIcon,
      progress: 40,
    },
    {
      key: 'dietary_preferences',
      title: 'Dietary Preferences',
      subtitle: 'Any restrictions or special needs?',
      description: 'Help us understand your dietary requirements',
      icon: HeartIcon,
      progress: 60,
    },
    {
      key: 'goals',
      title: 'Health Goals',
      subtitle: 'What are you working towards?',
      description: 'Select your primary health and wellness goals',
      icon: CheckIcon,
      progress: 80,
    },
    {
      key: 'complete',
      title: 'You\'re All Set!',
      subtitle: 'Ready to start your nutrition journey',
      description: 'Your profile is complete. Let\'s start scanning products!',
      icon: ShieldCheckIcon,
      progress: 100,
    },
  ];

  const handleConnectWallet = () => {
    hapticFeedback.impact('medium');
    // For now, just proceed to the next step
    // Later we'll add actual wallet connection logic here
    handleNext();
  };

  const handleNext = async () => {
    hapticFeedback.impact('light');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (steps[currentStep + 1].key !== 'complete') {
      updateOnboardingStep(steps[currentStep + 1].key as any);
      }
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome - always can proceed
        return true;
      case 1: // Basic info - at least age required
        return formData.age !== '';
      case 2: // Health info - activity level required
        return formData.activityLevel !== '';
      case 3: // Dietary preferences - optional
        return true;
      case 4: // Goals - at least one goal required
        return formData.healthGoals.length > 0;
      case 5: // Complete - always can proceed
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-black">Welcome to NutriGrade</h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                Your personal nutrition scanner that helps you make informed food choices
              </p>
            </div>
            <div className="bg-primary-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-black">Features:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-800">Scan product barcodes for nutrition info</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-800">Get personalized health recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-800">Track your nutrition history</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-800">AI-powered nutrition chat</span>
                </div>
              </div>
            </div>
            <div className="bg-secondary-100 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-accent-500 flex-shrink-0" />
              <span className="text-sm text-black">
                <strong>Privacy First:</strong> Your data is stored locally on your device. We never share your personal information.
              </span>
            </div>
          </div>
        );

      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">Basic Information</h2>
              <p className="text-gray-800">Help us understand your profile</p>
            </div>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData('age', e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-secondary-200 bg-white text-black focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="Enter your age"
                min="13"
                max="120"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-secondary-200 bg-white text-black focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="Enter your weight"
                min="20"
                max="500"
                step="0.1"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData('height', e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-secondary-200 bg-white text-black focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="Enter your height"
                min="100"
                max="250"
              />
              </div>
            </div>
          </div>
        );

      case 2: // Health Info
        const activityLevels = [
          { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
          { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
          { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
          { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
          { value: 'extra_active', label: 'Extra Active', description: 'Very hard exercise, physical job' },
        ];

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">Activity Level</h2>
              <p className="text-gray-800">How active are you in your daily life?</p>
            </div>
            <div className="space-y-3">
                {activityLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData('activityLevel', level.value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.activityLevel === level.value
                      ? 'border-primary-500 bg-primary-100'
                      : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                  <div className="font-semibold text-black text-lg">
                      {level.label}
                    </div>
                  <div className="text-sm text-gray-800 mt-1">
                      {level.description}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        );

      case 3: // Dietary Preferences
        const restrictions = [
          'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 
          'nut_free', 'low_sodium', 'diabetic'
        ] as const;
        
        const conditions = [
          'diabetes', 'hypertension', 'heart_disease', 'kidney_disease', 'none'
        ] as const;

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">Dietary Preferences</h2>
              <p className="text-gray-800">Any restrictions or special needs?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Dietary Restrictions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {restrictions.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => toggleArrayItem('dietaryRestrictions', restriction)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.dietaryRestrictions.includes(restriction)
                        ? 'border-primary-500 bg-primary-100 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    {restriction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-3">
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
                        ? 'border-primary-500 bg-primary-100'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Goals
        const goals = [
          'weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight', 'improve_health'
        ] as const;

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">Health Goals</h2>
              <p className="text-gray-800">What are you working towards?</p>
            </div>
            <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayItem('healthGoals', goal)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.healthGoals.includes(goal)
                      ? 'border-primary-500 bg-primary-100'
                      : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.healthGoals.includes(goal)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-secondary-300'
                      }`}>
                        {formData.healthGoals.includes(goal) && (
                        <CheckIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                    <span className="font-semibold text-black text-lg">
                        {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        );

      case 5: // Complete
        return (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
              <CheckIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-black">You're All Set!</h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                Your profile is complete. Let's start scanning products and making healthier choices together!
              </p>
            </div>
            <div className="rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-3">What's Next?</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-black">Scan product barcodes to get nutrition grades</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-black">Get personalized recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-black">Track your nutrition history</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-black">Chat with our AI nutrition assistant</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-primary-50 z-50 flex flex-col">
      {/* Header with Progress */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className={`p-2 rounded-xl transition-all ${
              currentStep > 0 
                ? 'text-gray-800 hover:bg-secondary-100' 
                : 'invisible'
            }`}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">{currentStepData.title}</h1>
              <p className="text-sm text-gray-800">{currentStepData.subtitle}</p>
            </div>
          </div>

          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${currentStepData.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-800">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm font-medium text-primary-600">{currentStepData.progress}%</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
            {renderStepContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-8">
        <div className="max-w-md mx-auto">
          {currentStep === 0 ? (
            <div className="space-y-3">
              <button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <WalletIcon className="w-5 h-5" />
                Connect Wallet
              </button>
              {/* <button
                onClick={onSkip}
                className="w-full bg-secondary-100 hover:bg-secondary-200 text-black font-medium py-3 rounded-2xl transition-all duration-200"
              >
                Continue without account (Demo Mode)
              </button> */}
            </div>
          ) : currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Start Using NutriGrade
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
