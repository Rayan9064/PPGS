/**
 * Hook for barcode scanning from gallery images
 */

import { useState } from 'react';
import { fetchProductData } from '@/lib/product-api';
import { ProductData } from '@/types';
import { scanBarcodeFromImage, getBarcodeErrorMessage } from '@/lib/barcode-scanner';
import toast from 'react-hot-toast';

interface UseBarcodeScannerProps {
  onSuccess: (product: ProductData) => void;
}

interface UseBarcodeScannerReturn {
  isProcessing: boolean;
  scanImageFile: (file: File) => Promise<void>;
}

export function useBarcodeScanner({ 
  onSuccess 
}: UseBarcodeScannerProps): UseBarcodeScannerReturn {
  const [isProcessing, setIsProcessing] = useState(false);

  const scanImageFile = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Scanning barcode from image...');

    try {
      // Scan barcode from image
      const scanResult = await scanBarcodeFromImage(file);

      if (!scanResult.success || !scanResult.barcode) {
        toast.dismiss(loadingToast);
        const errorMsg = getBarcodeErrorMessage(scanResult);
        toast.error(errorMsg, { duration: 4000 });
        return;
      }

      console.log(`Barcode detected: ${scanResult.barcode} (Method: ${scanResult.method})`);
      
      toast.dismiss(loadingToast);
      const fetchingToast = toast.loading('Fetching product data...');
      
      // Fetch product data
      const productData = await fetchProductData(scanResult.barcode);
      
      toast.dismiss(fetchingToast);
      toast.success('Product found from image!');
      
      onSuccess(productData);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error processing barcode image:', errorMessage, error);
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        toast.error('Product not found in database. Please try another product.');
      } else if (errorMessage.includes('Network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to process barcode. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    scanImageFile
  };
}
