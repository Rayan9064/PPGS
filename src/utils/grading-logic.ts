import { GRADE_THRESHOLDS } from '../lib/nutrition-limits';
import { ProductData, NutritionGrade } from '@/types';

export const calculateGrade = (product: ProductData): NutritionGrade => {
  const { nutriments } = product;
  
  // If any of the required nutriments are missing, return 'U' for unknown
  if (!nutriments.sugars_100g && nutriments.sugars_100g !== 0 || 
      !nutriments.fat_100g && nutriments.fat_100g !== 0 || 
      !nutriments.salt_100g && nutriments.salt_100g !== 0) {
    return 'U';
  }

  // Check against thresholds from best (A) to worst (E)
  const grades = ['A', 'B', 'C', 'D'] as const;
  
  for (const grade of grades) {
    const threshold = GRADE_THRESHOLDS[grade as keyof typeof GRADE_THRESHOLDS];
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

export const getNutrientWarnings = (product: ProductData): string[] => {
  const warnings: string[] = [];
  const { nutriments } = product;

  if (nutriments.sugars_100g > GRADE_THRESHOLDS.D.sugar) {
    warnings.push('High sugar content');
  }
  if (nutriments.fat_100g > GRADE_THRESHOLDS.D.fat) {
    warnings.push('High fat content');
  }
  if (nutriments.salt_100g > GRADE_THRESHOLDS.D.salt) {
    warnings.push('High salt content');
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

export const getNutritionGrade = (product: ProductData) => {
  const grade = calculateGrade(product);
  return {
    grade,
    color: getGradeColor(grade),
    description: getGradeDescription(grade),
  };
};
