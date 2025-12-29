import { ProductData, UserData } from '@/types';

// Clean AI Service for NutriGrade - Nutrition analysis with Groq
export class AIService {
  private static instance: AIService;
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.3-70b-versatile';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ NEXT_PUBLIC_GROQ_API_KEY not set. AI features will be limited.');
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * AI Chat Assistant - Nutrition focused conversations only
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
  }> {
    try {
      // Check if nutrition/food related
      if (!this.isNutritionRelated(message)) {
        return {
          response: `Hey! I'm your nutrition buddy 🥗 I focus on helping you with food, health, and nutrition questions. Ask me about products, meals, dietary advice, or your health goals! 💪`,
          suggestions: [
            'Analyze this product',
            'Help with meal planning',
            'Find healthier alternatives',
            'Check my nutrition progress'
          ]
        };
      }

      const userName = context.userProfile.firstName || 'there';
      const healthGoals = context.userProfile.healthGoals?.join(', ') || 'general health';
      const restrictions = context.userProfile.dietaryRestrictions?.join(', ') || 'none';
      
      const systemPrompt = `You are a friendly nutrition assistant. Keep responses concise (2-3 sentences). Focus on actionable nutrition advice. Be encouraging and supportive. User: ${userName}, goals: ${healthGoals}, restrictions: ${restrictions}.`;

      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-4), // Last 4 messages for context
        { role: 'user', content: message }
      ];

      if (context.currentProduct) {
        messages[0].content += ` Currently discussing: ${context.currentProduct.product_name} (Grade: ${context.currentProduct.nutrition_grades})`;
      }

      const response = await this.callGroqAPI(messages);
      const suggestions = this.generateSuggestions(context.userProfile, context.currentProduct);

      return {
        response: response.startsWith('Hey') ? response : `Hey ${userName}! ${response}`,
        suggestions
      };
    } catch (error) {
      console.error('Chat failed:', error);
      return {
        response: `Hey! I'm having a moment, but I'm still here! Ask me about nutrition, products, or your health goals! 💪`,
        suggestions: ['Analyze a product', 'Meal advice', 'Health tips', 'Find alternatives']
      };
    }
  }

  /**
   * Get personalized product recommendations
   */
  async getPersonalizedRecommendations(
    userProfile: UserData,
    currentProduct: ProductData
  ): Promise<{
    recommendations: string[];
    healthScore: number;
    warnings: string[];
    alternatives: string[];
  }> {
    try {
      const userName = userProfile.firstName || 'there';
      const healthGoals = userProfile.healthGoals?.join(', ') || 'general health';
      const restrictions = userProfile.dietaryRestrictions?.join(', ') || 'none';

      const messages = [{
        role: 'user',
        content: `Analyze this product for ${userName}:

Product: ${currentProduct.product_name}
Grade: ${currentProduct.nutrition_grades}
Sugar: ${currentProduct.nutriments.sugars_100g}g, Fat: ${currentProduct.nutriments.fat_100g}g, Salt: ${currentProduct.nutriments.salt_100g}g

User Goals: ${healthGoals}
Dietary Restrictions: ${restrictions}

Provide personalized advice in JSON:
{"recommendations": ["advice1", "advice2"], "healthScore": number (0-100), "warnings": [], "alternatives": ["alt1", "alt2"]}`
      }];

      const response = await this.callGroqAPI(messages);
      const result = JSON.parse(response);
      
      result.recommendations = result.recommendations.map((rec: string) => 
        rec.startsWith('Hey') ? rec : `Hey ${userName}! ${rec}`
      );

      return result;
    } catch (error) {
      console.error('Recommendations failed:', error);
      return {
        recommendations: [`This product can be part of a balanced diet! 💪`],
        healthScore: 75,
        warnings: [],
        alternatives: ['Look for Grade A or B products', 'Choose lower sugar options']
      };
    }
  }

  /**
   * Generate personalized welcome message
   */
  generateWelcomeMessage(userProfile: UserData): string {
    const userName = userProfile.firstName || 'there';
    const goals = userProfile.healthGoals?.join(' and ') || 'your health goals';
    
    return `Hey ${userName}! 🌟 I'm your nutrition buddy! I'm here to help you with ${goals}. Scan products, ask questions about food, or get personalized nutrition advice. Let's crush those health goals together! 💪`;
  }

  /**
   * Check if message is nutrition/food related
   */
  private isNutritionRelated(message: string): boolean {
    const keywords = [
      'health', 'nutrition', 'diet', 'food', 'eat', 'meal', 'calorie', 'protein', 'carb', 'fat', 'sugar',
      'ingredient', 'product', 'scan', 'grade', 'alternative', 'healthy', 'recipe', 'cook', 'vitamin',
      'fiber', 'sodium', 'salt', 'weight', 'vegetarian', 'vegan', 'gluten', 'dairy', 'allergy', 'fruit',
      'vegetable', 'snack', 'breakfast', 'lunch', 'dinner', 'organic', 'fresh', 'processed'
    ];
    
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  /**
   * Generate contextual suggestions
   */
  private generateSuggestions(userProfile: UserData, currentProduct?: ProductData): string[] {
    const suggestions: string[] = [];
    
    if (currentProduct) {
      suggestions.push('Find healthier alternatives');
      suggestions.push('Analyze this product deeply');
    }
    
    if (userProfile.healthGoals?.includes('weight_loss')) {
      suggestions.push('Low-calorie meal ideas');
    } else if (userProfile.healthGoals?.includes('muscle_gain')) {
      suggestions.push('High-protein food options');
    } else {
      suggestions.push('Balanced meal suggestions');
    }
    
    suggestions.push('Check my nutrition progress');
    
    return suggestions.slice(0, 4);
  }

  /**
   * Call Groq API
   */
  private async callGroqAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Groq API error:', error);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
