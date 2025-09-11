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

  // Use personalized limits if available
  let thresholds = GRADE_THRESHOLDS;
  
  if (userData?.preferences?.maxSugar || userData?.preferences?.maxFat || userData?.preferences?.maxSalt) {
    // Create personalized thresholds based on user preferences
    const personalLimits = {
      sugar: userData.preferences.maxSugar || GRADE_THRESHOLDS.D.sugar,
      fat: userData.preferences.maxFat || GRADE_THRESHOLDS.D.fat,
      salt: userData.preferences.maxSalt || GRADE_THRESHOLDS.D.salt,
    };

    thresholds = {
      A: {
        sugar: personalLimits.sugar * 0.3,
        fat: personalLimits.fat * 0.3,
        salt: personalLimits.salt * 0.3,
      },
      B: {
        sugar: personalLimits.sugar * 0.5,
        fat: personalLimits.fat * 0.5,
        salt: personalLimits.salt * 0.5,
      },
      C: {
        sugar: personalLimits.sugar * 0.7,
        fat: personalLimits.fat * 0.7,
        salt: personalLimits.salt * 0.7,
      },
      D: {
        sugar: personalLimits.sugar,
        fat: personalLimits.fat,
        salt: personalLimits.salt,
      },
    };
  }

  // Adjust thresholds based on user's dietary restrictions and medical conditions
  if (userData?.dietaryRestrictions?.includes('diabetic') || userData?.medicalConditions?.includes('diabetes')) {
    // Stricter sugar limits for diabetic users
    thresholds = {
      ...thresholds,
      A: { ...thresholds.A, sugar: thresholds.A.sugar * 0.5 },
      B: { ...thresholds.B, sugar: thresholds.B.sugar * 0.7 },
      C: { ...thresholds.C, sugar: thresholds.C.sugar * 0.8 },
      D: { ...thresholds.D, sugar: thresholds.D.sugar * 0.9 },
    };
  }

  if (userData?.dietaryRestrictions?.includes('low_sodium') || userData?.medicalConditions?.includes('hypertension')) {
    // Stricter salt limits for users with hypertension or low sodium preference
    thresholds = {
      ...thresholds,
      A: { ...thresholds.A, salt: thresholds.A.salt * 0.5 },
      B: { ...thresholds.B, salt: thresholds.B.salt * 0.7 },
      C: { ...thresholds.C, salt: thresholds.C.salt * 0.8 },
      D: { ...thresholds.D, salt: thresholds.D.salt * 0.9 },
    };
  }

  if (userData?.medicalConditions?.includes('heart_disease')) {
    // Stricter fat and salt limits for heart disease
    thresholds = {
      ...thresholds,
      A: { ...thresholds.A, fat: thresholds.A.fat * 0.6, salt: thresholds.A.salt * 0.5 },
      B: { ...thresholds.B, fat: thresholds.B.fat * 0.7, salt: thresholds.B.salt * 0.7 },
      C: { ...thresholds.C, fat: thresholds.C.fat * 0.8, salt: thresholds.C.salt * 0.8 },
      D: { ...thresholds.D, fat: thresholds.D.fat * 0.9, salt: thresholds.D.salt * 0.9 },
    };
  }

  // Check against thresholds from best (A) to worst (E)
  const grades = ['A', 'B', 'C', 'D'] as const;
  
  for (const grade of grades) {
    const threshold = thresholds[grade as keyof typeof thresholds];
    if (
      nutriments.sugars_100g <= threshold.sugar &&
      nutriments.fat_100g <= threshold.fat &&
      nutriments.salt_100g <= threshold.salt
    ) {
      return grade;
    }
  }

  // If no other grade matches, return E
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

export const getNutritionGrade = (product: ProductData, userData?: UserData | null) => {
  const grade = calculateGrade(product, userData);
  return {
    grade,
    color: getGradeColor(grade),
    description: getGradeDescription(grade),
    warnings: getNutrientWarnings(product, userData),
    isPersonalized: !!userData && (!!userData.preferences?.maxSugar || !!userData.preferences?.maxFat || !!userData.preferences?.maxSalt || !!userData.dietaryRestrictions?.length || !!userData.medicalConditions?.length),
  };
};
