/**
 * Hook for manual barcode entry functionality
 */

import { useState } from 'react';
import { fetchProductData } from '@/lib/product-api';
import { ProductData } from '@/types';
import toast from 'react-hot-toast';

interface UseManualBarcodeEntryProps {
  onSuccess: (product: ProductData) => void;
}

interface UseManualBarcodeEntryReturn {
  barcode: string;
  isProcessing: boolean;
  setBarcode: (value: string) => void;
  handleSubmit: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useManualBarcodeEntry({ 
  onSuccess 
}: UseManualBarcodeEntryProps): UseManualBarcodeEntryReturn {
  const [barcode, setBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    const trimmedBarcode = barcode.trim();
    
    if (!trimmedBarcode) {
      toast.error('Please enter a barcode');
      return;
    }

    // Validate barcode format (basic validation)
    if (!/^\d+$/.test(trimmedBarcode)) {
      toast.error('Barcode should contain only numbers');
      return;
    }

    if (trimmedBarcode.length < 8) {
      toast.error('Barcode is too short. Please enter a valid barcode.');
      return;
    }

    try {
      setIsProcessing(true);
      const loadingToast = toast.loading('Fetching product data...');
      
      console.log('Fetching product for barcode:', trimmedBarcode);
      const productData = await fetchProductData(trimmedBarcode);
      
      toast.dismiss(loadingToast);
      toast.success('Product found!');
      
      // Clear barcode after successful fetch
      setBarcode('');
      
      onSuccess(productData);
    } catch (error) {
      toast.dismiss();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching product:', errorMessage, error);
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        toast.error('Product not found in database. Please check the barcode and try again.');
      } else if (errorMessage.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to fetch product. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim() && !isProcessing) {
      handleSubmit();
    }
  };

  return {
    barcode,
    isProcessing,
    setBarcode,
    handleSubmit,
    handleKeyPress
  };
}
