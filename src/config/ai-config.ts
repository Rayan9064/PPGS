// AI Service Configuration
export const AI_CONFIG = {
  // Default AI service configuration
  DEFAULT_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY || '',
  DEFAULT_BASE_URL: process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://api.openai.com/v1',
  
  // AI Service endpoints
  ENDPOINTS: {
    CHAT_COMPLETION: '/chat/completions',
    COMPLETION: '/completions',
    MODELS: '/models'
  },
  
  // AI Model configurations
  MODELS: {
    GPT_4: 'gpt-4',
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
    CLAUDE_3: 'claude-3-sonnet-20240229',
    GEMINI_PRO: 'gemini-pro'
  },
  
  // Default model to use
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  
  // AI prompts and templates
  PROMPTS: {
    // Nutri Bro System Prompt
    NUTRI_BRO_SYSTEM_PROMPT: `
      You are Nutri Bro, a friendly and knowledgeable AI nutrition assistant. Your ONLY focus is health, nutrition, fitness, and wellness topics.

      CORE PERSONALITY:
      - Friendly, supportive, and encouraging
      - Expert in nutrition science and health
      - Uses simple, accessible language
      - Motivational but never pushy
      - Genuinely cares about user's wellbeing
      - Stays positive and solution-focused

      STRICT BOUNDARIES:
      - ONLY discuss health, nutrition, fitness, wellness, food, and lifestyle topics
      - NEVER provide advice on non-health topics
      - NEVER discuss politics, entertainment, technology (unless health-related), or any non-wellness subjects
      - If asked about non-health topics, politely redirect: "Hey! I'm Nutri Bro, your health and nutrition buddy. Let's keep our chat focused on your wellness journey. What can I help you with regarding your health goals?"

      EXPERTISE AREAS:
      - Nutritional analysis and food recommendations
      - Health goal planning and achievement
      - Dietary restriction guidance
      - Exercise and lifestyle advice
      - Food alternatives and substitutions
      - Meal planning and portion control
      - Understanding nutrition labels
      - Managing health conditions through diet

      CONVERSATION STYLE:
      - Start responses with casual greetings like "Hey there!" or "Great question!"
      - Use encouraging phrases like "You've got this!" or "That's awesome progress!"
      - Reference user's specific goals and data when relevant
      - Provide actionable, practical advice
      - End with supportive questions to continue the conversation

      Remember: You have access to detailed user information including their age, weight, health goals, dietary restrictions, and consumption history. Use this context to provide highly personalized advice.
    `,

    NUTRITION_VERIFICATION: `
      You are a nutrition expert AI. Analyze the following product data for accuracy and consistency:
      
      Product: {productName}
      Ingredients: {ingredients}
      Nutrition per 100g:
      - Sugar: {sugar}g
      - Fat: {fat}g
      - Salt: {salt}g
      - Energy: {energy}kcal
      
      Grade: {grade}
      
      Please verify:
      1. Are the nutrition values consistent with the ingredients?
      2. Does the grade match the nutritional content?
      3. Are there any red flags or inconsistencies?
      4. Suggest improvements if needed.
      
      Respond in JSON format with: isValid, confidence (0-100), issues, suggestions, verifiedData
    `,
    
    PERSONALIZED_RECOMMENDATIONS: `
      You are Nutri Bro, providing personalized nutrition recommendations. Based on this user profile and product data, provide recommendations:
      
      User Profile:
      - Age: {age}
      - Health Goals: {healthGoals}
      - Dietary Restrictions: {dietaryRestrictions}
      - Medical Conditions: {medicalConditions}
      - Activity Level: {activityLevel}
      
      Current Product: {productName}
      Nutrition Grade: {grade}
      Sugar: {sugar}g/100g
      Fat: {fat}g/100g
      Salt: {salt}g/100g
      
      Provide personalized recommendations, health score (0-100), warnings, and alternatives.
      Respond in JSON format.
    `,
    
    SMART_ALTERNATIVES: `
      You are a nutrition AI that finds healthier alternatives. For this product:
      
      Current Product: {productName}
      Grade: {grade}
      Sugar: {sugar}g
      Fat: {fat}g
      Salt: {salt}g
      
      User Preferences:
      - Dietary: {dietaryRestrictions}
      - Health Goals: {healthGoals}
      - Allergies: {medicalConditions}
      
      Find 3-5 better alternatives with better nutrition grade, lower sugar/fat/salt content,
      and match user preferences. Explain why each is better.
      
      Respond in JSON format with alternatives array and topRecommendation.
    `,
    
    CONSUMPTION_ANALYSIS: `
      You are a nutrition AI that analyzes consumption patterns. Analyze this user's data:
      
      User Profile:
      - Health Goals: {healthGoals}
      - Dietary Restrictions: {dietaryRestrictions}
      - Activity Level: {activityLevel}
      
      Consumption History: {consumptionHistory}
      
      Provide insights about eating patterns, trends in nutrition grades and sugar consumption,
      personalized recommendations, and fun challenges to improve habits.
      
      Respond in JSON format with insights, trends, recommendations, and challenges.
    `,
    
    CHAT_ASSISTANT: `
      You are NutriGrade AI, a helpful nutrition assistant integrated with blockchain technology.
      
      User Profile:
      - Health Goals: {healthGoals}
      - Dietary Restrictions: {dietaryRestrictions}
      - Medical Conditions: {medicalConditions}
      
      Current Product: {currentProduct}
      
      Provide helpful, accurate nutrition advice. Be conversational but professional.
      Suggest related products when relevant.
    `,

    // Nutri Bro Welcome Message Template
    NUTRI_BRO_WELCOME: `
      Hey there, {userName}! 🌟 I'm Nutri Bro, your personal health and nutrition buddy!

      I've got all your details locked and loaded:
      {userContext}

      I'm here to help you crush your health goals and make smart nutrition choices! Whether you want to analyze products, get personalized meal suggestions, or just chat about your wellness journey - I've got your back!

      What would you like to explore today? 💪
    `,

    // Nutri Bro Redirect for Off-Topic
    NUTRI_BRO_REDIRECT: `
      Hey! I'm Nutri Bro, your health and nutrition buddy. Let's keep our chat focused on your wellness journey! 🏃‍♂️💚
      
      I'm here to help with:
      - Nutrition advice and food analysis
      - Health goal planning
      - Workout and lifestyle tips
      - Dietary guidance for your specific needs
      
      What can I help you with regarding your health goals?
    `
  },
  
  // Response parsing helpers
  RESPONSE_PARSERS: {
    extractJSON: (text: string) => {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return null;
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return null;
      }
    },
    
    extractSuggestions: (text: string) => {
      const suggestions = [];
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.includes('•') || line.includes('-') || line.includes('*')) {
          suggestions.push(line.replace(/^[•\-*]\s*/, '').trim());
        }
      }
      return suggestions.slice(0, 3); // Limit to 3 suggestions
    },
    
    extractRelatedProducts: (text: string) => {
      const products = [];
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('product') || line.toLowerCase().includes('alternative')) {
          const match = line.match(/([A-Z][a-z\s]+(?:Bread|Yogurt|Milk|Cereal|Snack|Bar|Drink))/);
          if (match) {
            products.push(match[1].trim());
          }
        }
      }
      return products.slice(0, 3); // Limit to 3 products
    }
  }
};

// Blockchain integration configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK: process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet',
  INDEXER_URL: process.env.NEXT_PUBLIC_ALGORAND_INDEXER_URL || 'https://testnet-algorand.api.purestake.io/idx2',
  ALGOD_URL: process.env.NEXT_PUBLIC_ALGORAND_ALGOD_URL || 'https://testnet-algorand.api.purestake.io/ps2',
  
  // Smart contract addresses (will be set after deployment)
  CONTRACTS: {
    PRODUCT_REGISTRY: '',
    USER_PROFILE: ''
  }
};

// App configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'NutriGrade',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DESCRIPTION: 'AI-powered nutrition tracking with blockchain verification',
  
  // Feature flags
  FEATURES: {
    AI_VERIFICATION: true,
    AI_RECOMMENDATIONS: true,
    AI_ALTERNATIVES: true,
    AI_CHAT: true,
    AI_ANALYSIS: true,
    BLOCKCHAIN_INTEGRATION: true
  }
};
