import { GRADE_THRESHOLDS } from '../constants/NutritionLimits';
import { ProductData } from '../services/productAPI';

export const calculateGrade = (product: ProductData): string => {
  const { nutriments } = product;
  
  // If any of the required nutriments are missing, return 'U' for unknown
  if (!nutriments.sugars_100g || !nutriments.fat_100g || !nutriments.salt_100g) {
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
