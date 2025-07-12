'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { ProductData } from '@/types';
import { useTelegram } from '@/components/providers/telegram-provider';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTabProps {
  currentProduct: ProductData | null;
  onScanProduct: () => void;
}

export const ChatTab = ({ currentProduct, onScanProduct }: ChatTabProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your nutrition assistant. I can help you understand product labels, suggest healthier alternatives, and answer any food-related questions. Try scanning a product or ask me anything!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { hapticFeedback } = useTelegram();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    hapticFeedback.impact('light');

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on nutrition science, I'd recommend looking for products with lower sugar content (under 5g per 100g) and higher fiber content.",
        "I can help you with that! Would you like me to explain what each nutrient means for your health?",
        "For healthier alternatives, I suggest looking for products with grade A or B nutrition scores. They typically have better nutritional profiles.",
        "That product contains high levels of saturated fat. Consider alternatives with more unsaturated fats like olive oil or nuts.",
        "Great choice on scanning that product! The nutrition grade gives you a quick overview of its healthiness. Would you like me to explain the specific nutrients?",
      ];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      hapticFeedback.notification('success');
    }, 1000 + Math.random() * 2000);
  };

  const handleScanPress = () => {
    hapticFeedback.impact('medium');
    onScanProduct();
  };

  const suggestedQuestions = [
    "What makes a product healthy?",
    "How do I read nutrition labels?",
    "What's a good sugar limit per day?",
    "Explain nutrition grades",
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Nutrition Assistant</h1>
              <p className="text-gray-600">Ask me anything about nutrition and food</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-emerald-100' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-sm border border-gray-100 px-4 py-3 rounded-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">AI Assistant</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions (only show when no messages besides welcome) */}
        {messages.length === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Try asking me one of these:</p>
            <div className="grid gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="bg-white border border-gray-200 rounded-xl p-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Context */}
        {currentProduct && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCodeIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Recently Scanned</span>
            </div>
            <p className="text-sm text-emerald-700">
              {currentProduct.product_name || 'Unknown Product'}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Ask me about this product's nutrition or ingredients!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <button
            onClick={handleScanPress}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-600 p-3 rounded-xl transition-colors"
          >
            <QrCodeIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about nutrition, ingredients, or health..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
