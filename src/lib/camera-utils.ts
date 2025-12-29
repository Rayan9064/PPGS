/**
 * Camera Utilities
 * Handles camera detection and selection
 */

import { Html5Qrcode } from 'html5-qrcode';

export interface CameraDevice {
  id: string;
  label: string;
}

/**
 * Get list of available cameras
 */
export async function getAvailableCameras(): Promise<CameraDevice[]> {
  try {
    const devices = await Html5Qrcode.getCameras();
    return devices.map(device => ({
      id: device.id,
      label: device.label || `Camera ${device.id}`
    }));
  } catch (error) {
    console.error('Error getting cameras:', error);
    return [];
  }
}

/**
 * Select the best default camera (prefer back/rear camera)
 */
export function selectDefaultCamera(cameras: CameraDevice[]): string | null {
  if (cameras.length === 0) return null;

  // Prefer back/rear/environment camera
  const backCamera = cameras.find(device => {
    const label = device.label.toLowerCase();
    return label.includes('back') || 
           label.includes('rear') || 
           label.includes('environment');
  });

  return backCamera ? backCamera.id : cameras[0].id;
}

/**
 * Check if multiple cameras are available
 */
export function hasMultipleCameras(cameras: CameraDevice[]): boolean {
  return cameras.length > 1;
}
