'use client';

import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductData } from '@/types';
import { XMarkIcon, PhotoIcon, CameraIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import { useState, memo } from 'react';

interface ScanTabProps {
  onScanSuccess: (product: ProductData) => void;
  onBack: () => void;
}

export const ScanTab = memo(function ScanTab({ onScanSuccess, onBack }: ScanTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleStartScanning = () => {
    console.log('Starting camera scan...');
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      // Simulate scanning with manual barcode
      onScanSuccess({
        code: manualBarcode,
        product_name: 'Manual Product',
        brands: 'Unknown',
        ingredients_text: 'Manual entry - no ingredient data available',
        nutrition_grades: 'C',
        nutriments: {
          sugars_100g: 0,
          fat_100g: 0,
          salt_100g: 0,
          energy_100g: 0
        },
        image_url: undefined,
        categories: 'Manual entry'
      });
    }
  };
  // If scanning, show the scanner component
  if (isScanning) {
    return (
      <ScannerComponent 
        onScanSuccess={(product) => {
          setIsScanning(false);
          onScanSuccess(product);
        }}
        onBack={handleStopScanning}
      />
    );
  }

  return (
    <div className="flex-1 w-full bg-primary-50 pb-20">
      {/* Header */}
      <div className="px-6 py-4 pt-12">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2">
            <XMarkIcon className="w-6 h-6 text-secondary-900" />
          </button>
          <h1 className="text-xl font-bold text-secondary-900">NutriGrade</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Camera Icons */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-secondary-500" />
          </div>
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center">
            <CameraIcon className="w-10 h-10 text-secondary-500" />
          </div>
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
            <ViewfinderCircleIcon className="w-8 h-8 text-secondary-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4 mb-8">
          <button 
            onClick={handleStartScanning}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Scan Barcode
          </button>
          <button 
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim()}
            className="w-full bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Barcode Manually
          </button>
        </div>

        {/* Manual Input Field */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter barcode"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="w-full bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
});