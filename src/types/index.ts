// Product data interface based on Open Food Facts API
export interface ProductData {
  code: string;
  product_name: string;
  ingredients_text: string;
  nutrition_grades: string;
  nutriments: {
    sugars_100g: number;
    fat_100g: number;
    salt_100g: number;
    energy_100g?: number;
  };
  image_url?: string;
  brands?: string;
  categories?: string;
}

// API Response interface
export interface APIResponse {
  status: number;
  status_verbose?: string;
  product: ProductData;
}

// API Error interface
export interface APIError {
  status: number;
  message: string;
}

// Nutrition grade type
export type NutritionGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

// Scanner state
export interface ScannerState {
  isScanning: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

// User data interface
export interface UserData {
  telegramId: string | number; // Support both string and number for web compatibility
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  healthGoals?: ('weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain_weight' | 'improve_health')[];
  dietaryRestrictions?: ('vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'low_sodium' | 'diabetic')[];
  medicalConditions?: ('diabetes' | 'hypertension' | 'heart_disease' | 'kidney_disease' | 'none')[];
  preferences?: {
    maxSugar?: number; // custom limit in g per 100g
    maxFat?: number; // custom limit in g per 100g
    maxSalt?: number; // custom limit in g per 100g
    language?: string;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User onboarding state
export interface OnboardingState {
  isCompleted: boolean;
  currentStep: 'welcome' | 'basic_info' | 'health_info' | 'dietary_preferences' | 'goals' | 'completed';
  progress: number; // 0-100
}

// User connection status
export interface UserConnectionStatus {
  isConnected: boolean;
  isTelegramUser: boolean;
  hasUserData: boolean;
  needsOnboarding: boolean;
}

// Web app interface (simplified for web compatibility)
export interface WebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  version?: string;
  viewportHeight?: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
}
