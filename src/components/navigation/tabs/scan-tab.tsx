'use client';

import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductData } from '@/types';

interface ScanTabProps {
  onScanSuccess: (product: ProductData) => void;
  onBack: () => void;
}

export const ScanTab = ({ onScanSuccess, onBack }: ScanTabProps) => {
  return (
    <div className="flex-1 bg-black">
      <ScannerComponent 
        onScanSuccess={onScanSuccess}
        onBack={onBack}
      />
    </div>
  );
};
