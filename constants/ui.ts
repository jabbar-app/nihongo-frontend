/**
 * UI Constants
 * 
 * Contains all UI-related constants including breakpoints, colors,
 * animation durations, pagination limits, and file upload settings.
 * 
 * @example
 * ```typescript
 * import { UI_CONSTANTS } from '@/constants';
 * 
 * // Responsive design
 * const isMobile = window.innerWidth < UI_CONSTANTS.BREAKPOINTS.MD;
 * 
 * // Colors
 * <div style={{ backgroundColor: UI_CONSTANTS.COLORS.PRIMARY }} />
 * 
 * // Animations
 * <motion.div
 *   transition={{ duration: UI_CONSTANTS.ANIMATION.FADE_DURATION }}
 * />
 * 
 * // File validation
 * const isValid = file.size <= UI_CONSTANTS.FILE_UPLOAD.MAX_SIZE;
 * ```
 */
export const UI_CONSTANTS = {
  /** Responsive breakpoints in pixels */
  BREAKPOINTS: {
    /** Small devices (640px) */
    SM: 640,
    /** Medium devices (768px) */
    MD: 768,
    /** Large devices (1024px) */
    LG: 1024,
    /** Extra large devices (1280px) */
    XL: 1280,
  },
  
  /** Theme colors and overlays */
  COLORS: {
    /** Primary brand color (teal-500) */
    PRIMARY: '#14b8a6',
    /** Light overlay color */
    OVERLAY_LIGHT: 'rgba(255,255,255,0.15)',
    /** Dark overlay color */
    OVERLAY_DARK: 'rgba(255,255,255,0.08)',
  },
  
  /** Brand-specific colors */
  BRAND_COLORS: {
    /** Google brand colors */
    GOOGLE: {
      /** Google blue */
      BLUE: '#4285F4',
      /** Google green */
      GREEN: '#34A853',
      /** Google yellow */
      YELLOW: '#FBBC05',
      /** Google red */
      RED: '#EA4335',
    },
  },
  
  /** Animation durations and settings */
  ANIMATION: {
    /** Scroll animation duration (1.2s) */
    SCROLL_DURATION: 1.2,
    /** Default animation duration (2s) */
    DEFAULT_DURATION: 2,
    /** Default animation delay (0s) */
    DEFAULT_DELAY: 0,
    /** Fade animation duration (0.8s) */
    FADE_DURATION: 0.8,
    /** Disappear animation duration (0.5s) */
    DISAPPEAR_DURATION: 0.5,
    /** Intersection observer threshold */
    THRESHOLD: 0.1,
  },
  
  /** Pagination settings */
  PAGINATION: {
    /** Review queue items per page */
    REVIEW_QUEUE_LIMIT: 20,
    /** Default page size */
    DEFAULT_PAGE_SIZE: 10,
  },
  
  /** File upload constraints */
  FILE_UPLOAD: {
    /** Maximum file size (5MB) */
    MAX_SIZE: 5 * 1024 * 1024,
    /** Allowed image MIME types */
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  
  /** Shadow styles */
  SHADOWS: {
    /** Inset light shadow */
    INSET_LIGHT: 'inset 0 4px 4px rgba(255,255,255,0.25)',
    /** Drop shadow */
    DROP_SHADOW: '0 4px 10px rgba(0,0,0,0.15)',
  },
  
  /** Number formatting options */
  NUMBER_FORMAT: {
    /** Minimum decimal places */
    MIN_DECIMALS: 0,
  },
} as const;
