'use client';

import { aiService } from '@/lib/ai-service';
import { useUserData } from '@/components/providers/user-data-provider';
import { getUserBlockchainStats, getGlobalBlockchainStats } from '@/lib/contract-service';
import { ProductData } from '@/types';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  LightBulbIcon,
  ChartBarIcon,
  HeartIcon,
  CubeIcon,
  DocumentChartBarIcon
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
  type?: 'analysis' | 'recommendation' | 'general' | 'blockchain';
  blockchainData?: {
    userScans?: string;
    globalStats?: { products: string; scans: string };
    txId?: string;
  };
}

interface AIChatAssistantProps {
  currentProduct?: ProductData;
  onProductSelect?: (productName: string) => void;
}

export const AIChatAssistant = ({ currentProduct, onProductSelect }: AIChatAssistantProps) => {
  const { userData, blockchainStats } = useUserData();
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
          // Generate personalized Nutri Bro welcome message with blockchain context
          let welcomeContent = await aiService.generateNutriBroWelcome(userData);
          
          // Add blockchain context if available
          if (blockchainStats.isOptedIn && blockchainStats.userStats) {
            welcomeContent += `\n\n🔗 I can see you're using our blockchain features! You have ${blockchainStats.userStats.scanCount} scans recorded on the blockchain. This helps me give you more personalized recommendations based on your verified scan history!`;
          } else if (blockchainStats.globalStats) {
            welcomeContent += `\n\n🌐 Our community has scanned ${blockchainStats.globalStats.totalScans} products and added ${blockchainStats.globalStats.totalProducts} to our blockchain database. Join the network to get personalized tracking!`;
          }
          
          const welcomeMessage: ChatMessage = {
            id: 'nutri-bro-welcome',
            role: 'assistant',
            content: welcomeContent,
            timestamp: new Date(),
            suggestions: [
              'Analyze my current product',
              'Help me reach my health goals',
              'Show my blockchain scan history',
              'Show me my nutrition progress',
              'Find healthier alternatives'
            ],
            type: 'general',
            blockchainData: blockchainStats.isOptedIn ? {
              userScans: blockchainStats.userStats?.scanCount.toString(),
              globalStats: {
                products: blockchainStats.globalStats?.totalProducts.toString() || '0',
                scans: blockchainStats.globalStats?.totalScans.toString() || '0'
              }
            } : undefined
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
  }, [messages.length, userData, blockchainStats]);

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
      // Handle blockchain-specific queries
      if (suggestion.toLowerCase().includes('blockchain') || suggestion.toLowerCase().includes('scan history')) {
        await handleBlockchainQuery(suggestion);
        return;
      }

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

      // Enhanced context with blockchain data
      const enhancedContext = {
        userProfile: userProfileForAI,
        currentProduct,
        conversationHistory,
        blockchainData: blockchainStats.isOptedIn ? {
          userScans: blockchainStats.userStats?.scanCount.toString() || '0',
          lastScannedProduct: blockchainStats.userStats?.lastScannedProduct.toString(),
          globalProducts: blockchainStats.globalStats?.totalProducts.toString() || '0',
          globalScans: blockchainStats.globalStats?.totalScans.toString() || '0',
          isOptedIn: true
        } : {
          isOptedIn: false,
          availableFeatures: 'Connect wallet to enable blockchain tracking'
        }
      };

      // Call Nutri Bro AI service with comprehensive context
      const response = await aiService.chatWithAI(suggestion, enhancedContext);

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

  const handleBlockchainQuery = async (query: string) => {
    try {
      let response = '';
      let messageType: ChatMessage['type'] = 'blockchain';
      let blockchainData = undefined;

      if (!blockchainStats.isOptedIn) {
        response = `🔗 **Blockchain Features Not Enabled**\n\nYou haven't opted into our blockchain features yet! Here's what you're missing:\n\n✨ **Benefits of Blockchain Tracking:**\n• Permanent, verified scan history\n• Contribute to global nutrition database\n• Get insights based on community data\n• Earn transparency in your nutrition journey\n\n🚀 **Get Started:**\nConnect your wallet and opt-in from your profile to start tracking your scans on the Algorand blockchain!\n\n📊 **Global Stats:**\nOur community has already scanned ${blockchainStats.globalStats?.totalScans || 0} products and added ${blockchainStats.globalStats?.totalProducts || 0} to the database!`;
        
        blockchainData = {
          globalStats: {
            products: blockchainStats.globalStats?.totalProducts.toString() || '0',
            scans: blockchainStats.globalStats?.totalScans.toString() || '0'
          }
        };
      } else {
        const userScans = blockchainStats.userStats?.scanCount.toString() || '0';
        const lastProduct = blockchainStats.userStats?.lastScannedProduct.toString() || 'None';
        const globalProducts = blockchainStats.globalStats?.totalProducts.toString() || '0';
        const globalScans = blockchainStats.globalStats?.totalScans.toString() || '0';

        response = `🔗 **Your Blockchain Scan History**\n\n📱 **Your Stats:**\n• Total scans recorded: **${userScans}**\n• Last scanned product ID: **#${lastProduct}**\n• Blockchain status: **Active & Verified** ✅\n\n🌐 **Global Community Stats:**\n• Total products in database: **${globalProducts}**\n• Total community scans: **${globalScans}**\n• Your contribution: **${userScans}** scans\n\n💡 **Your Impact:**\nEvery scan you make helps build a more transparent food database for everyone! Your data is permanently stored on the Algorand blockchain, ensuring it can never be lost or tampered with.\n\n🎯 **What this means for you:**\n• More accurate personalized recommendations\n• Verified nutrition tracking\n• Contributing to food transparency\n• Building your nutrition credibility`;

        blockchainData = {
          userScans,
          globalStats: {
            products: globalProducts,
            scans: globalScans
          }
        };
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: blockchainStats.isOptedIn ? [
          'Analyze my scanning patterns',
          'Compare with community averages',
          'Show my nutrition progress',
          'Find similar users'
        ] : [
          'How do I enable blockchain features?',
          'What are the benefits?',
          'Is my data secure?',
          'How do I connect my wallet?'
        ],
        type: messageType,
        blockchainData
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Blockchain query error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '😅 Sorry, I had trouble accessing your blockchain data. Please try again or check your wallet connection!',
        timestamp: new Date(),
        suggestions: ['Try again', 'Check wallet connection', 'View profile settings'],
        type: 'blockchain'
      };
      setMessages(prev => [...prev, errorMessage]);
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
      case 'blockchain':
        return <CubeIcon className="w-5 h-5 text-blue-600" />;
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
                  : message.type === 'blockchain'
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-gray-900'
                  : 'bg-cream border border-light-green text-gray-900'
              }`}
            >
              {/* Blockchain badge */}
              {message.type === 'blockchain' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200">
                  <CubeIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Blockchain Data
                  </span>
                </div>
              )}
              
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {message.content}
              </div>
              
              {/* Blockchain stats display */}
              {message.blockchainData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentChartBarIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Quick Stats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {message.blockchainData.userScans && (
                      <div className="text-blue-600">
                        <span className="font-medium">Your Scans:</span> {message.blockchainData.userScans}
                      </div>
                    )}
                    {message.blockchainData.globalStats && (
                      <>
                        <div className="text-blue-600">
                          <span className="font-medium">Global Products:</span> {message.blockchainData.globalStats.products}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">Global Scans:</span> {message.blockchainData.globalStats.scans}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
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
