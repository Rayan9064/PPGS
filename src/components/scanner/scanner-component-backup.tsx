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
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
      
      // Clear monitoring interval
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
      
      // Clear any monitoring intervals
      const qrReader = document.getElementById('qr-reader');
      if (qrReader) {
        // Clear any existing intervals by removing all videos except the first
        const videos = qrReader.querySelectorAll('video');
        videos.forEach((video, index) => {
          if (index > 0) {
            video.remove();
          }
        });
      }
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
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
        defaultZoomValueIfSupported: 1,
        useBarCodeDetectorIfSupported: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        }
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

          // Remove unwanted text elements and mirroring after scanner starts
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

          // AGGRESSIVE: Remove ALL videos except the first one
          const videoElements = qrReader.querySelectorAll('video');
          videoElements.forEach((video, index) => {
            if (index > 0) {
              video.remove(); // Completely remove instead of just hiding
            }
          });

          // AGGRESSIVE: Remove ALL canvas elements
          const canvasElements = qrReader.querySelectorAll('canvas');
          canvasElements.forEach(canvas => {
            canvas.remove(); // Completely remove all canvas elements
          });

          // AGGRESSIVE: Remove any divs that contain multiple media elements
          const allDivs = qrReader.querySelectorAll('div');
          allDivs.forEach(div => {
            const videos = div.querySelectorAll('video');
            const canvases = div.querySelectorAll('canvas');
            
            if (videos.length > 1) {
              // Keep only the first video, remove the rest
              videos.forEach((video, index) => {
                if (index > 0) {
                  video.remove();
                }
              });
            }
            
            if (canvases.length > 0) {
              // Remove all canvas elements
              canvases.forEach(canvas => {
                canvas.remove();
              });
            }
          });

          // AGGRESSIVE: Force single video display
          const remainingVideos = qrReader.querySelectorAll('video');
          if (remainingVideos.length > 0) {
            const mainVideo = remainingVideos[0];
            mainVideo.style.width = '100%';
            mainVideo.style.height = 'auto';
            mainVideo.style.objectFit = 'contain';
            mainVideo.style.display = 'block';
            mainVideo.style.margin = '0 auto';
          }
        }
      }, 500);

      // Additional cleanup after a longer delay to catch any late-rendering mirroring elements
      setTimeout(() => {
        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
          // More aggressive cleanup for any remaining mirroring elements
          const allElements = qrReader.querySelectorAll('*');
          allElements.forEach(element => {
            // Check for elements that might be mirroring by their position or styling
            const rect = element.getBoundingClientRect();
            const parentRect = qrReader.getBoundingClientRect();
            
            // If element is positioned to the right of the main scanner area, it might be mirroring
            if (rect.left > parentRect.left + parentRect.width * 0.6) {
              const hasVideo = element.querySelector('video');
              const hasCanvas = element.querySelector('canvas');
              if (hasVideo || hasCanvas) {
                element.style.display = 'none';
              }
            }
            
            // Hide any elements with mirror-related attributes
            if (element.getAttribute('data-mirror') || 
                element.getAttribute('data-flip') ||
                element.getAttribute('data-preview')) {
              element.style.display = 'none';
            }

            // Specifically target QR canvas elements that might be mirroring
            if (element.tagName === 'CANVAS') {
              const canvas = element as HTMLCanvasElement;
              const canvasId = canvas.id || '';
              const canvasClass = canvas.className || '';
              
              // Hide canvas elements with QR-related identifiers
              if (canvasId.includes('qr') || 
                  canvasId.includes('canvas') ||
                  canvasClass.includes('qr') ||
                  canvasClass.includes('canvas') ||
                  canvasClass.includes('html5-qrcode')) {
                
                // Check if this is not the main scanner canvas
                const rect = canvas.getBoundingClientRect();
                const parentRect = qrReader.getBoundingClientRect();
                
                // If it's positioned to the right or is a duplicate, hide it
                if (rect.left > parentRect.left + parentRect.width * 0.4) {
                  canvas.style.display = 'none';
                }
              }
            }
          });

          // Force remove any elements that are positioned side-by-side (like the right-side mirror)
          const allDivs = qrReader.querySelectorAll('div');
          allDivs.forEach(div => {
            const rect = div.getBoundingClientRect();
            const parentRect = qrReader.getBoundingClientRect();
            
            // If div is positioned to the right half of the scanner, check if it contains media
            if (rect.left > parentRect.left + parentRect.width * 0.5) {
              const hasVideo = div.querySelector('video');
              const hasCanvas = div.querySelector('canvas');
              const hasImg = div.querySelector('img');
              
              if (hasVideo || hasCanvas || hasImg) {
                div.style.display = 'none';
              }
            }
          });

          // AGGRESSIVE: Remove any duplicate video elements
          const allVideos = qrReader.querySelectorAll('video');
          allVideos.forEach((video, index) => {
            if (index > 0) { // Keep only the first video
              video.remove(); // Completely remove duplicates
            }
          });

          // Ensure qr-canvas stays hidden
          const qrCanvas = qrReader.querySelector('canvas[id="qr-canvas"]');
          if (qrCanvas) {
            qrCanvas.style.display = 'none';
            qrCanvas.style.visibility = 'hidden';
            qrCanvas.style.opacity = '0';
          }

          // Center the camera feed and force single view
          const videoElements = qrReader.querySelectorAll('video');
          videoElements.forEach((video, index) => {
            if (index === 0) {
              // Keep only the first video and center it
              video.style.margin = '0 auto';
              video.style.display = 'block';
              video.style.maxWidth = '100%';
              video.style.maxHeight = '100%';
              video.style.height = 'auto';
              video.style.objectFit = 'contain';
              video.style.position = 'relative';
            } else {
              // Hide all other videos
              video.style.display = 'none';
            }
          });

          // Force the scanner container to show only one camera view
          const scannerDivs = qrReader.querySelectorAll('div');
          scannerDivs.forEach(div => {
            // If div contains multiple videos, hide the extras
            const videos = div.querySelectorAll('video');
            if (videos.length > 1) {
              videos.forEach((video, index) => {
                if (index > 0) {
                  video.style.display = 'none';
                }
              });
            }
          });
        }
      }, 1000);

      // Even more aggressive cleanup after 2 seconds to catch any stubborn elements
      setTimeout(() => {
        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
          // Remove any element that appears to be a duplicate or mirror
          const allElements = qrReader.querySelectorAll('*');
          allElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const parentRect = qrReader.getBoundingClientRect();
            
            // AGGRESSIVE: Remove any element in the right half with media content
            if (rect.left > parentRect.left + parentRect.width * 0.5) {
              if (element.tagName === 'VIDEO' || 
                  element.tagName === 'CANVAS' || 
                  element.tagName === 'IMG' ||
                  element.querySelector('video') ||
                  element.querySelector('canvas') ||
                  element.querySelector('img')) {
                element.remove(); // Completely remove instead of hiding
              }
            }

            // Specifically target and hide the qr-canvas element
            if (element.id === 'qr-canvas') {
              element.style.display = 'none';
              element.style.visibility = 'hidden';
              element.style.opacity = '0';
            }

            // Center any video elements and ensure single view
            if (element.tagName === 'VIDEO') {
              const video = element as HTMLVideoElement;
              const allVideos = qrReader.querySelectorAll('video');
              const videoIndex = Array.from(allVideos).indexOf(video);
              
              if (videoIndex === 0) {
                // Center the first video
                video.style.margin = '0 auto';
                video.style.display = 'block';
                video.style.maxWidth = '100%';
                video.style.maxHeight = '100%';
                video.style.height = 'auto';
                video.style.objectFit = 'contain';
                video.style.position = 'relative';
              } else {
                // Hide all other videos
                video.style.display = 'none';
              }
            }
          });
        }
      }, 2000);

      // Continuous monitoring to prevent duplicate videos from reappearing
      monitorIntervalRef.current = setInterval(() => {
        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
          const videos = qrReader.querySelectorAll('video');
          if (videos.length > 1) {
            // Remove all videos except the first one
            videos.forEach((video, index) => {
              if (index > 0) {
                video.remove();
              }
            });
          }
          
          const canvases = qrReader.querySelectorAll('canvas');
          if (canvases.length > 0) {
            // Remove all canvas elements
            canvases.forEach(canvas => {
              canvas.remove();
            });
          }
        }
      }, 1000);
      
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
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="p-3 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/20 transition-all duration-300 mr-4 shadow-lg"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-white drop-shadow-lg" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Scan Product</h1>
          </div>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 relative z-30 flex items-center justify-center">
        <div className="w-full max-w-md h-full flex items-center justify-center">
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
            <div className="w-full h-full flex items-center justify-center">
              {/* QR Scanner */}
              <div id="qr-reader" className="w-full h-full flex items-center justify-center">
                  {/* Center the camera feed and force single view */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      #qr-reader {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        flex-direction: column !important;
                        width: 100% !important;
                        height: 100% !important;
                      }
                      #qr-reader video {
                        margin: 0 auto !important;
                        display: block !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        height: auto !important;
                        object-fit: contain !important;
                        position: relative !important;
                      }
                      #qr-reader video:not(:first-child) {
                        display: none !important;
                      }
                      #qr-reader div {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 100% !important;
                        height: 100% !important;
                      }
                      #qr-reader div video:not(:first-child) {
                        display: none !important;
                      }
                    `
                  }} />
                </div>
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

    </div>
  );
};
