'use client';

import { aiService } from '@/lib/ai-service';
import { useUserData } from '@/components/providers/user-data-provider';
import { ProductData } from '@/types';
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SmartAlternativesProps {
  currentProduct: ProductData;
  onProductSelect?: (product: ProductData) => void;
  onClose?: () => void;
}

interface AlternativeProduct {
  product: ProductData;
  reason: string;
  improvement: string;
  matchScore: number;
}

export const SmartAlternatives = ({ currentProduct, onProductSelect, onClose }: SmartAlternativesProps) => {
  const { userData } = useUserData();
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [topRecommendation, setTopRecommendation] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    healthScore: number;
    warnings: string[];
    recommendations: string[];
  } | null>(null);

  // Mock available products for demo
  const availableProducts: ProductData[] = [
    {
      code: 'alt001',
      product_name: 'Organic Whole Grain Bread',
      ingredients_text: 'Organic whole wheat flour, water, sea salt, yeast',
      nutrition_grades: 'A',
      nutriments: {
        sugars_100g: 2.5,
        fat_100g: 3.2,
        salt_100g: 0.8,
        energy_100g: 220
      },
      image_url: 'https://example.com/bread.jpg',
      brands: 'Organic Co',
      categories: 'Bakery'
    },
    {
      code: 'alt002',
      product_name: 'Low-Sugar Greek Yogurt',
      ingredients_text: 'Greek yogurt, natural sweeteners, live cultures',
      nutrition_grades: 'A',
      nutriments: {
        sugars_100g: 4.2,
        fat_100g: 2.1,
        salt_100g: 0.1,
        energy_100g: 85
      },
      image_url: 'https://example.com/yogurt.jpg',
      brands: 'Healthy Choice',
      categories: 'Dairy'
    },
    {
      code: 'alt003',
      product_name: 'Natural Nut Butter',
      ingredients_text: '100% organic almonds, sea salt',
      nutrition_grades: 'B',
      nutriments: {
        sugars_100g: 3.8,
        fat_100g: 52.0,
        salt_100g: 0.3,
        energy_100g: 580
      },
      image_url: 'https://example.com/nutbutter.jpg',
      brands: 'Pure Nature',
      categories: 'Spreads'
    }
  ];

  useEffect(() => {
    loadAlternatives();
  }, [currentProduct]);

  const loadAlternatives = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      // Get AI-powered alternatives
      const result = await aiService.getSmartAlternatives(
        currentProduct,
        userData,
        availableProducts
      );

      setAlternatives(result.alternatives);
      setTopRecommendation(result.topRecommendation);

      // Get personalized analysis
      const analysisResult = await aiService.getPersonalizedRecommendations(
        userData,
        currentProduct,
        [] // Mock consumption history
      );

      setAnalysis({
        healthScore: analysisResult.healthScore,
        warnings: analysisResult.warnings,
        recommendations: analysisResult.recommendations
      });

    } catch (error) {
      console.error('Failed to load alternatives:', error);
      toast.error('Failed to load alternatives');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-sage-green text-white',
      'B': 'bg-light-green text-gray-800',
      'C': 'bg-yellow-400 text-gray-800',
      'D': 'bg-orange-400 text-white',
      'E': 'bg-red-500 text-white'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-400 text-white';
  };

  const getImprovementIcon = (improvement: string) => {
    if (improvement.includes('sugar')) return '🍯';
    if (improvement.includes('fat')) return '🥑';
    if (improvement.includes('salt')) return '🧂';
    if (improvement.includes('fiber')) return '🌾';
    return '✨';
  };

  if (isLoading) {
    return (
      <div className="bg-warm-white rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Finding Smart Alternatives</h3>
            <p className="text-sm text-gray-600">AI is analyzing your preferences...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-cream rounded-lg p-4">
                <div className="h-4 bg-light-green/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-light-green/20 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI-Powered Alternatives</h3>
            <p className="text-sm text-gray-600">Based on your blockchain profile</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Current Product Analysis */}
      <div className="bg-cream border border-light-green rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getGradeColor(currentProduct.nutrition_grades)}`}>
            {currentProduct.nutrition_grades}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{currentProduct.product_name}</h4>
            <p className="text-sm text-gray-600">Current selection</p>
          </div>
        </div>
        
        {analysis && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-sage-green">{analysis.healthScore}</div>
              <div className="text-xs text-gray-600">Health Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">{currentProduct.nutriments.sugars_100g}g</div>
              <div className="text-xs text-gray-600">Sugar/100g</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">{currentProduct.nutriments.fat_100g}g</div>
              <div className="text-xs text-gray-600">Fat/100g</div>
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {analysis?.warnings && analysis.warnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-800">Health Warnings</h4>
          </div>
          <ul className="space-y-1">
            {analysis.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-orange-700">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Recommendation */}
      {topRecommendation && (
        <div className="bg-gradient-to-r from-sage-green/10 to-light-green/10 border-2 border-sage-green/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <StarIcon className="w-5 h-5 text-sage-green" />
            <h4 className="font-semibold text-sage-green">Top AI Recommendation</h4>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getGradeColor(topRecommendation.nutrition_grades)}`}>
              {topRecommendation.nutrition_grades}
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{topRecommendation.product_name}</h5>
              <p className="text-sm text-gray-600">
                {topRecommendation.nutriments.sugars_100g}g sugar • {topRecommendation.nutriments.fat_100g}g fat
              </p>
            </div>
            <button
              onClick={() => onProductSelect?.(topRecommendation)}
              className="bg-sage-green hover:bg-sage-green/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Select
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alternative Products */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <HeartIcon className="w-5 h-5 text-sage-green" />
          Healthier Alternatives
        </h4>
        
        {alternatives.map((alt, index) => (
          <div key={index} className="bg-cream border border-light-green rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getGradeColor(alt.product.nutrition_grades)}`}>
                {alt.product.nutrition_grades}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-gray-900">{alt.product.product_name}</h5>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">{alt.matchScore}% match</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{alt.reason}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getImprovementIcon(alt.improvement)}</span>
                  <span className="text-sm font-medium text-sage-green">{alt.improvement}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{alt.product.nutriments.sugars_100g}g</div>
                    <div className="text-gray-600">Sugar</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{alt.product.nutriments.fat_100g}g</div>
                    <div className="text-gray-600">Fat</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{alt.product.nutriments.salt_100g}g</div>
                    <div className="text-gray-600">Salt</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onProductSelect?.(alt.product)}
                className="bg-sage-green hover:bg-sage-green/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Choose
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-light-green/20 border border-light-green rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sage-green" />
            AI Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-sage-green rounded-full mt-2 flex-shrink-0"></div>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
