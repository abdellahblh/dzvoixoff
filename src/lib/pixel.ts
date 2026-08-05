import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Facebook Pixel and CAPI Event Tracking Utility
 */

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export const trackPixelEvent = async (eventName: string, params?: any, userData?: any) => {
  // Generate a unique event ID for deduplication
  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Extract Facebook cookies for better matching
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');

  console.log(`[Pixel] Tracking ${eventName}`, { params, userData, eventId });

  // 1. Browser-side tracking (Pixel)
  // Note: Browser uses 'eventID' (case sensitive) for deduplication
  if (typeof window !== 'undefined' && (window as any).fbq) {
    // Re-initialize with user data for Advanced Matching if available
    if (userData && Object.keys(userData).length > 0) {
      (window as any).fbq('init', '829073811611520', userData);
    }
    (window as any).fbq('track', eventName, params, { eventID: eventId });
  }

  // 2. Server-side tracking (CAPI) via Firebase Function
  try {
    const trackCapiEvent = httpsCallable(functions, 'trackCapiEvent');
    
    const capiUserData: any = { ...userData };
    if (fbp) capiUserData.fbp = fbp;
    if (fbc) capiUserData.fbc = fbc;

    await trackCapiEvent({
      eventName,
      userData: capiUserData,
      customData: params || {},
      eventId
    });
  } catch (error) {
    console.warn('[Pixel] CAPI tracking unavailable or failed. Falling back to browser pixel only.');
  }
};
