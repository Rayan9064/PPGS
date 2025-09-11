'use client';

import { useWeb } from '@/components/providers/web-provider';
import { AIChatAssistant } from '@/components/ai/ai-chat-assistant';
import { ProductData } from '@/types';
import { QrCodeIcon, SparklesIcon, ArrowLeftIcon, MicrophoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ChatTabProps {
  currentProduct: ProductData | null;
  onScanProduct: () => void;
}

export const ChatTab = ({ currentProduct, onScanProduct }: ChatTabProps) => {
  const { hapticFeedback } = useWeb();
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  const handleProductSelect = (productName: string) => {
    // Handle product selection from AI suggestions
    console.log('Selected product:', productName);
  };

  const handleScanPress = () => {
    hapticFeedback.impact('medium');
    onScanProduct();
  };

  return (
    <div className="flex-1 w-full bg-primary-50 flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 py-4 pt-12">
        <div className="flex items-center justify-between">
          <button className="p-2">
            <ArrowLeftIcon className="w-6 h-6 text-secondary-900" />
          </button>
          <h1 className="text-xl font-bold text-secondary-900">AI Nutrition Assistant</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scanned Product Section */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary-900 font-medium">Scanned Product</p>
            <p className="text-primary-500">Organic Apple</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant Component */}
      {showAIAssistant && (
        <div className="flex-1">
          <AIChatAssistant 
            currentProduct={currentProduct || undefined}
            onProductSelect={handleProductSelect}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-pink-100 hover:bg-pink-200 text-secondary-900 px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {showAIAssistant ? 'Hide AI' : 'Show AI'}
          </button>
          <button
            onClick={handleScanPress}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <QrCodeIcon className="w-4 h-4" />
            Scan Product
          </button>
        </div>
      </div>
    </div>
  );
};