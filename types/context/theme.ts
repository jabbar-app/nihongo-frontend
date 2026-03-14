/**
 * Theme Context Types
 * 
 * Type definitions for theme context and dark mode functionality.
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme context type
 */
export interface ThemeContextType {
  /** Current theme mode */
  theme: ThemeMode;
  /** Function to set the theme */
  setTheme: (theme: ThemeMode) => void;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
}
