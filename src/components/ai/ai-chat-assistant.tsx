'use client';

import { aiService } from '@/lib/ai-service';
import { useUserData } from '@/components/providers/user-data-provider';
import { ProductData } from '@/types';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  LightBulbIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  relatedProducts?: string[];
  type?: 'analysis' | 'recommendation' | 'general';
}

interface AIChatAssistantProps {
  currentProduct?: ProductData;
  onProductSelect?: (productName: string) => void;
}

export const AIChatAssistant = ({ currentProduct, onProductSelect }: AIChatAssistantProps) => {
  const { userData } = useUserData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with Nutri Bro welcome message
  useEffect(() => {
    const initializeNutriBro = async () => {
      if (messages.length === 0 && userData) {
        try {
          // Generate personalized Nutri Bro welcome message
          const welcomeContent = await aiService.generateNutriBroWelcome(userData);
          
          const welcomeMessage: ChatMessage = {
            id: 'nutri-bro-welcome',
            role: 'assistant',
            content: welcomeContent,
            timestamp: new Date(),
            suggestions: [
              'Analyze my current product',
              'Help me reach my health goals',
              'Show me my nutrition progress',
              'Find healthier alternatives'
            ],
            type: 'general'
          };
          setMessages([welcomeMessage]);
        } catch (error) {
          console.error('Failed to generate Nutri Bro welcome:', error);
          // Fallback welcome message
          const fallbackWelcome: ChatMessage = {
            id: 'welcome',
            role: 'assistant',
            content: `Hey there, ${userData.firstName}! 🌟 I'm Nutri Bro, your personal health and nutrition buddy! I'm here to help you make awesome nutrition choices and crush your health goals! What can I help you with today? 💪`,
            timestamp: new Date(),
            suggestions: [
              'Analyze my current product',
              'Help me with nutrition tips',
              'Show me healthier alternatives',
              'Check my health progress'
            ],
            type: 'general'
          };
          setMessages([fallbackWelcome]);
        }
      }
    };

    initializeNutriBro();
  }, [messages.length, userData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    
    // Set the input and trigger sending
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Ensure we have valid user data
      const userProfileForAI = userData || {
        telegramId: 'demo-user',
        firstName: 'Demo User',
        createdAt: new Date(),
        updatedAt: new Date(),
        healthGoals: [],
        dietaryRestrictions: [],
        medicalConditions: []
      };

      // Call Nutri Bro AI service with context
      const response = await aiService.chatWithAI(suggestion, {
        userProfile: userProfileForAI,
        currentProduct,
        conversationHistory
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestions: response.suggestions,
        relatedProducts: response.relatedProducts,
        type: 'general'
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Ensure we have valid user data
      const userProfileForAI = userData || {
        telegramId: 'demo-user',
        firstName: 'Demo User',
        createdAt: new Date(),
        updatedAt: new Date(),
        healthGoals: [],
        dietaryRestrictions: [],
        medicalConditions: []
      };

      // Call Nutri Bro AI service with comprehensive context
      const response = await aiService.chatWithAI(messageToSend, {
        userProfile: userProfileForAI,
        currentProduct,
        conversationHistory
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestions: response.suggestions,
        relatedProducts: response.relatedProducts,
        type: 'general'
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productName: string) => {
    if (onProductSelect) {
      onProductSelect(productName);
    }
    toast.success(`Looking up ${productName}...`);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'analysis':
        return <ChartBarIcon className="w-5 h-5 text-sage-green" />;
      case 'recommendation':
        return <LightBulbIcon className="w-5 h-5 text-light-green" />;
      default:
        return <SparklesIcon className="w-5 h-5 text-sage-green" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-warm-white">
      {/* Header */}
      <div className="bg-cream border-b border-light-green p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Nutri Bro</h2>
            <p className="text-sm text-gray-600">Your personal health assistant</p>
          </div>
        </div>
        {currentProduct && (
          <div className="mt-3 p-3 bg-light-green/20 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Current Product:</strong> {currentProduct.product_name} 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium grade-${currentProduct.nutrition_grades.toLowerCase()}`}>
                Grade {currentProduct.nutrition_grades}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center flex-shrink-0">
                {getMessageIcon(message.type)}
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-sage-green text-white'
                  : 'bg-cream border border-light-green text-gray-900'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {message.content}
              </div>
              
              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-light-green/30 hover:bg-light-green/50 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Products */}
              {message.relatedProducts && message.relatedProducts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Related products:</p>
                  <div className="space-y-1">
                    {message.relatedProducts.map((product, index) => (
                      <button
                        key={index}
                        onClick={() => handleProductClick(product)}
                        className="text-xs bg-sage-green/20 hover:bg-sage-green/30 text-sage-green px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                      >
                        <HeartIcon className="w-3 h-3" />
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">U</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="bg-cream border border-light-green rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-sage-green rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sage-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-sage-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-light-green p-4 bg-cream">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about nutrition, products, or health..."
            className="flex-1 px-4 py-3 border border-light-green rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent bg-warm-white text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-sage-green hover:bg-sage-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => handleSuggestionClick('Analyze my current product')}
            className="text-xs bg-light-green/30 hover:bg-light-green/50 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            🔍 Analyze Product
          </button>
          <button
            onClick={() => handleSuggestionClick('Give me nutrition tips')}
            className="text-xs bg-light-green/30 hover:bg-light-green/50 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            💡 Nutrition Tips
          </button>
          <button
            onClick={() => handleSuggestionClick('Show me healthier alternatives')}
            className="text-xs bg-light-green/30 hover:bg-light-green/50 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            🌱 Alternatives
          </button>
          <button
            onClick={() => handleSuggestionClick('Check my consumption patterns')}
            className="text-xs bg-light-green/30 hover:bg-light-green/50 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            📊 My Patterns
          </button>
        </div>
      </div>
    </div>
  );
};
