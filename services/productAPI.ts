import axios from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

export interface ProductData {
  product_name: string;
  ingredients_text: string;
  nutrition_grades: string;
  nutriments: {
    sugars_100g: number;
    fat_100g: number;
    salt_100g: number;
  };
}

export interface APIResponse {
  status: number;
  status_verbose?: string;
  product: ProductData;
}

export interface APIError {
  status: number;
  message: string;
}

export const fetchProductData = async (barcode: string): Promise<ProductData> => {
  try {
    const response = await axios.get<APIResponse>(`${BASE_URL}/${barcode}.json`);
    
    if (response.status === 404) {
      throw new Error('Product not found in database');
    }
    
    if (response.status !== 200 || !response.data.product) {
      throw new Error('Invalid product data received');
    }
    
    const { product } = response.data;
    
    // Validate required fields
    if (!product.product_name) {
      throw new Error('Product name not available');
    }
    
    // Ensure all required nutriments exist with default values if missing
    const normalizedProduct: ProductData = {
      ...product,
      ingredients_text: product.ingredients_text || 'No ingredients information available',
      nutrition_grades: product.nutrition_grades || 'n/a',
      nutriments: {
        sugars_100g: product.nutriments?.sugars_100g ?? 0,
        fat_100g: product.nutriments?.fat_100g ?? 0,
        salt_100g: product.nutriments?.salt_100g ?? 0,
      }
    };
    
    return normalizedProduct;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Product not found in database');
      }
      throw new Error(`Network error: ${error.message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch product data');
  }
};
