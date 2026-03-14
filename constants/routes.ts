/**
 * Route Constants
 * 
 * Contains all application route paths and anchor links for navigation.
 * 
 * @example
 * ```typescript
 * import { ROUTES } from '@/constants';
 * import { useRouter } from 'next/navigation';
 * 
 * const router = useRouter();
 * 
 * // Navigate to login
 * router.push(ROUTES.AUTH.LOGIN);
 * 
 * // Navigate to dashboard
 * router.push(ROUTES.DASHBOARD);
 * 
 * // Use in Link component
 * <Link href={ROUTES.PROFILE}>Profile</Link>
 * ```
 */
export const ROUTES = {
  /** Home page route */
  HOME: '/',
  
  /** Authentication routes */
  AUTH: {
    /** Login page route */
    LOGIN: '/login',
    /** Registration page route */
    REGISTER: '/register',
    /** Logout route */
    LOGOUT: '/logout',
    /** Forgot password page route */
    FORGOT_PASSWORD: '/forgot-password',
    /** Reset password page route */
    RESET_PASSWORD: '/reset-password',
  },
  
  /** Dashboard page route */
  DASHBOARD: '/dashboard',
  /** Review page route */
  REVIEW: '/review',
  /** Practice page route */
  PRACTICE: '/practice',
  /** Test page route */
  TEST: '/test',
  
  /** Materials page route */
  MATERIALS: '/materials',
  /** Decks page route */
  DECKS: '/decks',
  /** History page route */
  HISTORY: '/history',
  /** Profile page route */
  PROFILE: '/profile',
  /** Settings page route */
  SETTINGS: '/settings',
  /** About page route */
  ABOUT: '/about',
  /** Search page route */
  SEARCH: '/search',
  
  /** Page section anchors */
  ANCHORS: {
    /** Features section anchor */
    FEATURES: '#features',
    /** FAQ section anchor */
    FAQ: '#faq',
  },
} as const;
