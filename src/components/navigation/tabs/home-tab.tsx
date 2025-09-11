'use client';

import { useWeb } from '@/components/providers/web-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { ClockIcon, QrCodeIcon, ShieldCheckIcon, TrophyIcon, CogIcon, HeartIcon } from '@heroicons/react/24/outline';

interface HomeTabProps {
  onStartScanning: () => void;
  recentScans: ProductData[];
  onProductSelect: (product: ProductData) => void;
}

export const HomeTab = ({ onStartScanning, recentScans, onProductSelect }: HomeTabProps) => {
  const { hapticFeedback } = useWeb();

  const handleScanButtonPress = () => {
    hapticFeedback.impact('medium');
    onStartScanning();
  };

  const handleProductPress = (product: ProductData) => {
    hapticFeedback.impact('light');
    onProductSelect(product);
  };

  const handleSettingsPress = () => {
    hapticFeedback.impact('light');
    window.location.href = '/profile/settings';
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-grade-a',
      'B': 'bg-grade-b', 
      'C': 'bg-grade-c',
      'D': 'bg-grade-d',
      'E': 'bg-grade-e'
    };
    return colors[grade as keyof typeof colors] || 'bg-grade-u';
  };

  return (
    <div className="flex-1 w-full bg-primary-50 pb-20">
      {/* Header */}
      <div className="px-6 py-4 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary-900">NutriGrade</h1>
          <button 
            onClick={handleSettingsPress}
            className="p-2 hover:bg-primary-100 rounded-xl transition-all duration-200"
          >
            <CogIcon className="w-6 h-6 text-primary-600" />
          </button>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-secondary-900">Hello, Alex</h2>
        </div>
      </div>

      {/* Health Score Section */}
      <div className="px-6 mb-6">
        <div className="bg-primary-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-primary-500" />
            </div>
            <span className="text-secondary-900 font-medium">Health Score</span>
          </div>
          <span className="text-2xl font-bold text-secondary-900">85</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-primary-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-secondary-900 mb-1">3</div>
            <div className="text-secondary-500 text-sm">Scanned Today</div>
          </div>
          <div className="bg-primary-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-secondary-900 mb-1">2</div>
            <div className="text-secondary-500 text-sm">Healthy Choices</div>
          </div>
        </div>
        <div className="bg-primary-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-secondary-900 mb-1">7</div>
          <div className="text-secondary-500 text-sm">Streak Days</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-6 space-y-3">
        <button
          onClick={handleScanButtonPress}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Scan Product
        </button>
        <button className="w-full bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
          View History
        </button>
        <button className="w-full bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
          AI Recommendations
        </button>
      </div>

      {/* Recent Scans */}
      <div className="px-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-4">Recent Scans</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentScans.length > 0 ? (
            recentScans.map((product, index) => (
              <div
                key={product.code || index}
                onClick={() => handleProductPress(product)}
                className="flex-shrink-0 w-24 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {product.nutrition_grades || '?'}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {product.product_name || `Product ${index + 1}`}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="flex-shrink-0 w-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-secondary-900">Product 1</p>
              </div>
              <div className="flex-shrink-0 w-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-secondary-900">Product 2</p>
              </div>
              <div className="flex-shrink-0 w-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-secondary-900">Product 3</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};