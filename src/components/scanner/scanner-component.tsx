'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import { fetchProductData } from '@/lib/product-api';
import { ProductData } from '@/types';
import { useTelegram } from '@/components/providers/telegram-provider';
import toast from 'react-hot-toast';

interface ScannerComponentProps {
  onScanSuccess: (data: ProductData) => void;
  onBack: () => void;
}

export const ScannerComponent = ({ onScanSuccess, onBack }: ScannerComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { hapticFeedback } = useTelegram();

  const handleScanSuccess = useCallback(async (barcode: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    hapticFeedback.impact('medium');

    try {
      const productData = await fetchProductData(barcode);
      hapticFeedback.notification('success');
      onScanSuccess(productData);
    } catch (error) {
      hapticFeedback.notification('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product data';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset scanner after error
      setTimeout(() => {
        setError(null);
        setIsLoading(false);
      }, 3000);
    }
  }, [isLoading, hapticFeedback, onScanSuccess]);

  const initializeScanner = useCallback(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await handleScanSuccess(decodedText);
      },
      (error) => {
        // Handle scan errors silently - they're usually just failed attempts
        console.log('Scan error:', error);
      }
    );

    scannerRef.current = scanner;
  }, [handleScanSuccess]);

  useEffect(() => {
    initializeScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [initializeScanner]);

  const handleBack = () => {
    hapticFeedback.impact('light');
    onBack();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Scan Product</h1>
      </div>

      {/* Scanner Container */}
      <div className="card mb-6">
        <div className="text-center mb-4">
          <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            Point your camera at a product barcode
          </p>
        </div>

        {/* QR Scanner */}
        <div id="qr-reader" className="mx-auto"></div>

        {/* Loading State */}
        {isLoading && (
          <div className="scanning-overlay">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Fetching product data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">Try scanning again</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Scanning Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hold your phone steady</li>
          <li>• Ensure good lighting</li>
          <li>• Position barcode within the frame</li>
          <li>• Wait for automatic detection</li>
        </ul>
      </div>
    </div>
  );
};
