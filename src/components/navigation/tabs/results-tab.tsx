'use client';

import { ProductResult } from '@/components/product/product-result';
import { useTelegram } from '@/components/providers/telegram-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { ClockIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface ResultsTabProps {
  currentProduct: ProductData | null;
  recentScans: ProductData[];
  onScanAnother: () => void;
  onProductSelect: (product: ProductData) => void;
}

export const ResultsTab = ({ currentProduct, recentScans, onScanAnother, onProductSelect }: ResultsTabProps) => {
  const { hapticFeedback } = useTelegram();

  const handleProductSelect = (product: ProductData) => {
    hapticFeedback.impact('light');
    onProductSelect(product);
  };

  const handleScanAnother = () => {
    hapticFeedback.impact('medium');
    onScanAnother();
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

  if (currentProduct) {
    return (
      <div className="flex-1 w-full overflow-y-auto no-scrollbar">
        <div className="w-full px-4 py-4 pt-8">
          <ProductResult 
            product={currentProduct}
            onScanAnother={handleScanAnother}
            onBack={() => onProductSelect(currentProduct)}
            showBackButton={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-indigo-100 dark:border-gray-700">
        <div className="px-4 py-4 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center float-animation">
              <QrCodeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Scan Results</h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">View your scanned products and nutrition analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6">
        {recentScans.length === 0 ? (
          // Enhanced Empty State
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <QrCodeIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 float-animation" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">No Scans Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
              Start scanning products to see their nutrition analysis and health recommendations here.
            </p>
            <button
              onClick={handleScanAnother}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Scan Your First Product
            </button>
          </div>
        ) : (
          // Enhanced Results List
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recent Scans</h2>
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                  {recentScans.length}
                </span>
              </div>
              <button
                onClick={handleScanAnother}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Scan Another
              </button>
            </div>

            <div className="grid gap-4">
              {recentScans.map((product, index) => {
                const gradeInfo = getNutritionGrade(product);
                return (
                  <button
                    key={`${product.code}-${index}`}
                    onClick={() => handleProductSelect(product)}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border border-white/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transform hover:scale-[1.02] animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Enhanced Grade Badge */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${getGradeColor(gradeInfo.grade)}`}>
                        {gradeInfo.grade}
                      </div>
                      
                      {/* Enhanced Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate">
                          {product.product_name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                          {product.brands || 'Unknown Brand'}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            gradeInfo.grade === 'A' ? 'bg-green-100 text-green-700' :
                            gradeInfo.grade === 'B' ? 'bg-lime-100 text-lime-700' :
                            gradeInfo.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            gradeInfo.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {gradeInfo.description}
                          </span>
                        </div>
                        {product.categories && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {product.categories}
                          </p>
                        )}
                      </div>

                      {/* Enhanced Nutrition Preview */}
                      <div className="text-right">
                        <div className="space-y-2">
                          <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 px-3 py-1 rounded-lg">
                            <span className="text-xs font-medium text-red-700 dark:text-red-400">Sugar: {product.nutriments.sugars_100g || 0}g</span>
                          </div>
                          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 px-3 py-1 rounded-lg">
                            <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Fat: {product.nutriments.fat_100g || 0}g</span>
                          </div>
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-3 py-1 rounded-lg">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Salt: {product.nutriments.salt_100g || 0}g</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Grade Indicator */}
                      <div className="w-2 h-12 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full grade-indicator"></div>
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
