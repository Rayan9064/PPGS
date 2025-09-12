/**
 * Contract configuration and environment settings
 */

export const CONTRACT_CONFIG = {
  // Main contract app ID (set this after deploying the contract)
  APP_ID: process.env.NEXT_PUBLIC_CONTRACT_APP_ID ? 
    parseInt(process.env.NEXT_PUBLIC_CONTRACT_APP_ID) : 
    null,
  
  // Network configuration
  NETWORK: process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet',
  
  // Contract limits and constraints
  MAX_PRODUCT_NAME_LENGTH: 64,
  MAX_INGREDIENTS_LENGTH: 500,
  MAX_RETRIES: 3,
  
  // Transaction fees and timing
  DEFAULT_FEE: 1000, // microAlgos
  CONFIRMATION_ROUNDS: 4,
  
  // Feature flags
  FEATURES: {
    AUTO_OPT_IN: true, // Automatically opt users into contract
    CACHE_STATS: true, // Cache blockchain stats locally
    OFFLINE_MODE: false, // Allow offline scanning with sync later
  }
} as const;

/**
 * Error messages for contract operations
 */
export const CONTRACT_ERRORS = {
  NOT_INITIALIZED: 'Contract service not initialized',
  WALLET_NOT_CONNECTED: 'Wallet must be connected',
  USER_NOT_OPTED_IN: 'User not opted into contract',
  INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
  PRODUCT_NOT_FOUND: 'Product not found on blockchain',
  UNAUTHORIZED: 'Unauthorized operation',
  TRANSACTION_FAILED: 'Transaction failed to complete',
  NETWORK_ERROR: 'Network connection error',
} as const;

/**
 * Default contract initialization parameters
 */
export const DEFAULT_CONTRACT_PARAMS = {
  // Minimum balance requirements
  MIN_BALANCE_MICRO_ALGOS: 100000, // 0.1 ALGO
  
  // Contract interaction defaults
  SCAN_REWARD: 0, // No rewards for now
  ADD_PRODUCT_COST: 1000, // 0.001 ALGO
  
  // Data validation
  MIN_PRODUCT_ID: 1,
  MAX_PRODUCT_ID: Number.MAX_SAFE_INTEGER,
} as const;

/**
 * Development and testing configuration
 */
export const DEV_CONFIG = {
  // Mock app ID for development
  MOCK_APP_ID: 123456789,
  
  // Development mode flags
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  MOCK_TRANSACTIONS: false,
  
  // Test data
  TEST_PRODUCTS: [
    {
      id: '1',
      name: 'Test Product 1',
      ingredients: ['test', 'ingredient', 'mock']
    },
    {
      id: '2', 
      name: 'Test Product 2',
      ingredients: ['another', 'test', 'product']
    }
  ]
} as const;

/**
 * Utility function to get the active app ID
 */
export function getContractAppId(): number {
  const appId = CONTRACT_CONFIG.APP_ID;
  
  if (!appId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock app ID for development');
      return DEV_CONFIG.MOCK_APP_ID;
    }
    throw new Error('Contract app ID not configured');
  }
  
  return appId;
}

/**
 * Check if contract features are enabled
 */
export function isFeatureEnabled(feature: keyof typeof CONTRACT_CONFIG.FEATURES): boolean {
  return CONTRACT_CONFIG.FEATURES[feature];
}

/**
 * Validate product data before blockchain operations
 */
export function validateProduct(product: { id: string; name: string; ingredients: string[] }): void {
  if (!product.id || product.id.trim() === '') {
    throw new Error('Product ID is required');
  }
  
  if (!product.name || product.name.trim() === '') {
    throw new Error('Product name is required');
  }
  
  if (product.name.length > CONTRACT_CONFIG.MAX_PRODUCT_NAME_LENGTH) {
    throw new Error(`Product name exceeds ${CONTRACT_CONFIG.MAX_PRODUCT_NAME_LENGTH} characters`);
  }
  
  if (!product.ingredients || product.ingredients.length === 0) {
    throw new Error('Product ingredients are required');
  }
  
  const ingredientsString = product.ingredients.join(',');
  if (ingredientsString.length > CONTRACT_CONFIG.MAX_INGREDIENTS_LENGTH) {
    throw new Error(`Ingredients exceed ${CONTRACT_CONFIG.MAX_INGREDIENTS_LENGTH} characters`);
  }
  
  const productId = parseInt(product.id);
  if (isNaN(productId) || productId < DEFAULT_CONTRACT_PARAMS.MIN_PRODUCT_ID) {
    throw new Error('Invalid product ID format');
  }
}