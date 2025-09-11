'use client';

import { useWeb } from '@/components/providers/web-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { ClockIcon, QrCodeIcon, ShieldCheckIcon, TrophyIcon } from '@heroicons/react/24/outline';

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
    <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 pb-safe">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative px-4 py-6 pt-12">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">NutriPal</h1>
              <p className="text-emerald-100 font-medium mt-1 drop-shadow-sm">Smart Nutrition Scanner</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 glow-pulse animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <ShieldCheckIcon className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-emerald-50 dark:to-gray-800"></div>
      </div>

      <div className="w-full px-4 py-4 space-y-6 overflow-y-auto no-scrollbar">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {/* Scanned Card */}
          <div className="bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 rounded-2xl p-4 text-center shadow-xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-700 opacity-90"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 float-animation">
                <QrCodeIcon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white drop-shadow-lg">{recentScans.length}</p>
              <p className="text-xs text-cyan-100 mt-1 font-medium">Scanned</p>
            </div>
          </div>
          
          {/* Healthy Card */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl p-4 text-center shadow-xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-yellow-700 opacity-90"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 float-animation">
                <TrophyIcon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white drop-shadow-lg">
                {recentScans.filter(scan => {
                  const grade = getNutritionGrade(scan);
                  return grade.grade === 'A' || grade.grade === 'B';
                }).length}
              </p>
              <p className="text-xs text-orange-100 mt-1 font-medium">Healthy</p>
            </div>
          </div>
          
          {/* Grade Average Card */}
          <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl p-4 text-center shadow-xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-700 opacity-90"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full -ml-6 -mb-6"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 float-animation">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white drop-shadow-lg">
                {recentScans.length > 0 ? 
                  (recentScans.reduce((sum, scan) => {
                    const grade = getNutritionGrade(scan);
                    const gradeValues = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'U': 0 };
                    return sum + (gradeValues[grade.grade as keyof typeof gradeValues] || 0);
                  }, 0) / recentScans.length).toFixed(1) 
                  : '0.0'
                }
              </p>
              <p className="text-xs text-violet-100 mt-1 font-medium">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Main Scan Button */}
        <div className="text-center px-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={handleScanButtonPress}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 inline-flex flex-col items-center"
          >
            <QrCodeIcon className="w-8 h-8 mb-3" />
            Scan Product
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 px-4">
            Point your camera at any barcode to get instant nutrition insights
          </p>
        </div>

        {/* Nutrition Guide */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-emerald-100 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center float-animation">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Nutrition Grades
            </h3>
          </div>
          <div className="grid gap-4">
            {[
              { grade: 'A', label: 'Excellent', desc: 'Very healthy choice', color: 'from-green-500 to-emerald-500' },
              { grade: 'B', label: 'Good', desc: 'Healthy option', color: 'from-lime-500 to-green-500' },
              { grade: 'C', label: 'Fair', desc: 'Okay in moderation', color: 'from-yellow-400 to-orange-400' },
              { grade: 'D', label: 'Poor', desc: 'Less healthy option', color: 'from-orange-500 to-red-400' },
              { grade: 'E', label: 'Bad', desc: 'Avoid if possible', color: 'from-red-500 to-pink-500' },
            ].map(({ grade, label, desc, color }, index) => (
              <div 
                key={grade} 
                className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-600/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                  <span className="relative z-10">{grade}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {desc}
                  </p>
                </div>
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full grade-indicator"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-600/50 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recent Scans</h3>
            </div>
            <div className="space-y-3">
              {recentScans.map((product, index) => {
                const gradeInfo = getNutritionGrade(product);
                return (
                  <button
                    key={`${product.code}-${index}`}
                    onClick={() => handleProductPress(product)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md border border-gray-100 dark:border-gray-600"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg ${getGradeColor(gradeInfo.grade)}`}>
                      {gradeInfo.grade}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                        {product.product_name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {product.brands || 'Unknown Brand'}
                      </p>
                    </div>
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full opacity-70"></div>
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
