'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeCameraScanConfig, Html5QrcodeScanType } from 'html5-qrcode';
import { ArrowLeftIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'gallery'>('camera');
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const { hapticFeedback } = useTelegram();

  const handleScanSuccess = useCallback(async (barcode: string) => {
    if (isLoading || scanLockRef.current) return;

    scanLockRef.current = true;
    setIsLoading(true);
    setError(null);
    hapticFeedback.impact('medium');

    try {
      const productData = await fetchProductData(barcode);
      hapticFeedback.notification('success');
      
      // Stop camera before navigating
      await cleanupScanner();
      
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
        scanLockRef.current = false;
      }, 3000);
    }
  }, [isLoading, hapticFeedback, onScanSuccess]);

  // Cleanup function
  const cleanupScanner = useCallback(async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.log('Cleanup error:', err);
    }
  }, []);

  // Get available cameras (called only once)
  const getCameras = useCallback(async () => {
    if (hasPermission !== null) return; // Already checked

    setHasPermission(null); // Set to checking state
    
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
        // Prefer back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera?.id || devices[0].id);
        setHasPermission(true);
      } else {
        setError('No cameras found on this device');
        setHasPermission(false);
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Camera access denied. Please allow camera access to use scanner.');
      setHasPermission(false);
    }
  }, [hasPermission]);

  // Initialize camera scanner
  const initializeCameraScanner = useCallback(async () => {
    if (!selectedCamera || isScanning || scanLockRef.current) return;

    try {
      await cleanupScanner(); // Clean up any existing scanner
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        selectedCamera,
        config,
        async (decodedText) => {
          if (!scanLockRef.current) {
            await handleScanSuccess(decodedText);
          }
        },
        (error) => {
          // Handle scan errors silently - they're usually just failed attempts
          console.log('Scan error:', error);
        }
      );
      
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Failed to start camera. Please try again.');
      setIsScanning(false);
    }
  }, [selectedCamera, isScanning, handleScanSuccess, cleanupScanner]);

  // Initialize gallery scanner
  const initializeGalleryScanner = useCallback(() => {
    if (isScanning || scanLockRef.current) return;
    
    try {
      cleanupScanner(); // Clean up any existing scanner
      
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: false,
          showZoomSliderIfSupported: false,
          rememberLastUsedCamera: false,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE], // Only file upload, no camera
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          if (!scanLockRef.current) {
            await handleScanSuccess(decodedText);
          }
        },
        (error) => {
          console.log('Scan error:', error);
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Error starting gallery scanner:', err);
      setError('Failed to initialize scanner. Please try again.');
    }
  }, [isScanning, handleScanSuccess, cleanupScanner]);

  // Handle scan mode change
  const handleScanModeChange = useCallback(async (mode: 'camera' | 'gallery') => {
    if (isLoading || scanLockRef.current) return;
    
    hapticFeedback.impact('light');
    setScanMode(mode);
    setError(null);
    scanLockRef.current = false;

    await cleanupScanner();
  }, [hapticFeedback, isLoading, cleanupScanner]);

  // Handle file upload for gallery mode
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || scanLockRef.current) return;

    scanLockRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Create a temporary Html5Qrcode instance for file scanning
      const html5QrCode = new Html5Qrcode('temp-qr-reader');
      const result = await html5QrCode.scanFile(file, true);
      await handleScanSuccess(result);
    } catch (err) {
      setError('No barcode found in the selected image. Please try a clearer image.');
      setIsLoading(false);
      scanLockRef.current = false;
    }

    // Reset file input
    event.target.value = '';
  }, [handleScanSuccess]);

  // Initialize scanner based on mode
  useEffect(() => {
    if (hasPermission === null) {
      getCameras();
    }
  }, [getCameras, hasPermission]);

  useEffect(() => {
    if (hasPermission === true && scanMode === 'camera' && selectedCamera && !isScanning) {
      const timer = setTimeout(() => {
        initializeCameraScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else if (scanMode === 'gallery' && !isScanning) {
      const timer = setTimeout(() => {
        initializeGalleryScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scanMode, selectedCamera, hasPermission, isScanning, initializeCameraScanner, initializeGalleryScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupScanner();
      scanLockRef.current = false;
    };
  }, [cleanupScanner]);

  const handleBack = () => {
    hapticFeedback.impact('light');
    cleanupScanner();
    onBack();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-3"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Scan Product</h1>
        </div>
        
        {/* Camera Selection */}
        {cameras.length > 1 && scanMode === 'camera' && (
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="px-3 py-1 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Scan Mode Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => handleScanModeChange('camera')}
          disabled={hasPermission === false}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            scanMode === 'camera'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : hasPermission === false
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <CameraIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Camera</span>
        </button>
        <button
          onClick={() => handleScanModeChange('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            scanMode === 'gallery'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <PhotoIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Gallery</span>
        </button>
      </div>

      {/* Scanner Container */}
      <div className="card mb-6 relative">
        {hasPermission === null ? (
          <div className="text-center py-8">
            <CameraIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Checking Camera Access</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please wait while we check camera permissions...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          </div>
        ) : hasPermission === false && scanMode === 'camera' ? (
          <div className="text-center py-8">
            <CameraIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Camera Access Required</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To scan barcodes with your camera, please allow camera access when prompted.
            </p>
            <button
              onClick={() => {
                setHasPermission(null);
                getCameras();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Enable Camera
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              {scanMode === 'camera' ? (
                <CameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              ) : (
                <PhotoIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              )}
              <p className="text-gray-600 dark:text-gray-400">
                {scanMode === 'camera' 
                  ? 'Point your camera at a product barcode'
                  : 'Upload an image or use camera to scan barcode'
                }
              </p>
            </div>

            {/* QR Scanner */}
            <div id="qr-reader" className="mx-auto"></div>
            
            {/* Hidden div for file scanning */}
            <div id="temp-qr-reader" className="hidden"></div>

            {/* File Upload for Gallery Mode */}
            {scanMode === 'gallery' && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className={`block w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                    isLoading 
                      ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                      : 'border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400'
                  }`}
                >
                  <PhotoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {isLoading ? 'Processing...' : 'Click to select image from gallery'}
                  </span>
                </label>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="scanning-overlay">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-300">Fetching product data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">Try scanning again</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          {scanMode === 'camera' ? 'Camera Scanning Tips' : 'Gallery Scanning Tips'}
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          {scanMode === 'camera' ? (
            <>
              <li>• Hold your phone steady</li>
              <li>• Ensure good lighting</li>
              <li>• Position barcode within the frame</li>
              <li>• Wait for automatic detection</li>
            </>
          ) : (
            <>
              <li>• Select clear, well-lit images</li>
              <li>• Ensure barcode is visible and unobstructed</li>
              <li>• Use camera for live scanning</li>
              <li>• Upload from gallery for existing photos</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
