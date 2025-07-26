import { OnboardingState, UserConnectionStatus, UserData } from '@/types';

const USER_DATA_KEY = 'nutripal-user-data';
const ONBOARDING_KEY = 'nutripal-onboarding';

export class UserDataService {
  /**
   * Get user data from localStorage
   */
  static getUserData(telegramId?: number): UserData | null {
    try {
      const stored = localStorage.getItem(USER_DATA_KEY);
      if (!stored) return null;

      const userData: UserData = JSON.parse(stored);
      
      // If telegramId is provided, verify it matches
      if (telegramId && userData.telegramId !== telegramId) {
        return null;
      }

      // Convert date strings back to Date objects
      userData.createdAt = new Date(userData.createdAt);
      userData.updatedAt = new Date(userData.updatedAt);

      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save user data to localStorage
   */
  static saveUserData(userData: UserData): boolean {
    try {
      userData.updatedAt = new Date();
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Create initial user data from Telegram user info
   */
  static createUserData(telegramUser: any): UserData {
    return {
      telegramId: telegramUser.id,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
      photoUrl: telegramUser.photo_url,
      preferences: {
        language: telegramUser.language_code || 'en',
        notifications: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update user data partially
   */
  static updateUserData(telegramId: number, updates: Partial<UserData>): boolean {
    const existingData = this.getUserData(telegramId);
    if (!existingData) return false;

    const updatedData: UserData = {
      ...existingData,
      ...updates,
      telegramId, // Ensure telegramId cannot be changed
      updatedAt: new Date(),
    };

    return this.saveUserData(updatedData);
  }

  /**
   * Delete user data
   */
  static deleteUserData(): void {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  }

  /**
   * Get onboarding state
   */
  static getOnboardingState(): OnboardingState {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      if (!stored) {
        return {
          isCompleted: false,
          currentStep: 'welcome',
          progress: 0,
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting onboarding state:', error);
      return {
        isCompleted: false,
        currentStep: 'welcome',
        progress: 0,
      };
    }
  }

  /**
   * Save onboarding state
   */
  static saveOnboardingState(state: OnboardingState): boolean {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static completeOnboarding(): boolean {
    return this.saveOnboardingState({
      isCompleted: true,
      currentStep: 'completed',
      progress: 100,
    });
  }

  /**
   * Get user connection status
   */
  static getUserConnectionStatus(telegramUser?: any): UserConnectionStatus {
    const isConnected = !!telegramUser;
    const isTelegramUser = isConnected;
    const userData = isConnected ? this.getUserData(telegramUser.id) : null;
    const hasUserData = !!userData;
    const onboardingState = this.getOnboardingState();
    const needsOnboarding = isConnected && (!hasUserData || !onboardingState.isCompleted);

    return {
      isConnected,
      isTelegramUser,
      hasUserData,
      needsOnboarding,
    };
  }

  /**
   * Get user's BMI if height and weight are available
   */
  static calculateBMI(userData: UserData): number | null {
    if (!userData.weight || !userData.height) return null;
    
    const heightInMeters = userData.height / 100;
    return userData.weight / (heightInMeters * heightInMeters);
  }

  /**
   * Get BMI category
   */
  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Calculate daily calorie needs (Mifflin-St Jeor Equation)
   */
  static calculateDailyCalories(userData: UserData, gender: 'male' | 'female' = 'male'): number | null {
    if (!userData.weight || !userData.height || !userData.age || !userData.activityLevel) {
      return null;
    }

    // BMR calculation
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age);
    } else {
      bmr = 447.593 + (9.247 * userData.weight) + (3.098 * userData.height) - (4.330 * userData.age);
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    return Math.round(bmr * activityMultipliers[userData.activityLevel]);
  }

  /**
   * Validate user data
   */
  static validateUserData(userData: Partial<UserData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.telegramId) {
      errors.push('Telegram ID is required');
    }

    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (userData.age && (userData.age < 13 || userData.age > 120)) {
      errors.push('Age must be between 13 and 120');
    }

    if (userData.weight && (userData.weight < 20 || userData.weight > 500)) {
      errors.push('Weight must be between 20 and 500 kg');
    }

    if (userData.height && (userData.height < 100 || userData.height > 250)) {
      errors.push('Height must be between 100 and 250 cm');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
