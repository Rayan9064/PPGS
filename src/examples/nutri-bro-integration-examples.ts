/**
 * Sample integration guide for Nutri Bro AI
 * This file shows how to integrate the enhanced AI service in other components
 */

import { aiService } from '@/lib/ai-service';
import { useUserData } from '@/components/providers/user-data-provider';
import { ProductData } from '@/types';

// Example 1: Product Analysis with Nutri Bro
export const useProductAnalysis = () => {
  const { userData } = useUserData();

  const analyzeProduct = async (product: ProductData) => {
    if (!userData) return null;

    try {
      // Get personalized recommendations from Nutri Bro
      const recommendations = await aiService.getPersonalizedRecommendations(
        userData,
        product,
        [] // consumption history will be loaded automatically
      );

      return {
        healthScore: recommendations.healthScore,
        personalizedAdvice: recommendations.recommendations,
        warnings: recommendations.warnings,
        alternatives: recommendations.alternatives
      };
    } catch (error) {
      console.error('Product analysis failed:', error);
      return null;
    }
  };

  return { analyzeProduct };
};

// Example 2: Chat with Nutri Bro
export const useNutriBroChat = () => {
  const { userData } = useUserData();

  const chatWithNutriBro = async (
    message: string, 
    currentProduct?: ProductData,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ) => {
    if (!userData) {
      return {
        response: "Hey! I'd love to help, but I need to get to know you first. Please complete your profile setup so I can give you personalized nutrition advice! 💪",
        suggestions: ['Complete your profile', 'Set health goals', 'Add dietary preferences'],
        relatedProducts: []
      };
    }

    try {
      return await aiService.chatWithAI(message, {
        userProfile: userData,
        currentProduct,
        conversationHistory
      });
    } catch (error) {
      console.error('Nutri Bro chat failed:', error);
      return {
        response: "Oops! I'm having a little trouble right now. Let's try that again! 🔄",
        suggestions: ['Try asking again', 'Check your internet connection'],
        relatedProducts: []
      };
    }
  };

  const generateWelcome = async () => {
    if (!userData) return "Hey there! Welcome to NutriGrade! 🌟";
    
    try {
      return await aiService.generateNutriBroWelcome(userData);
    } catch (error) {
      console.error('Welcome generation failed:', error);
      return `Hey ${userData.firstName}! 🌟 I'm Nutri Bro, your personal health buddy! Ready to crush your health goals together? 💪`;
    }
  };

  return { chatWithNutriBro, generateWelcome };
};

// Example 3: Health Progress Analysis
export const useHealthProgress = () => {
  const { userData } = useUserData();

  const analyzeProgress = async () => {
    if (!userData) return null;

    try {
      // Get consumption history
      const consumptionHistory = JSON.parse(
        localStorage.getItem('nutripal-consumption-history') || '[]'
      );

      // Analyze consumption patterns with Nutri Bro
      const analysis = await aiService.analyzeConsumptionPatterns(
        userData,
        consumptionHistory
      );

      return {
        insights: analysis.insights,
        trends: analysis.trends,
        recommendations: analysis.recommendations,
        challenges: analysis.challenges
      };
    } catch (error) {
      console.error('Progress analysis failed:', error);
      return null;
    }
  };

  return { analyzeProgress };
};

// Example 4: Component Integration Pattern
export const NutriBroIntegratedComponent = ({ product }: { product?: ProductData }) => {
  const { userData } = useUserData();
  const { chatWithNutriBro, generateWelcome } = useNutriBroChat();
  const { analyzeProduct } = useProductAnalysis();

  const handleUserQuestion = async (question: string) => {
    // Chat with Nutri Bro about the question
    const response = await chatWithNutriBro(question, product);
    
    // Response will be personalized based on:
    // - User's age, weight, height, BMI
    // - Health goals (weight loss, improve health, etc.)
    // - Dietary restrictions (vegetarian, gluten-free, etc.)
    // - Medical conditions and allergies
    // - Past consumption history and patterns
    // - Current product being discussed
    
    return response;
  };

  const handleProductAnalysis = async () => {
    if (!product) return;
    
    // Get personalized analysis
    const analysis = await analyzeProduct(product);
    
    // Analysis will include:
    // - Health score based on user's profile
    // - Personalized advice considering their goals
    // - Warnings relevant to their conditions
    // - Alternative suggestions matching their preferences
    
    return analysis;
  };

  // Component would render UI based on these handlers
  return null; // Placeholder for actual component JSX
};

// Example 5: Available Nutri Bro Features
export const NUTRI_BRO_FEATURES = {
  personalizedGreeting: 'Welcome message with user name and context',
  healthFocusedConversation: 'Only health/nutrition topics allowed',
  userAwareResponses: 'References specific user data in responses',
  motivationalTone: 'Encouraging and supportive personality',
  contextualAdvice: 'Advice based on health goals and restrictions',
  consumptionAnalysis: 'Analyzes eating patterns and trends',
  productRecommendations: 'Suggests alternatives based on preferences',
  goalTracking: 'Helps track progress towards health goals',
  nutritionEducation: 'Explains nutrition concepts clearly',
  safetyFirst: 'Redirects non-health topics back to wellness'
};

// Example 6: Integration Best Practices
export const INTEGRATION_BEST_PRACTICES = {
  alwaysCheckUserData: 'Verify userData exists before calling AI service',
  handleErrors: 'Provide fallback responses for AI service failures',
  loadContext: 'User context is automatically loaded by the service',
  respectBoundaries: 'Nutri Bro will redirect non-health topics',
  usePersonalization: 'Responses will reference user-specific data',
  maintainContext: 'Pass conversation history for better responses',
  leverageFeatures: 'Use specialized methods for different use cases'
};