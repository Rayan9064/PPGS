import { NutritionGrade, ProductData, UserData } from '@/types';
import { GRADE_THRESHOLDS } from '../lib/nutrition-limits';

export const calculateGrade = (product: ProductData, userData?: UserData | null): NutritionGrade => {
  const { nutriments } = product;
  
  // If any of the required nutriments are missing, return 'U' for unknown
  if (!nutriments.sugars_100g && nutriments.sugars_100g !== 0 || 
      !nutriments.fat_100g && nutriments.fat_100g !== 0 || 
      !nutriments.salt_100g && nutriments.salt_100g !== 0) {
    return 'U';
  }

  // Calculate a comprehensive nutrition score (0-100)
  let score = 100;
  
  // Sugar penalty (0-30 points)
  const sugarScore = Math.max(0, 30 - (nutriments.sugars_100g * 1.5));
  score -= (30 - sugarScore);
  
  // Fat penalty (0-25 points)
  const fatScore = Math.max(0, 25 - (nutriments.fat_100g * 1.2));
  score -= (25 - fatScore);
  
  // Salt penalty (0-20 points)
  const saltScore = Math.max(0, 20 - (nutriments.salt_100g * 10));
  score -= (20 - saltScore);
  
  // Energy penalty (0-15 points) - penalize very high calorie foods
  const energyPer100g = nutriments.energy_100g || 0;
  const energyScore = Math.max(0, 15 - (energyPer100g / 20));
  score -= (15 - energyScore);
  
  // Bonus for positive nutrients (if available)
  if (nutriments.fiber_100g && nutriments.fiber_100g > 3) {
    score += 5; // Bonus for high fiber
  }
  if (nutriments.proteins_100g && nutriments.proteins_100g > 10) {
    score += 3; // Bonus for high protein
  }
  
  // Apply user-specific adjustments
  if (userData?.dietaryRestrictions?.includes('diabetic') || userData?.medicalConditions?.includes('diabetes')) {
    // Stricter penalty for sugar
    const sugarPenalty = Math.max(0, nutriments.sugars_100g * 2);
    score -= sugarPenalty;
  }
  
  if (userData?.dietaryRestrictions?.includes('low_sodium') || userData?.medicalConditions?.includes('hypertension')) {
    // Stricter penalty for salt
    const saltPenalty = Math.max(0, nutriments.salt_100g * 15);
    score -= saltPenalty;
  }
  
  if (userData?.medicalConditions?.includes('heart_disease')) {
    // Stricter penalty for fat and salt
    const fatPenalty = Math.max(0, nutriments.fat_100g * 1.5);
    const saltPenalty = Math.max(0, nutriments.salt_100g * 15);
    score -= (fatPenalty + saltPenalty);
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Convert score to grade
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
};

export const getNutrientWarnings = (product: ProductData, userData?: UserData | null): string[] => {
  const warnings: string[] = [];
  const { nutriments } = product;

  // Use personalized limits if available, otherwise use default D thresholds
  const limits = {
    sugar: userData?.preferences?.maxSugar || GRADE_THRESHOLDS.D.sugar,
    fat: userData?.preferences?.maxFat || GRADE_THRESHOLDS.D.fat,
    salt: userData?.preferences?.maxSalt || GRADE_THRESHOLDS.D.salt,
  };

  // Adjust limits based on medical conditions
  if (userData?.dietaryRestrictions?.includes('diabetic') || userData?.medicalConditions?.includes('diabetes')) {
    limits.sugar = limits.sugar * 0.7; // More strict for diabetics
  }

  if (userData?.dietaryRestrictions?.includes('low_sodium') || userData?.medicalConditions?.includes('hypertension')) {
    limits.salt = limits.salt * 0.7; // More strict for hypertension
  }

  if (userData?.medicalConditions?.includes('heart_disease')) {
    limits.fat = limits.fat * 0.7; // More strict for heart disease
    limits.salt = limits.salt * 0.7;
  }

  if (nutriments.sugars_100g > limits.sugar) {
    warnings.push('High sugar content');
    
    // Add specific warnings for user conditions
    if (userData?.dietaryRestrictions?.includes('diabetic') || userData?.medicalConditions?.includes('diabetes')) {
      warnings.push('⚠️ Not recommended for diabetics');
    }
  }
  
  if (nutriments.fat_100g > limits.fat) {
    warnings.push('High fat content');
    
    if (userData?.medicalConditions?.includes('heart_disease')) {
      warnings.push('⚠️ May not be suitable for heart conditions');
    }
  }
  
  if (nutriments.salt_100g > limits.salt) {
    warnings.push('High salt content');
    
    if (userData?.medicalConditions?.includes('hypertension') || userData?.dietaryRestrictions?.includes('low_sodium')) {
      warnings.push('⚠️ High sodium - not recommended for your profile');
    }
  }

  // Add dietary restriction warnings
  if (userData?.dietaryRestrictions?.length) {
    // Note: This would require ingredient analysis which is beyond current scope
    // but can be implemented with ingredient checking logic
  }

  return warnings;
};

export const getGradeColor = (grade: NutritionGrade): string => {
  const colors = {
    A: '#1fa363',
    B: '#8bc34a', 
    C: '#ffeb3b',
    D: '#ff9800',
    E: '#f44336',
    U: '#9e9e9e',
  };
  return colors[grade];
};

export const getGradeDescription = (grade: NutritionGrade): string => {
  const descriptions = {
    A: 'Excellent nutritional value',
    B: 'Good nutritional value',
    C: 'Average nutritional value',
    D: 'Below average nutritional value',
    E: 'Poor nutritional value',
    U: 'Unknown nutritional value',
  };
  return descriptions[grade];
};

export const getNutritionScore = (product: ProductData, userData?: UserData | null): number => {
  const { nutriments } = product;
  
  // If any of the required nutriments are missing, return 5.0 for unknown
  if (!nutriments.sugars_100g && nutriments.sugars_100g !== 0 || 
      !nutriments.fat_100g && nutriments.fat_100g !== 0 || 
      !nutriments.salt_100g && nutriments.salt_100g !== 0) {
    return 5.0;
  }

  // Calculate a comprehensive nutrition score (0-100)
  let score = 100;
  
  // Sugar penalty (0-30 points)
  const sugarScore = Math.max(0, 30 - (nutriments.sugars_100g * 1.5));
  score -= (30 - sugarScore);
  
  // Fat penalty (0-25 points)
  const fatScore = Math.max(0, 25 - (nutriments.fat_100g * 1.2));
  score -= (25 - fatScore);
  
  // Salt penalty (0-20 points)
  const saltScore = Math.max(0, 20 - (nutriments.salt_100g * 10));
  score -= (20 - saltScore);
  
  // Energy penalty (0-15 points) - penalize very high calorie foods
  const energyPer100g = nutriments.energy_100g || 0;
  const energyScore = Math.max(0, 15 - (energyPer100g / 20));
  score -= (15 - energyScore);
  
  // Bonus for positive nutrients (if available)
  if (nutriments.fiber_100g && nutriments.fiber_100g > 3) {
    score += 5; // Bonus for high fiber
  }
  if (nutriments.proteins_100g && nutriments.proteins_100g > 10) {
    score += 3; // Bonus for high protein
  }
  
  // Apply user-specific adjustments
  if (userData?.dietaryRestrictions?.includes('diabetic') || userData?.medicalConditions?.includes('diabetes')) {
    // Stricter penalty for sugar
    const sugarPenalty = Math.max(0, nutriments.sugars_100g * 2);
    score -= sugarPenalty;
  }
  
  if (userData?.dietaryRestrictions?.includes('low_sodium') || userData?.medicalConditions?.includes('hypertension')) {
    // Stricter penalty for salt
    const saltPenalty = Math.max(0, nutriments.salt_100g * 15);
    score -= saltPenalty;
  }
  
  if (userData?.medicalConditions?.includes('heart_disease')) {
    // Stricter penalty for fat and salt
    const fatPenalty = Math.max(0, nutriments.fat_100g * 1.5);
    const saltPenalty = Math.max(0, nutriments.salt_100g * 15);
    score -= (fatPenalty + saltPenalty);
  }
  
  // Ensure score is within bounds and convert to 0-10 scale
  score = Math.max(0, Math.min(100, score));
  return Math.round((score / 10) * 10) / 10; // Round to 1 decimal place
};

export const getNutritionGrade = (product: ProductData, userData?: UserData | null) => {
  const grade = calculateGrade(product, userData);
  const score = getNutritionScore(product, userData);
  return {
    grade,
    score,
    color: getGradeColor(grade),
    description: getGradeDescription(grade),
    warnings: getNutrientWarnings(product, userData),
    isPersonalized: !!userData && (!!userData.preferences?.maxSugar || !!userData.preferences?.maxFat || !!userData.preferences?.maxSalt || !!userData.dietaryRestrictions?.length || !!userData.medicalConditions?.length),
  };
};
