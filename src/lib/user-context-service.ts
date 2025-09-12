import { UserData, ProductData } from '@/types';
import { UserDataService } from './user-data';

export interface UserContextForAI {
  personalInfo: {
    name: string;
    age?: number;
    weight?: number; // kg
    height?: number; // cm
    bmi?: number;
    activityLevel?: string;
  };
  healthProfile: {
    healthGoals: string[];
    dietaryRestrictions: string[];
    allergies: string[];
    medicalConditions: string[];
    customLimits?: {
      maxSugar?: number;
      maxFat?: number;
      maxSalt?: number;
    };
  };
  consumptionData: {
    totalScannedItems: number;
    recentConsumption: Array<{
      productName: string;
      nutritionGrade: string;
      sugar: number;
      fat: number;
      salt: number;
      scanDate: Date;
    }>;
    averageNutritionGrade: string;
    consumptionTrends: {
      sugarIntake: 'high' | 'moderate' | 'low';
      fatIntake: 'high' | 'moderate' | 'low';
      saltIntake: 'high' | 'moderate' | 'low';
    };
  };
  preferences: {
    language?: string;
    notifications?: boolean;
  };
}

export class UserContextService {
  /**
   * Build comprehensive user context for AI
   */
  static buildUserContext(userData: UserData, consumptionHistory?: any[]): UserContextForAI {
    const context: UserContextForAI = {
      personalInfo: {
        name: userData.firstName + (userData.lastName ? ` ${userData.lastName}` : ''),
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        activityLevel: userData.activityLevel
      },
      healthProfile: {
        healthGoals: userData.healthGoals || [],
        dietaryRestrictions: userData.dietaryRestrictions || [],
        allergies: this.extractAllergies(userData.medicalConditions || []),
        medicalConditions: userData.medicalConditions || [],
        customLimits: userData.preferences ? {
          maxSugar: userData.preferences.maxSugar,
          maxFat: userData.preferences.maxFat,
          maxSalt: userData.preferences.maxSalt
        } : undefined
      },
      consumptionData: this.buildConsumptionData(consumptionHistory || []),
      preferences: {
        language: userData.preferences?.language,
        notifications: userData.preferences?.notifications
      }
    };

    // Calculate BMI if height and weight available
    if (userData.height && userData.weight) {
      const heightInMeters = userData.height / 100;
      context.personalInfo.bmi = Math.round((userData.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    return context;
  }

  /**
   * Generate formatted context string for AI prompts
   */
  static formatContextForAI(context: UserContextForAI): string {
    const sections: string[] = [];

    // Personal Information
    sections.push(`**USER PROFILE - ${context.personalInfo.name.toUpperCase()}**`);
    
    if (context.personalInfo.age) {
      sections.push(`Age: ${context.personalInfo.age} years old`);
    }
    
    if (context.personalInfo.weight && context.personalInfo.height) {
      sections.push(`Physical Stats: ${context.personalInfo.height}cm, ${context.personalInfo.weight}kg`);
      if (context.personalInfo.bmi) {
        sections.push(`BMI: ${context.personalInfo.bmi} (${this.getBMICategory(context.personalInfo.bmi)})`);
      }
    }

    if (context.personalInfo.activityLevel) {
      sections.push(`Activity Level: ${context.personalInfo.activityLevel.replace('_', ' ')}`);
    }

    // Health Goals & Restrictions
    if (context.healthProfile.healthGoals.length > 0) {
      sections.push(`Health Goals: ${context.healthProfile.healthGoals.join(', ')}`);
    }

    if (context.healthProfile.dietaryRestrictions.length > 0) {
      sections.push(`Dietary Restrictions: ${context.healthProfile.dietaryRestrictions.join(', ')}`);
    }

    if (context.healthProfile.allergies.length > 0) {
      sections.push(`Allergies/Medical Conditions: ${context.healthProfile.allergies.join(', ')}`);
    }

    // Custom Limits
    if (context.healthProfile.customLimits) {
      const limits = [];
      if (context.healthProfile.customLimits.maxSugar) {
        limits.push(`Sugar max: ${context.healthProfile.customLimits.maxSugar}g/100g`);
      }
      if (context.healthProfile.customLimits.maxFat) {
        limits.push(`Fat max: ${context.healthProfile.customLimits.maxFat}g/100g`);
      }
      if (context.healthProfile.customLimits.maxSalt) {
        limits.push(`Salt max: ${context.healthProfile.customLimits.maxSalt}g/100g`);
      }
      if (limits.length > 0) {
        sections.push(`Custom Nutrition Limits: ${limits.join(', ')}`);
      }
    }

    // Consumption Data
    if (context.consumptionData.totalScannedItems > 0) {
      sections.push(`\n**CONSUMPTION HISTORY**`);
      sections.push(`Total Products Scanned: ${context.consumptionData.totalScannedItems}`);
      sections.push(`Average Nutrition Grade: ${context.consumptionData.averageNutritionGrade}`);
      
      // Consumption trends
      const trends = [];
      if (context.consumptionData.consumptionTrends.sugarIntake !== 'moderate') {
        trends.push(`${context.consumptionData.consumptionTrends.sugarIntake} sugar intake`);
      }
      if (context.consumptionData.consumptionTrends.fatIntake !== 'moderate') {
        trends.push(`${context.consumptionData.consumptionTrends.fatIntake} fat intake`);
      }
      if (context.consumptionData.consumptionTrends.saltIntake !== 'moderate') {
        trends.push(`${context.consumptionData.consumptionTrends.saltIntake} salt intake`);
      }
      if (trends.length > 0) {
        sections.push(`Consumption Trends: ${trends.join(', ')}`);
      }

      // Recent products
      if (context.consumptionData.recentConsumption.length > 0) {
        const recentProducts = context.consumptionData.recentConsumption
          .slice(0, 5) // Last 5 products
          .map(item => `${item.productName} (Grade: ${item.nutritionGrade})`)
          .join(', ');
        sections.push(`Recent Products: ${recentProducts}`);
      }
    }

    return sections.join('\n');
  }

  /**
   * Extract allergies from medical conditions
   */
  private static extractAllergies(medicalConditions: string[]): string[] {
    const allergyKeywords = ['allergy', 'allergic', 'nut_free', 'dairy_free', 'gluten_free'];
    return medicalConditions.filter(condition => 
      allergyKeywords.some(keyword => condition.toLowerCase().includes(keyword))
    );
  }

  /**
   * Build consumption data from history
   */
  private static buildConsumptionData(consumptionHistory: any[]): UserContextForAI['consumptionData'] {
    if (consumptionHistory.length === 0) {
      return {
        totalScannedItems: 0,
        recentConsumption: [],
        averageNutritionGrade: 'N/A',
        consumptionTrends: {
          sugarIntake: 'moderate',
          fatIntake: 'moderate',
          saltIntake: 'moderate'
        }
      };
    }

    // Calculate average nutrition grade
    const grades = consumptionHistory
      .map(item => item.nutrition_grades || item.nutritionGrade)
      .filter(grade => grade && grade !== 'unknown');
    
    const averageGrade = this.calculateAverageGrade(grades);

    // Calculate consumption trends
    const avgSugar = this.calculateAverage(consumptionHistory, 'sugars_100g', 'sugar');
    const avgFat = this.calculateAverage(consumptionHistory, 'fat_100g', 'fat');
    const avgSalt = this.calculateAverage(consumptionHistory, 'salt_100g', 'salt');

    // Build recent consumption
    const recentConsumption = consumptionHistory
      .slice(-10) // Last 10 items
      .map(item => ({
        productName: item.product_name || item.productName || 'Unknown Product',
        nutritionGrade: item.nutrition_grades || item.nutritionGrade || 'U',
        sugar: item.nutriments?.sugars_100g || item.sugar || 0,
        fat: item.nutriments?.fat_100g || item.fat || 0,
        salt: item.nutriments?.salt_100g || item.salt || 0,
        scanDate: new Date(item.scannedAt || item.createdAt || Date.now())
      }));

    return {
      totalScannedItems: consumptionHistory.length,
      recentConsumption,
      averageNutritionGrade: averageGrade,
      consumptionTrends: {
        sugarIntake: this.categorizeTrend(avgSugar, { low: 5, high: 15 }),
        fatIntake: this.categorizeTrend(avgFat, { low: 10, high: 25 }),
        saltIntake: this.categorizeTrend(avgSalt, { low: 0.5, high: 1.5 })
      }
    };
  }

  /**
   * Calculate average grade from letter grades
   */
  private static calculateAverageGrade(grades: string[]): string {
    if (grades.length === 0) return 'N/A';
    
    const gradeValues = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'U': 0 };
    const reverseGrades = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E', 0: 'U' };
    
    const avgValue = grades.reduce((sum, grade) => {
      return sum + (gradeValues[grade.toUpperCase() as keyof typeof gradeValues] || 0);
    }, 0) / grades.length;
    
    const roundedValue = Math.round(avgValue);
    return reverseGrades[roundedValue as keyof typeof reverseGrades] || 'U';
  }

  /**
   * Calculate average value from consumption history
   */
  private static calculateAverage(history: any[], field1: string, field2: string): number {
    const values = history
      .map(item => item.nutriments?.[field1] || item[field2] || 0)
      .filter(value => value > 0);
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  /**
   * Categorize trend as low/moderate/high
   */
  private static categorizeTrend(value: number, thresholds: { low: number; high: number }): 'low' | 'moderate' | 'high' {
    if (value <= thresholds.low) return 'low';
    if (value >= thresholds.high) return 'high';
    return 'moderate';
  }

  /**
   * Get BMI category
   */
  private static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Get stored consumption history from localStorage
   */
  static getConsumptionHistory(): any[] {
    try {
      const stored = localStorage.getItem('nutripal-consumption-history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting consumption history:', error);
      return [];
    }
  }

  /**
   * Check if user has completed onboarding and has sufficient data
   */
  static isUserDataComplete(userData: UserData): boolean {
    return !!(
      userData.age &&
      userData.healthGoals &&
      userData.healthGoals.length > 0
    );
  }
}