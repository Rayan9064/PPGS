'use client';

import { useTelegram } from '@/components/providers/telegram-provider';
import { NutritionGrade, ProductData } from '@/types';
import { calculateGrade, getGradeColor, getGradeDescription, getNutrientWarnings } from '@/utils/grading-logic';
import { ArrowLeftIcon, ExclamationTriangleIcon, HeartIcon, PlusIcon, QrCodeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ProductResultProps {
  product: ProductData;
  onScanAnother: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ProductResult = ({ product, onScanAnother, onBack, showBackButton = true }: ProductResultProps) => {
  const { hapticFeedback } = useTelegram();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isConsumed, setIsConsumed] = useState(false);
  const [showImage, setShowImage] = useState(false);
  
  const grade = calculateGrade(product);
  const warnings = getNutrientWarnings(product);
  const gradeColor = getGradeColor(grade);
  const gradeDescription = getGradeDescription(grade);

  // Load saved favorites and consumption state
  useEffect(() => {
    // Check if product is in favorites
    const favorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
    const isFav = favorites.some((fav: any) => fav.product.code === product.code);
    setIsFavorite(isFav);

    // Check if product is in consumption history
    const consumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
    const isConsume = consumed.some((item: any) => item.product.code !== product.code);
    setIsConsumed(isConsume);

    // Add to scan history
    const scanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
    const existingScan = scanHistory.find((scan: any) => scan.product.code === product.code);
    
    if (!existingScan) {
      const newScan = {
        id: Date.now().toString(),
        product,
        timestamp: new Date().toISOString()
      };
      scanHistory.unshift(newScan); // Add to beginning of array
      
      // Keep only last 100 scans to prevent storage bloat
      if (scanHistory.length > 100) {
        scanHistory.splice(100);
      }
      
      localStorage.setItem('nutripal-scan-history', JSON.stringify(scanHistory));
      
      // Dispatch event to update scan history page
      window.dispatchEvent(new CustomEvent('scanHistoryUpdated'));
    }
  }, [product.code]);

  const handleScanAnother = () => {
    hapticFeedback.impact('medium');
    onScanAnother();
  };

  const handleBack = () => {
    hapticFeedback.impact('light');
    onBack?.();
  };

  const handleToggleFavorite = () => {
    hapticFeedback.impact('light');
    setIsFavorite(!isFavorite);
    
    // Store in localStorage
    const favorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
    if (!isFavorite) {
      favorites.push({
        id: product.code || Date.now().toString(),
        product,
        dateAdded: new Date().toISOString()
      });
      localStorage.setItem('nutripal-favorites', JSON.stringify(favorites));
      toast.success('Added to favorites');
    } else {
      const updatedFavorites = favorites.filter((fav: any) => fav.product.code !== product.code);
      localStorage.setItem('nutripal-favorites', JSON.stringify(updatedFavorites));
      toast.success('Removed from favorites');
    }

    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  const handleToggleConsumption = () => {
    hapticFeedback.impact('light');
    setIsConsumed(!isConsumed);
    
    // Store in localStorage
    const consumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
    if (!isConsumed) {
      consumed.push({
        id: Date.now().toString(),
        product,
        timestamp: new Date().toISOString(),
        quantity: 1,
        calories: product.nutriments?.energy_100g || 0
      });
      localStorage.setItem('nutripal-consumed', JSON.stringify(consumed));
      toast.success('Added to consumption');
    } else {
      const updatedConsumed = consumed.filter((item: any) => item.product.code !== product.code);
      localStorage.setItem('nutripal-consumed', JSON.stringify(updatedConsumed));
      toast.success('Removed from consumption');
    }

    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('consumedUpdated'));
  };

  const handleFindAlternatives = () => {
    hapticFeedback.impact('medium');
    toast.success('Finding healthier alternatives...');
    // TODO: Implement healthier alternatives logic
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
    <div className="animate-fade-in px-1 sm:px-0">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate flex-1 mx-2">Product Details</h1>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isFavorite 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isFavorite ? (
              <HeartIconSolid className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          
          <button
            onClick={handleToggleConsumption}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isConsumed 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {product.image_url && (
            <button
              onClick={() => setShowImage(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <QrCodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Header */}
      <div className="card mb-4 sm:mb-6 text-center">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
          {product.product_name}
        </h2>
        
        {/* Grade Badge */}
        <div className="flex flex-col items-center mb-4">
          <div className={`grade-badge w-16 h-16 text-2xl ${getGradeColorClass(grade)} mb-2`}>
            {grade}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{gradeDescription}</p>
        </div>

        {product.brands && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Brand: {product.brands}</p>
        )}
      </div>

      {/* Nutrition Facts */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nutrition Facts (per 100g)
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Sugar</span>
            <span className="font-medium dark:text-white">{product.nutriments.sugars_100g}g</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Fat</span>
            <span className="font-medium dark:text-white">{product.nutriments.fat_100g}g</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 dark:text-gray-300">Salt</span>
            <span className="font-medium dark:text-white">{product.nutriments.salt_100g}g</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="card mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Health Warnings</h3>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-800 dark:text-orange-200">
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {product.ingredients_text}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleFindAlternatives}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
        >
          <SparklesIcon className="w-5 h-5 inline mr-2" />
          Find Healthier Alternatives
        </button>
        
        <button
          onClick={handleScanAnother}
          className="w-full btn-primary py-3 text-lg font-semibold rounded-xl"
        >
          <QrCodeIcon className="w-5 h-5 inline mr-2" />
          Scan Another Product
        </button>
        
        {showBackButton && (
          <button
            onClick={handleBack}
            className="w-full btn-secondary py-3 text-lg font-semibold rounded-xl"
          >
            Back to Home
          </button>
        )}
      </div>

      {/* Product Image Modal */}
      {showImage && product.image_url && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-10 right-0 text-white text-xl p-2"
            >
              ✕
            </button>
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
