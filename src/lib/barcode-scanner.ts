/**
 * Barcode Scanner Utility
 * Handles barcode detection from images using native API and fallback methods
 */

import { Html5Qrcode } from 'html5-qrcode';

export interface BarcodeScanResult {
  success: boolean;
  barcode?: string;
  format?: string;
  method?: 'native' | 'fallback';
  error?: string;
}

/**
 * Scan barcode from image file using native BarcodeDetector API
 */
async function scanWithNativeAPI(file: File): Promise<BarcodeScanResult> {
  try {
    if (!('BarcodeDetector' in window)) {
      return { success: false, error: 'Native API not available' };
    }

    console.log('Using native BarcodeDetector API');
    
    // @ts-ignore - BarcodeDetector is not in TypeScript types yet
    const barcodeDetector = new window.BarcodeDetector({
      formats: [
        'ean_13', 'ean_8', 'upc_a', 'upc_e', 
        'code_128', 'code_39', 'code_93', 
        'codabar', 'itf', 'qr_code'
      ]
    });
    
    // Create image bitmap from file
    const imageBitmap = await createImageBitmap(file);
    const barcodes = await barcodeDetector.detect(imageBitmap);
    
    if (barcodes.length > 0) {
      const barcode = barcodes[0].rawValue;
      const format = barcodes[0].format;
      console.log('Barcode detected (native API):', barcode, 'Format:', format);
      
      return {
        success: true,
        barcode,
        format,
        method: 'native'
      };
    }
    
    return { success: false, error: 'No barcode detected by native API' };
  } catch (error) {
    console.error('Native API error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Native API failed' 
    };
  }
}

/**
 * Scan barcode from image file using html5-qrcode library
 */
async function scanWithHtml5Qrcode(file: File): Promise<BarcodeScanResult> {
  let html5QrCode: Html5Qrcode | null = null;
  let tempContainer: HTMLElement | null = null;

  try {
    console.log('Using html5-qrcode library');
    
    const scannerId = `qr-reader-${Date.now()}`;
    tempContainer = document.createElement('div');
    tempContainer.id = scannerId;
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    html5QrCode = new Html5Qrcode(scannerId, {
      formatsToSupport: [
        // @ts-ignore - These constants exist in the library
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
      ],
      verbose: false
    });
    
    const decodedText = await html5QrCode.scanFile(file, true);
    console.log('Barcode detected (html5-qrcode):', decodedText);
    
    // Cleanup
    await html5QrCode.clear();
    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
    
    return {
      success: true,
      barcode: decodedText,
      method: 'fallback'
    };
  } catch (error) {
    // Cleanup on error
    try {
      if (html5QrCode) {
        await html5QrCode.clear();
      }
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    console.error('html5-qrcode error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan barcode'
    };
  }
}

/**
 * Main barcode scanning function - tries native API first, then fallback
 */
export async function scanBarcodeFromImage(file: File): Promise<BarcodeScanResult> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'Invalid file type. Please select an image file.'
    };
  }

  // Method 1: Try native BarcodeDetector API first
  const nativeResult = await scanWithNativeAPI(file);
  if (nativeResult.success) {
    return nativeResult;
  }

  console.log('Native API failed, trying fallback method...');

  // Method 2: Fallback to html5-qrcode library
  const fallbackResult = await scanWithHtml5Qrcode(file);
  return fallbackResult;
}

/**
 * Get user-friendly error message based on scan result
 */
export function getBarcodeErrorMessage(result: BarcodeScanResult): string {
  if (!result.error) {
    return 'Unknown error occurred';
  }

  const errorLower = result.error.toLowerCase();

  if (errorLower.includes('no barcode') || 
      errorLower.includes('not detected') || 
      errorLower.includes('notfoundexception') ||
      errorLower.includes('could not be detected')) {
    return 'No barcode found in the image. Please ensure the barcode is clear and well-lit.';
  }

  if (errorLower.includes('invalid') || errorLower.includes('file type')) {
    return 'Invalid image file. Please select a valid image.';
  }

  return 'Failed to scan barcode. Try adjusting image brightness or cropping closer to the barcode.';
}

/**
 * Check if native BarcodeDetector API is available
 */
export function isNativeBarcodeAPIAvailable(): boolean {
  return 'BarcodeDetector' in window;
}
