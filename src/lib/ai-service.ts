import { ProductData, UserData } from '@/types';
import { AI_CONFIG } from '@/config/ai-config';

// AI Service for NutriGrade - Integrates with blockchain data
export class AIService {
  private static instance: AIService;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = AI_CONFIG.DEFAULT_API_KEY;
    this.baseUrl = AI_CONFIG.DEFAULT_BASE_URL;
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * AI-Powered Nutrition Data Verification
   * Analyzes and verifies product data before blockchain storage
   */
  async verifyNutritionData(productData: ProductData): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
    verifiedData: ProductData;
  }> {
    try {
      const prompt = `
        Analyze this nutrition product data for accuracy and consistency:
        
        Product: ${productData.product_name}
        Ingredients: ${productData.ingredients_text}
        Nutrition per 100g:
        - Sugar: ${productData.nutriments.sugars_100g}g
        - Fat: ${productData.nutriments.fat_100g}g
        - Salt: ${productData.nutriments.salt_100g}g
        - Energy: ${productData.nutriments.energy_100g || 'N/A'}kcal
        
        Grade: ${productData.nutrition_grades}
        
        Please verify:
        1. Are the nutrition values consistent with the ingredients?
        2. Does the grade match the nutritional content?
        3. Are there any red flags or inconsistencies?
        4. Suggest improvements if needed.
        
        Respond in JSON format:
        {
          "isValid": boolean,
          "confidence": number (0-100),
          "issues": ["issue1", "issue2"],
          "suggestions": ["suggestion1", "suggestion2"],
          "verifiedData": { corrected product data }
        }
      `;

      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI verification failed:', error);
      return {
        isValid: true,
        confidence: 50,
        issues: ['AI verification unavailable'],
        suggestions: ['Manual verification recommended'],
        verifiedData: productData
      };
    }
  }

  /**
   * Personalized Nutrition Recommendations
   * Based on user profile and blockchain data
   */
  async getPersonalizedRecommendations(
    userProfile: UserData,
    currentProduct: ProductData,
    consumptionHistory: any[]
  ): Promise<{
    recommendations: string[];
    healthScore: number;
    warnings: string[];
    alternatives: string[];
  }> {
    try {
      const prompt = `
        Based on this user profile and product data, provide personalized nutrition recommendations:
        
        User Profile:
        - Age: ${userProfile.age || 'Not specified'}
        - Health Goals: ${userProfile.healthGoals?.join(', ') || 'General health'}
        - Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
        - Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'None'}
        - Activity Level: ${userProfile.activityLevel || 'Not specified'}
        
        Current Product: ${currentProduct.product_name}
        Nutrition Grade: ${currentProduct.nutrition_grades}
        Sugar: ${currentProduct.nutriments.sugars_100g}g/100g
        Fat: ${currentProduct.nutriments.fat_100g}g/100g
        Salt: ${currentProduct.nutriments.salt_100g}g/100g
        
        Recent Consumption: ${consumptionHistory.length} products scanned
        
        Provide:
        1. Personalized recommendations for this product
        2. Health score (0-100) based on user profile
        3. Any warnings or concerns
        4. Suggested alternatives or modifications
        
        Respond in JSON format:
        {
          "recommendations": ["rec1", "rec2"],
          "healthScore": number,
          "warnings": ["warning1", "warning2"],
          "alternatives": ["alt1", "alt2"]
        }
      `;

      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI recommendations failed:', error);
      return {
        recommendations: ['Maintain a balanced diet'],
        healthScore: 75,
        warnings: [],
        alternatives: []
      };
    }
  }

  /**
   * Smart Alternative Product Suggestions
   * AI-driven healthier alternatives
   */
  async getSmartAlternatives(
    currentProduct: ProductData,
    userProfile: UserData,
    availableProducts: ProductData[]
  ): Promise<{
    alternatives: Array<{
      product: ProductData;
      reason: string;
      improvement: string;
      matchScore: number;
    }>;
    topRecommendation: ProductData | null;
  }> {
    try {
      const prompt = `
        Find healthier alternatives for this product based on user preferences:
        
        Current Product: ${currentProduct.product_name}
        Grade: ${currentProduct.nutrition_grades}
        Sugar: ${currentProduct.nutriments.sugars_100g}g
        Fat: ${currentProduct.nutriments.fat_100g}g
        Salt: ${currentProduct.nutriments.salt_100g}g
        
        User Preferences:
        - Dietary: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
        - Health Goals: ${userProfile.healthGoals?.join(', ') || 'General health'}
        - Allergies: ${userProfile.medicalConditions?.join(', ') || 'None'}
        
        Available Products: ${availableProducts.map(p => `${p.product_name} (${p.nutrition_grades})`).join(', ')}
        
        Find 3-5 better alternatives with:
        1. Better nutrition grade
        2. Lower sugar/fat/salt content
        3. Match user preferences
        4. Explain why it's better
        
        Respond in JSON format:
        {
          "alternatives": [
            {
              "productName": "string",
              "reason": "string",
              "improvement": "string",
              "matchScore": number
            }
          ],
          "topRecommendation": "product name"
        }
      `;

      const response = await this.callAI(prompt);
      const result = JSON.parse(response);
      
      // Map product names back to actual ProductData objects
      const alternatives = result.alternatives.map((alt: any) => ({
        product: availableProducts.find(p => p.product_name === alt.productName),
        reason: alt.reason,
        improvement: alt.improvement,
        matchScore: alt.matchScore
      })).filter((alt: any) => alt.product);

      return {
        alternatives,
        topRecommendation: availableProducts.find(p => p.product_name === result.topRecommendation) || null
      };
    } catch (error) {
      console.error('AI alternatives failed:', error);
      return {
        alternatives: [],
        topRecommendation: null
      };
    }
  }

  /**
   * AI Chat Assistant
   * Conversational nutrition advice
   */
  async chatWithAI(
    message: string,
    context: {
      userProfile: UserData;
      currentProduct?: ProductData;
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    }
  ): Promise<{
    response: string;
    suggestions: string[];
    relatedProducts: string[];
  }> {
    try {
      const systemPrompt = `
        You are NutriGrade AI, a helpful nutrition assistant integrated with blockchain technology.
        
        User Profile:
        - Health Goals: ${context.userProfile.healthGoals?.join(', ') || 'General health'}
        - Dietary Restrictions: ${context.userProfile.dietaryRestrictions?.join(', ') || 'None'}
        - Medical Conditions: ${context.userProfile.medicalConditions?.join(', ') || 'None'}
        
        ${context.currentProduct ? `Current Product: ${context.currentProduct.product_name} (Grade: ${context.currentProduct.nutrition_grades})` : ''}
        
        Provide helpful, accurate nutrition advice. Be conversational but professional.
        Suggest related products when relevant.
      `;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-5), // Last 5 messages for context
        { role: 'user', content: message }
      ];

      const response = await this.callAI(messages);
      
      // Extract suggestions and related products from response
      const suggestions = this.extractSuggestions(response);
      const relatedProducts = this.extractRelatedProducts(response);

      return {
        response: response,
        suggestions,
        relatedProducts
      };
    } catch (error) {
      console.error('AI chat failed:', error);
      return {
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
        suggestions: ['How can I help with nutrition?', 'Tell me about your dietary goals'],
        relatedProducts: []
      };
    }
  }

  /**
   * Consumption Pattern Analysis
   * Analyze user's eating patterns and provide insights
   */
  async analyzeConsumptionPatterns(
    userProfile: UserData,
    consumptionHistory: any[]
  ): Promise<{
    insights: string[];
    trends: {
      averageGrade: string;
      sugarTrend: 'increasing' | 'decreasing' | 'stable';
      healthScore: number;
    };
    recommendations: string[];
    challenges: Array<{
      title: string;
      description: string;
      target: string;
      progress: number;
    }>;
  }> {
    try {
      const prompt = `
        Analyze this user's consumption patterns and provide insights:
        
        User Profile:
        - Health Goals: ${userProfile.healthGoals?.join(', ') || 'General health'}
        - Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
        - Activity Level: ${userProfile.activityLevel || 'Not specified'}
        
        Consumption History (last ${consumptionHistory.length} products):
        ${consumptionHistory.map(item => 
          `${item.product.product_name} - Grade: ${item.product.nutrition_grades} - Sugar: ${item.product.nutriments.sugars_100g}g`
        ).join('\n')}
        
        Provide:
        1. Key insights about eating patterns
        2. Trends in nutrition grades and sugar consumption
        3. Personalized recommendations
        4. Fun challenges to improve habits
        
        Respond in JSON format:
        {
          "insights": ["insight1", "insight2"],
          "trends": {
            "averageGrade": "B",
            "sugarTrend": "decreasing",
            "healthScore": 78
          },
          "recommendations": ["rec1", "rec2"],
          "challenges": [
            {
              "title": "Challenge Name",
              "description": "Description",
              "target": "Target",
              "progress": 65
            }
          ]
        }
      `;

      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        insights: ['Keep up the good work with your nutrition choices!'],
        trends: {
          averageGrade: 'B',
          sugarTrend: 'stable',
          healthScore: 75
        },
        recommendations: ['Continue making healthy choices'],
        challenges: []
      };
    }
  }

  /**
   * Private method to call AI API
   */
  private async callAI(prompt: string | any[]): Promise<string> {
    // For demo purposes, we'll simulate AI responses
    // In production, this would call OpenAI, Anthropic, or another AI service
    
    if (Array.isArray(prompt)) {
      // Chat completion
      const lastMessage = prompt[prompt.length - 1].content;
      return this.simulateChatResponse(lastMessage);
    } else {
      // Single prompt
      return this.simulateAIResponse(prompt);
    }
  }

  /**
   * Simulate AI responses for demo purposes
   */
  private simulateAIResponse(prompt: string): string {
    if (prompt.includes('verify')) {
      return JSON.stringify({
        isValid: true,
        confidence: 85,
        issues: [],
        suggestions: ['Product data looks accurate'],
        verifiedData: {}
      });
    } else if (prompt.includes('recommendations')) {
      return JSON.stringify({
        recommendations: ['This product fits well with your health goals', 'Consider portion control'],
        healthScore: 82,
        warnings: [],
        alternatives: ['Look for lower-sugar alternatives']
      });
    } else if (prompt.includes('alternatives')) {
      return JSON.stringify({
        alternatives: [
          {
            productName: 'Organic Whole Grain Bread',
            reason: 'Lower sugar content',
            improvement: 'Reduced sugar by 40%',
            matchScore: 92
          }
        ],
        topRecommendation: 'Organic Whole Grain Bread'
      });
    } else if (prompt.includes('analyze')) {
      return JSON.stringify({
        insights: ['You\'re making great progress!', 'Your sugar intake has decreased'],
        trends: {
          averageGrade: 'B+',
          sugarTrend: 'decreasing',
          healthScore: 78
        },
        recommendations: ['Keep choosing B+ and A grade products'],
        challenges: [
          {
            title: 'Sugar Reduction Challenge',
            description: 'Reduce daily sugar intake',
            target: 'Under 25g per day',
            progress: 65
          }
        ]
      });
    }
    
    return JSON.stringify({ response: 'AI analysis completed' });
  }

  private simulateChatResponse(message: string): string {
    const responses = [
      'That\'s a great question about nutrition! Based on your profile, I\'d recommend focusing on whole foods.',
      'I can help you find healthier alternatives. What specific nutrients are you concerned about?',
      'Your consumption patterns show improvement! Keep up the good work.',
      'Let me suggest some products that align with your dietary goals.',
      'Based on your health goals, here are some personalized recommendations...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private extractSuggestions(response: string): string[] {
    // Extract suggestions from AI response
    return [
      'How can I help with nutrition?',
      'Tell me about your dietary goals',
      'Show me healthier alternatives'
    ];
  }

  private extractRelatedProducts(response: string): string[] {
    // Extract related products from AI response
    return [
      'Organic Whole Grain Bread',
      'Low-Sugar Yogurt',
      'Fresh Vegetables'
    ];
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
