'use client';

import { QrCodeIcon, ClockIcon, TrophyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { useTelegram } from '@/components/providers/telegram-provider';

interface HomeTabProps {
  onStartScanning: () => void;
  recentScans: ProductData[];
  onProductSelect: (product: ProductData) => void;
}

export const HomeTab = ({ onStartScanning, recentScans, onProductSelect }: HomeTabProps) => {
  const { hapticFeedback } = useTelegram();

  const handleScanButtonPress = () => {
    hapticFeedback.impact('medium');
    onStartScanning();
  };

  const handleProductPress = (product: ProductData) => {
    hapticFeedback.impact('light');
    onProductSelect(product);
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-lime-500', 
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'E': 'bg-red-500'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50 to-blue-50 pb-safe">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="px-4 py-4 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NutriPal</h1>
              <p className="text-emerald-600 font-medium">Smart Nutrition Scanner</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 overflow-y-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <QrCodeIcon className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{recentScans.length}</p>
            <p className="text-xs text-gray-500">Scanned</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrophyIcon className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {recentScans.filter(p => ['A', 'B'].includes(getNutritionGrade(p).grade)).length}
            </p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">A+</p>
            <p className="text-xs text-gray-500">Health Score</p>
          </div>
        </div>

        {/* Main Scan Button */}
        <div className="text-center">
          <button
            onClick={handleScanButtonPress}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-6 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <QrCodeIcon className="w-6 h-6 mx-auto mb-2" />
            Scan Product
          </button>
          <p className="text-sm text-gray-600 mt-3">
            Point your camera at any barcode to get instant nutrition insights
          </p>
        </div>

        {/* Nutrition Guide */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Grades</h3>
          <div className="space-y-3">
            {[
              { grade: 'A', label: 'Excellent', desc: 'Very healthy choice' },
              { grade: 'B', label: 'Good', desc: 'Healthy option' },
              { grade: 'C', label: 'Fair', desc: 'Okay in moderation' },
              { grade: 'D', label: 'Poor', desc: 'Less healthy option' },
              { grade: 'E', label: 'Bad', desc: 'Avoid if possible' },
            ].map(({ grade, label, desc }) => (
              <div key={grade} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Scans</h3>
            </div>
            <div className="space-y-3">
              {recentScans.map((product, index) => {
                const gradeInfo = getNutritionGrade(product);
                return (
                  <button
                    key={`${product.code}-${index}`}
                    onClick={() => handleProductPress(product)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getGradeColor(gradeInfo.grade)}`}>
                      {gradeInfo.grade}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 truncate">
                        {product.product_name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {product.brands || 'Unknown Brand'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
