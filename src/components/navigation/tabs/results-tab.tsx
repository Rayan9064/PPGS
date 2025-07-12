'use client';

import { ClockIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { ProductData } from '@/types';
import { ProductResult } from '@/components/product/product-result';
import { getNutritionGrade } from '@/utils/grading-logic';
import { useTelegram } from '@/components/providers/telegram-provider';

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
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pt-8">
          <ProductResult 
            product={currentProduct}
            onScanAnother={handleScanAnother}
            onBack={() => onProductSelect(currentProduct)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 pt-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Scan Results</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">View your scanned products and nutrition analysis</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {recentScans.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCodeIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Scans Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Start scanning products to see their nutrition analysis and health recommendations here.
            </p>
            <button
              onClick={handleScanAnother}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
            >
              Scan Your First Product
            </button>
          </div>
        ) : (
          // Results List
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Scans</h2>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded-full">
                  {recentScans.length}
                </span>
              </div>
              <button
                onClick={handleScanAnother}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      {/* Grade Badge */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold ${getGradeColor(gradeInfo.grade)}`}>
                        {gradeInfo.grade}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {product.product_name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {product.brands || 'Unknown Brand'}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {gradeInfo.description}
                        </p>
                        {product.categories && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                            {product.categories}
                          </p>
                        )}
                      </div>

                      {/* Nutrition Preview */}
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div>Sugar: {product.nutriments.sugars_100g}g</div>
                          <div>Fat: {product.nutriments.fat_100g}g</div>
                          <div>Salt: {product.nutriments.salt_100g}g</div>
                        </div>
                      </div>
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
