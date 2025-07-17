'use client';

import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductData } from '@/types';

interface ScanTabProps {
  onScanSuccess: (product: ProductData) => void;
  onBack: () => void;
}

export const ScanTab = ({ onScanSuccess, onBack }: ScanTabProps) => {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-gray-900 dark:to-black">
      {/* Gradient Background - adapts to light/dark mode */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/30 via-transparent to-blue-100/30 dark:from-emerald-900/20 dark:via-transparent dark:to-blue-900/20"></div>
      
      {/* Animated Background Elements - adapts to light/dark mode */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        <ScannerComponent 
          onScanSuccess={onScanSuccess}
          onBack={onBack}
        />
      </div>
      
      {/* Scanner Frame Overlay - Only visible in camera mode */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-30">
        <div className="h-full flex items-center justify-center p-8">
          <div className="relative w-64 h-64 max-w-sm max-h-sm">
            {/* Corner frames - only show when camera is active */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-3 border-t-3 border-emerald-500 dark:border-emerald-400 rounded-tl-lg animate-pulse"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-r-3 border-t-3 border-emerald-500 dark:border-emerald-400 rounded-tr-lg animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-3 border-b-3 border-emerald-500 dark:border-emerald-400 rounded-bl-lg animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-3 border-b-3 border-emerald-500 dark:border-emerald-400 rounded-br-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
