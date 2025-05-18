export const NUTRITION_LIMITS = {
  SUGAR: {
    LOW: 5, // g per 100g
    HIGH: 22.5,
  },
  FAT: {
    LOW: 3, // g per 100g
    HIGH: 17.5,
  },
  SALT: {
    LOW: 0.3, // g per 100g
    HIGH: 1.5,
  }
};

export const GRADE_THRESHOLDS = {
  A: {
    sugar: NUTRITION_LIMITS.SUGAR.LOW,
    fat: NUTRITION_LIMITS.FAT.LOW,
    salt: NUTRITION_LIMITS.SALT.LOW,
  },
  B: {
    sugar: NUTRITION_LIMITS.SUGAR.LOW * 1.5,
    fat: NUTRITION_LIMITS.FAT.LOW * 1.5,
    salt: NUTRITION_LIMITS.SALT.LOW * 1.5,
  },
  C: {
    sugar: NUTRITION_LIMITS.SUGAR.HIGH * 0.7,
    fat: NUTRITION_LIMITS.FAT.HIGH * 0.7,
    salt: NUTRITION_LIMITS.SALT.HIGH * 0.7,
  },
  D: {
    sugar: NUTRITION_LIMITS.SUGAR.HIGH,
    fat: NUTRITION_LIMITS.FAT.HIGH,
    salt: NUTRITION_LIMITS.SALT.HIGH,
  },
  // Anything above D thresholds is graded as E
};
