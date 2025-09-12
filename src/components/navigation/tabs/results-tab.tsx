'use client';

import { ProductResult } from '@/components/product/product-result';
import { useWeb } from '@/components/providers/web-provider';
import { useUserData } from '@/components/providers/user-data-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { ArrowLeftIcon, ClockIcon, QrCodeIcon, UserIcon, HeartIcon, ShareIcon, StarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ResultsTabProps {
  currentProduct: ProductData | null;
  recentScans: ProductData[];
  onScanAnother: () => void;
  onProductSelect: (product: ProductData) => void;
}

export const ResultsTab = ({ currentProduct, recentScans, onScanAnother, onProductSelect }: ResultsTabProps) => {
  const { hapticFeedback } = useWeb();
  const { userData, connectionStatus } = useUserData();

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
      'A': 'bg-grade-a',
      'B': 'bg-grade-b', 
      'C': 'bg-grade-c',
      'D': 'bg-grade-d',
      'E': 'bg-grade-e'
    };
    return colors[grade as keyof typeof colors] || 'bg-grade-u';
  };

  if (currentProduct) {
    return (
      <div className="flex-1 w-full bg-primary-50 pb-20">
        {/* Header */}
        <div className="px-6 py-4 pt-12">
          <div className="flex items-center justify-between">
            <button onClick={() => onProductSelect(currentProduct)} className="p-2">
              <ArrowLeftIcon className="w-6 h-6 text-secondary-900" />
            </button>
            <h1 className="text-xl font-bold text-secondary-900">Results</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Product Banner */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-200/30 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">{currentProduct.product_name || 'Unknown Product'}</h2>
              <p className="text-primary-500 font-medium">NutriGrade</p>
            </div>
          </div>
        </div>

        {/* NutriGrade Score */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-secondary-900">NutriGrade</h3>
            <span className="text-2xl font-bold text-secondary-900">{getNutritionGrade(currentProduct).grade}</span>
          </div>
          <div className="w-full bg-secondary-100 rounded-full h-3">
            <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${getNutritionGrade(currentProduct).grade === 'A' ? 90 : getNutritionGrade(currentProduct).grade === 'B' ? 75 : getNutritionGrade(currentProduct).grade === 'C' ? 60 : getNutritionGrade(currentProduct).grade === 'D' ? 40 : 20}%` }}></div>
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Nutrition Facts</h3>
          <div className="space-y-3">
            {[
              { label: 'Energy', value: `${currentProduct.nutriments?.energy_100g || 0} kcal`, percentage: Math.min((currentProduct.nutriments?.energy_100g || 0) / 2, 100) },
              { label: 'Total Fat', value: `${currentProduct.nutriments?.fat_100g || 0}g`, percentage: Math.min((currentProduct.nutriments?.fat_100g || 0) * 10, 100) },
              { label: 'Sugars', value: `${currentProduct.nutriments?.sugars_100g || 0}g`, percentage: Math.min((currentProduct.nutriments?.sugars_100g || 0) * 5, 100) },
              { label: 'Salt', value: `${currentProduct.nutriments?.salt_100g || 0}g`, percentage: Math.min((currentProduct.nutriments?.salt_100g || 0) * 20, 100) },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-secondary-600">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-primary-500 font-medium">{item.value}</span>
                  <div className="w-16 bg-secondary-100 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-secondary-500 text-sm w-8">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">AI Analysis</h3>
          <div className="bg-primary-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary-900 font-medium">Health Score</span>
              <span className="text-2xl font-bold text-secondary-900">
                {getNutritionGrade(currentProduct).score}/10
              </span>
            </div>
          </div>
          <p className="text-secondary-600 leading-relaxed">
            {currentProduct.ingredients_text || 'No detailed analysis available for this product.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
              Find Alternatives
            </button>
            <button className="bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
              Add to Favorites
            </button>
            <button className="bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
              Share
            </button>
            <button className="bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
              Verify with AI
            </button>
          </div>
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Get Recommendations
          </button>
        </div>
      </div>
    );
  }

  // No product selected - show recent scans
  return (
    <div className="flex-1 w-full bg-primary-50 pb-20">
      <div className="px-6 py-4 pt-12">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Recent Scans</h1>
        
        {recentScans.length > 0 ? (
          <div className="space-y-4">
            {recentScans.map((product, index) => (
              <div
                key={product.code || index}
                onClick={() => handleProductSelect(product)}
                className="bg-primary-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-primary-200 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${getGradeColor(product.nutrition_grades)}`}>
                  {product.nutrition_grades || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900">{product.product_name || `Product ${index + 1}`}</h3>
                  <p className="text-secondary-500 text-sm">Scanned recently</p>
            </div>
                <ArrowLeftIcon className="w-5 h-5 text-secondary-400 rotate-180" />
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <QrCodeIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-600 mb-2">No scans yet</h3>
            <p className="text-secondary-500 mb-6">Start scanning products to see your results here</p>
            <button
              onClick={handleScanAnother}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Scan Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};