'use client';

import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductData } from '@/types';
import { XMarkIcon, PhotoIcon, CameraIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline';

interface ScanTabProps {
  onScanSuccess: (product: ProductData) => void;
  onBack: () => void;
}

export const ScanTab = ({ onScanSuccess, onBack }: ScanTabProps) => {
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
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Scan Barcode
          </button>
          <button className="w-full bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200">
            Enter Barcode Manually
          </button>
        </div>

        {/* Manual Input Field */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter barcode"
            className="w-full bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Scanner Component (Hidden by default, shown when scanning) */}
      <div className="hidden">
        <ScannerComponent 
          onScanSuccess={onScanSuccess}
          onBack={onBack}
        />
      </div>
    </div>
  );
};