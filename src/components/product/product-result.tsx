'use client';

import { ArrowLeftIcon, QrCodeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ProductData, NutritionGrade } from '@/types';
import { calculateGrade, getNutrientWarnings, getGradeColor, getGradeDescription } from '@/utils/grading-logic';
import { useTelegram } from '@/components/providers/telegram-provider';

interface ProductResultProps {
  product: ProductData;
  onScanAnother: () => void;
  onBack: () => void;
}

export const ProductResult = ({ product, onScanAnother, onBack }: ProductResultProps) => {
  const { hapticFeedback } = useTelegram();
  const grade = calculateGrade(product);
  const warnings = getNutrientWarnings(product);
  const gradeColor = getGradeColor(grade);
  const gradeDescription = getGradeDescription(grade);

  const handleScanAnother = () => {
    hapticFeedback.impact('medium');
    onScanAnother();
  };

  const handleBack = () => {
    hapticFeedback.impact('light');
    onBack();
  };

  const getGradeColorClass = (grade: NutritionGrade) => {
    const colorClasses = {
      A: 'bg-grade-a',
      B: 'bg-grade-b',
      C: 'bg-grade-c text-black',
      D: 'bg-grade-d',
      E: 'bg-grade-e',
      U: 'bg-grade-u',
    };
    return colorClasses[grade];
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
        <div></div>
      </div>

      {/* Product Header */}
      <div className="card mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {product.product_name}
        </h2>
        
        {/* Grade Badge */}
        <div className="flex flex-col items-center mb-4">
          <div className={`grade-badge w-16 h-16 text-2xl ${getGradeColorClass(grade)} mb-2`}>
            {grade}
          </div>
          <p className="text-sm text-gray-600">{gradeDescription}</p>
        </div>

        {product.brands && (
          <p className="text-sm text-gray-500 mb-2">Brand: {product.brands}</p>
        )}
      </div>

      {/* Nutrition Facts */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nutrition Facts (per 100g)
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Sugar</span>
            <span className="font-medium">{product.nutriments.sugars_100g}g</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Fat</span>
            <span className="font-medium">{product.nutriments.fat_100g}g</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Salt</span>
            <span className="font-medium">{product.nutriments.salt_100g}g</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="card mb-6 border-orange-200 bg-orange-50">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">Health Warnings</h3>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {product.ingredients_text}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleScanAnother}
          className="w-full btn-primary py-3 text-lg font-semibold rounded-xl"
        >
          <QrCodeIcon className="w-5 h-5 inline mr-2" />
          Scan Another Product
        </button>
        
        <button
          onClick={handleBack}
          className="w-full btn-secondary py-3 text-lg font-semibold rounded-xl"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
