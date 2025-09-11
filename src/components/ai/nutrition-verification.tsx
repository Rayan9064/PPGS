'use client';

import { aiService } from '@/lib/ai-service';
import { ProductData } from '@/types';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface NutritionVerificationProps {
  productData: ProductData;
  onVerified: (verifiedData: ProductData) => void;
  onClose?: () => void;
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  verifiedData: ProductData;
}

export const NutritionVerification = ({ productData, onVerified, onClose }: NutritionVerificationProps) => {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const result = await aiService.verifyNutritionData(productData);
      setVerification(result);
      
      if (result.isValid) {
        toast.success('Product data verified successfully!');
      } else {
        toast.error('Issues found in product data');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Failed to verify product data');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAcceptVerification = () => {
    if (verification) {
      onVerified(verification.verifiedData);
      toast.success('Product data accepted and ready for blockchain storage');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100';
    if (confidence >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-warm-white rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Nutrition Verification</h3>
            <p className="text-sm text-gray-600">Blockchain-ready data validation</p>
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

      {/* Product Info */}
      <div className="bg-cream border border-light-green rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">{productData.product_name}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Grade:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium grade-${productData.nutrition_grades.toLowerCase()}`}>
              {productData.nutrition_grades}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Sugar:</span>
            <span className="ml-2 font-medium">{productData.nutriments.sugars_100g}g/100g</span>
          </div>
          <div>
            <span className="text-gray-600">Fat:</span>
            <span className="ml-2 font-medium">{productData.nutriments.fat_100g}g/100g</span>
          </div>
          <div>
            <span className="text-gray-600">Salt:</span>
            <span className="ml-2 font-medium">{productData.nutriments.salt_100g}g/100g</span>
          </div>
        </div>
      </div>

      {/* Verification Button */}
      {!verification && (
        <div className="text-center">
          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="bg-sage-green hover:bg-sage-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            {isVerifying ? (
              <>
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5" />
                Verify with AI
              </>
            )}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            AI will analyze ingredient consistency and nutrition accuracy
          </p>
        </div>
      )}

      {/* Verification Results */}
      {verification && (
        <div className="space-y-4">
          {/* Status */}
          <div className={`rounded-xl p-4 ${verification.isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {verification.isValid ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              )}
              <div>
                <h4 className={`font-semibold ${verification.isValid ? 'text-green-800' : 'text-orange-800'}`}>
                  {verification.isValid ? 'Data Verified' : 'Issues Found'}
                </h4>
                <p className="text-sm text-gray-600">
                  Confidence: <span className={`font-medium ${getConfidenceColor(verification.confidence)}`}>
                    {verification.confidence}%
                  </span>
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  verification.confidence >= 80 ? 'bg-green-500' :
                  verification.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${verification.confidence}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
              >
                <InformationCircleIcon className="w-4 h-4" />
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>

          {/* Issues */}
          {verification.issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <XCircleIcon className="w-5 h-5" />
                Issues Found
              </h5>
              <ul className="space-y-1">
                {verification.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-700">• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {verification.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                AI Suggestions
              </h5>
              <ul className="space-y-1">
                {verification.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAcceptVerification}
              className="flex-1 bg-sage-green hover:bg-sage-green/90 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Accept & Store on Blockchain
            </button>
            <button
              onClick={() => setVerification(null)}
              className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors"
            >
              Re-verify
            </button>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {showDetails && verification && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h5 className="font-medium text-gray-900 mb-3">Detailed Analysis</h5>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ingredient Analysis:</span>
              <p className="text-gray-600 mt-1">
                AI analyzed {productData.ingredients_text?.split(',').length || 0} ingredients for consistency with nutrition values.
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Grade Validation:</span>
              <p className="text-gray-600 mt-1">
                Verified that grade {productData.nutrition_grades} matches the nutritional content.
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Regulatory Compliance:</span>
              <p className="text-gray-600 mt-1">
                Checked against food labeling standards and nutritional guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Integration Note */}
      <div className="bg-sage-green/10 border border-sage-green/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheckIcon className="w-5 h-5 text-sage-green" />
          <h5 className="font-medium text-sage-green">Blockchain Ready</h5>
        </div>
        <p className="text-sm text-gray-700">
          Verified data will be stored on Algorand blockchain with cryptographic proof of authenticity.
          This ensures data integrity and prevents tampering.
        </p>
      </div>
    </div>
  );
};
