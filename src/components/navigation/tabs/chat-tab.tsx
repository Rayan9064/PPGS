'use client';

import { useWeb } from '@/components/providers/web-provider';
import { AIChatAssistant } from '@/components/ai/ai-chat-assistant';
import { ProductData } from '@/types';
import { QrCodeIcon, SparklesIcon } from '@heroicons/react/24/outline';
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
    <div className="flex-1 w-full bg-warm-white flex flex-col">
      {/* Header */}
      <div className="w-full bg-cream border-b border-light-green">
        <div className="px-4 py-4 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900">AI Nutrition Assistant</h1>
              <p className="text-sm text-gray-600">Powered by blockchain data</p>
            </div>
            <button
              onClick={handleScanPress}
              className="bg-sage-green hover:bg-sage-green/90 text-white p-3 rounded-xl transition-colors shadow-lg"
            >
              <QrCodeIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      {showAIAssistant && (
        <div className="flex-1">
          <AIChatAssistant 
            currentProduct={currentProduct || undefined}
            onProductSelect={handleProductSelect}
          />
          </div>
        )}

      {/* Quick Actions */}
      <div className="bg-cream border-t border-light-green p-4">
        <div className="flex gap-2 overflow-x-auto">
                <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-light-green hover:bg-light-green/80 text-gray-800 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {showAIAssistant ? 'Hide AI' : 'Show AI'}
                </button>
          <button
            onClick={handleScanPress}
            className="bg-sage-green hover:bg-sage-green/90 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <QrCodeIcon className="w-4 h-4" />
            Scan Product
          </button>
        </div>
      </div>
    </div>
  );
};