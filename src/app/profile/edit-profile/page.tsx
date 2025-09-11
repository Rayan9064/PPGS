'use client';

import { ArrowLeftIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/profile');
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
              <h1 className="text-2xl font-bold text-secondary-900">Edit Profile</h1>
              <p className="text-sm text-secondary-600">Customize your personal information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Coming Soon Section */}
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-300 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <SparklesIcon className="w-12 h-12 text-primary-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">Personalization Coming Soon!</h2>
          
          <p className="text-lg text-secondary-600 mb-8 max-w-md mx-auto leading-relaxed">
            We're working on advanced personalization features that will make your NutriGrade experience even better.
          </p>

          <div className="bg-primary-100 rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3">What's Coming:</h3>
            <ul className="text-left space-y-2 text-secondary-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Advanced profile customization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Personalized nutrition recommendations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Smart goal tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Custom dietary insights
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
