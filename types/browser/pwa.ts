/**
 * PWA (Progressive Web App) Types
 * 
 * Type definitions for PWA-related browser APIs.
 */

/**
 * Before install prompt event
 */
export interface BeforeInstallPromptEvent extends Event {
  /** Prompt the user to install the PWA */
  prompt(): Promise<void>;
  /** User's choice result */
  userChoice: Promise<{
    /** Outcome of the prompt */
    outcome: 'accepted' | 'dismissed';
    /** Platform where the app was installed */
    platform: string;
  }>;
}

/**
 * Extend Window interface with PWA events
 */
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
