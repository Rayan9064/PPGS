'use client';

import { ScannerComponent } from '@/components/scanner/scanner-component';
import { ProductData } from '@/types';
import { XMarkIcon, PhotoIcon, CameraIcon, ViewfinderCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useState, memo, useRef, useEffect } from 'react';
import { getAvailableCameras, selectDefaultCamera } from '@/lib/camera-utils';
import { useManualBarcodeEntry } from '@/hooks/useManualBarcodeEntry';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface ScanTabProps {
  onScanSuccess: (product: ProductData) => void;
  onBack: () => void;
}

export const ScanTab = memo(function ScanTab({ onScanSuccess, onBack }: ScanTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [loadingCameras, setLoadingCameras] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks for barcode scanning and manual entry
  const { isProcessing: isScanningImage, scanImageFile } = useBarcodeScanner({
    onSuccess: onScanSuccess
  });

  const { 
    barcode: manualBarcode, 
    isProcessing: isProcessingManual,
    setBarcode: setManualBarcode,
    handleSubmit: handleManualSubmit,
    handleKeyPress: handleManualKeyPress
  } = useManualBarcodeEntry({
    onSuccess: onScanSuccess
  });

  const isProcessing = isScanningImage || isProcessingManual;

  // Load available cameras on component mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoadingCameras(true);
      const devices = await getAvailableCameras();
      setCameras(devices);
      
      if (devices.length > 0) {
        const defaultCamera = selectDefaultCamera(devices);
        if (defaultCamera) {
          setSelectedCamera(defaultCamera);
        }
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setLoadingCameras(false);
    }
  };

  const handleStartScanning = () => {
    console.log('Starting camera scan...');
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await scanImageFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        initialCamera={selectedCamera}
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
          {/* Camera Selection - Show only if multiple cameras available */}
          {cameras.length > 1 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-secondary-700 flex items-center gap-2">
                  <CameraIcon className="w-4 h-4" />
                  Select Camera
                </label>
                <button
                  onClick={loadCameras}
                  disabled={loadingCameras}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
                  title="Refresh cameras"
                >
                  <ArrowPathIcon className={`w-4 h-4 text-secondary-600 ${loadingCameras ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full bg-white border border-secondary-300 rounded-lg px-3 py-2 text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500 mt-1">
                {cameras.length} camera{cameras.length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}

          <button 
            onClick={handleStartScanning}
            disabled={isProcessing || loadingCameras}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-6 h-6" />
            Scan with Camera
          </button>
          
          <button 
            onClick={handleGalleryUpload}
            disabled={isProcessing}
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <PhotoIcon className="w-6 h-6" />
            {isScanningImage ? 'Processing...' : 'Upload from Gallery'}
          </button>
          
          <button 
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim() || isProcessing}
            className="w-full bg-primary-100 hover:bg-primary-200 text-secondary-900 font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingManual ? 'Checking...' : 'Enter Barcode Manually'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelected}
            className="hidden"
          />
        </div>

        {/* Manual Input Field */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter barcode number (e.g., 8901149110183)"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyPress={handleManualKeyPress}
            disabled={isProcessing}
            className="w-full bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-secondary-500 mt-2 text-center">
            Scan with camera, upload an image, or enter barcode manually
          </p>
          <p className="text-xs text-primary-600 mt-1 text-center font-medium">
            💡 Tip: For best results, ensure the barcode is clear, well-lit, and fills most of the image
          </p>
        </div>
      </div>
    </div>
  );
});