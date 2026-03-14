/**
 * Header Context Types
 * 
 * Type definitions for header context and navigation state.
 */

/**
 * Header context type
 */
export interface HeaderContextType {
  /** Whether the mobile menu is open */
  isMobileMenuOpen: boolean;
  /** Function to toggle mobile menu */
  toggleMobileMenu: () => void;
  /** Function to close mobile menu */
  closeMobileMenu: () => void;
  /** Current page title */
  pageTitle?: string;
  /** Function to set page title */
  setPageTitle: (title: string) => void;
}
