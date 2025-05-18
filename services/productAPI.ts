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
  product: ProductData;
}

export const fetchProductData = async (barcode: string): Promise<ProductData> => {
  try {
    const response = await axios.get<APIResponse>(`${BASE_URL}/${barcode}.json`);
    
    if (response.status !== 200 || !response.data.product) {
      throw new Error('Product not found');
    }
    
    return response.data.product;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch product data: ${error.message}`);
    }
    throw new Error('Failed to fetch product data');
  }
};
