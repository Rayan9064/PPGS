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

// Telegram WebApp interface
export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
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
