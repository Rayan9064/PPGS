'use client';

import { useTelegram } from '@/components/providers/telegram-provider';
import { ProductData } from '@/types';
import { PaperAirplaneIcon, QrCodeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

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
      content: "Hi! I&apos;m your nutrition assistant. I can help you understand product labels, suggest healthier alternatives, and answer any food-related questions. Try scanning a product or ask me anything!",
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
    <div className="flex-1 w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-purple-100 dark:border-gray-700">
        <div className="px-2 sm:px-4 py-3 sm:py-4 pt-4 sm:pt-8">
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-in-up">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg float-animation">
              <SparklesIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">AI Nutrition Assistant</h1>
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium hidden sm:block">Ask me anything about nutrition and food</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages */}
      <div className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6 no-scrollbar">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border border-white/50 dark:border-gray-600/50'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Assistant</span>
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-lg border border-white/50 dark:border-gray-600/50 px-5 py-4 rounded-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Assistant</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/50 dark:border-gray-600/50">
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Try asking me one of these:</p>
              </div>
            </div>
            <div className="grid gap-2 sm:gap-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-600/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium flex-1">{question}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Product Context */}
        {currentProduct && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <QrCodeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Recently Scanned</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1 sm:mb-2 truncate">
              {currentProduct.product_name || 'Unknown Product'}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Ask me about this product&apos;s nutrition or ingredients!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-purple-100 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleScanPress}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex-shrink-0"
          >
            <QrCodeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about nutrition, ingredients, or health..."
              className="flex-1 border border-purple-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg transition-all duration-300"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
