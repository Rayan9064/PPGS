'use client';

import { useWeb } from '@/components/providers/web-provider';
import { fetchProductData } from '@/lib/product-api';
import { ProductData } from '@/types';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ScannerComponentProps {
  onScanSuccess: (data: ProductData) => void;
  onBack: () => void;
}

export const ScannerComponent = ({ onScanSuccess, onBack }: ScannerComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const { hapticFeedback, webUser } = useWeb();

  // Camera permission caching functions
  const getCachedPermission = useCallback((): boolean | null => {
    try {
      const cacheKey = webUser?.id ? `camera_permission_${webUser.id}` : 'camera_permission_guest';
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [webUser?.id]);

  const setCachedPermission = useCallback((permission: boolean) => {
    try {
      const cacheKey = webUser?.id ? `camera_permission_${webUser.id}` : 'camera_permission_guest';
      localStorage.setItem(cacheKey, JSON.stringify(permission));
    } catch {
      // Ignore cache errors
    }
  }, [webUser?.id]);

  const clearCachedPermission = useCallback(() => {
    try {
      const cacheKey = webUser?.id ? `camera_permission_${webUser.id}` : 'camera_permission_guest';
      localStorage.removeItem(cacheKey);
      setHasPermission(null);
      setPermissionChecked(false);
    } catch {
      // Ignore cache errors
    }
  }, [webUser?.id]);

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
      setIsScanning(false);
    } catch (err) {
      console.log('Cleanup error:', err);
    }
  }, []);

  // Get available cameras (called only once)
  const getCameras = useCallback(async (forceRequest = false) => {
    if (permissionChecked && !forceRequest) return;
    
    // Check cached permission first
    const cachedPermission = getCachedPermission();
    if (cachedPermission === true && !forceRequest) {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
          setHasPermission(true);
          setPermissionChecked(true);
          return;
        }
      } catch (err) {
        // If cached permission exists but camera access fails, clear cache and continue
        setCachedPermission(false);
      }
    }

    // If no cached permission or it failed, request permission
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
        setCachedPermission(true); // Cache the permission
        setPermissionChecked(true);
      } else {
        setError('No cameras found on this device');
        setHasPermission(false);
        setCachedPermission(false);
        setPermissionChecked(true);
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Camera access denied. Please allow camera access to use scanner.');
      setHasPermission(false);
      setCachedPermission(false);
      setPermissionChecked(true);
    }
  }, [permissionChecked, getCachedPermission, setCachedPermission]);

  // Initialize camera scanner
  const initializeCameraScanner = useCallback(async () => {
    if (!selectedCamera || isScanning || scanLockRef.current) return;

    try {
      await cleanupScanner(); // Clean up any existing scanner
      
      // Ensure the qr-reader element exists and has proper dimensions
      const qrReaderElement = document.getElementById('qr-reader');
      if (!qrReaderElement) {
        console.error('QR reader element not found');
        return;
      }

      // Wait a bit for the element to be properly rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
          // Filter out common canvas errors that don't need to be logged
          if (!error.includes('IndexSizeError') && !error.includes('source width is 0')) {
            console.log('Scan error:', error);
          }
        }
      );
      
      setIsScanning(true);
      setError(null);

      // Remove unwanted text elements after scanner starts
      setTimeout(() => {
        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
          // Remove all text nodes and unwanted divs
          const walker = document.createTreeWalker(
            qrReader,
            NodeFilter.SHOW_TEXT
          );
          
          const textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent && node.textContent.trim()) {
              textNodes.push(node);
            }
          }
          
          textNodes.forEach(textNode => {
            if (!textNode.parentElement?.tagName.match(/BUTTON|SELECT|INPUT/)) {
              textNode.textContent = '';
            }
          });

          // Remove specific divs with text content
          const divsWithText = qrReader.querySelectorAll('div');
          divsWithText.forEach(div => {
            if (div.textContent && 
                (div.textContent.includes('Upload an image') || 
                 div.textContent.includes('use camera to scan') ||
                 div.textContent.includes('barcode') ||
                 div.textContent.includes('Position'))) {
              div.style.display = 'none';
            }
          });
        }
      }, 500);
      
    } catch (err) {
      console.error('Error starting camera:', err);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to start camera. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
          errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (err.message.includes('NotFoundError') || err.message.includes('No camera found')) {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.message.includes('NotReadableError')) {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  }, [selectedCamera, isScanning, handleScanSuccess, cleanupScanner]);

  // Check cached permission on mount
  useEffect(() => {
    const cachedPermission = getCachedPermission();
    if (cachedPermission !== null) {
      setHasPermission(cachedPermission);
      setPermissionChecked(true);
      if (cachedPermission === true) {
        // If we have cached permission, try to get cameras
        getCameras(false);
      }
    } else {
      // No cached permission, will need to request
      setPermissionChecked(false);
    }
  }, [getCachedPermission, getCameras]);

  // Initialize scanner based on camera permissions
  useEffect(() => {
    if (!permissionChecked && hasPermission === null) {
      getCameras();
    }
  }, [getCameras, hasPermission, permissionChecked]);

  useEffect(() => {
    if (hasPermission === true && selectedCamera && !isScanning) {
      const timer = setTimeout(() => {
        initializeCameraScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCamera, hasPermission, isScanning, initializeCameraScanner]);

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
    <div className="w-full h-full relative flex flex-col">
      {/* Header */}
      <div className="relative z-30 px-6 py-4 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-3 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/20 transition-all duration-300 mr-4 shadow-lg"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-white drop-shadow-lg" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Scan Product</h1>
              <p className="text-emerald-600 dark:text-emerald-200 text-sm font-medium">Position barcode in the frame</p>
            </div>
          </div>
          
          {/* Camera Selection */}
          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 px-6 relative z-30">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-gray-200/50 dark:border-white/10 h-full shadow-xl min-h-[400px] flex flex-col">
          {hasPermission === null ? (
            <div className="text-center py-12 h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CameraIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {permissionChecked ? 'Initializing Camera' : 'Checking Camera Access'}
              </h3>
              <p className="text-gray-600 dark:text-white/80 mb-6 text-center max-w-sm">
                {permissionChecked 
                  ? 'Setting up your camera for scanning...'
                  : 'Please wait while we check camera permissions...'
                }
              </p>
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 dark:border-emerald-400/30 border-t-emerald-600 dark:border-t-emerald-400"></div>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-12 h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CameraIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Camera Access Required</h3>
              <p className="text-gray-600 dark:text-white/80 mb-6 text-center max-w-sm">
                To scan barcodes, please allow camera access when prompted. This permission is saved for future visits.
              </p>
              <button
                onClick={() => {
                  setHasPermission(null);
                  setPermissionChecked(false);
                  getCameras(true); // Force request permission
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Enable Camera
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* QR Scanner */}
              <div className="flex-1 flex items-center justify-center">
                <div id="qr-reader" className="w-full max-w-md"></div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-40">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center border border-gray-200/50 dark:border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-400/30 border-t-emerald-600 dark:border-t-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg">Fetching product data...</p>
                <p className="text-gray-600 dark:text-white/70 text-sm mt-1">Please wait a moment</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/20 backdrop-blur-md border border-red-200 dark:border-red-400/30 rounded-2xl">
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">Try scanning again</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="relative z-30 px-6 py-4">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
            Camera Scanning Tips
          </h3>
          <ul className="text-sm text-gray-600 dark:text-white/80 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              Hold your phone steady
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              Ensure good lighting
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              Position barcode within the frame
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              Wait for automatic detection
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
