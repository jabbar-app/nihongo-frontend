/**
 * Message Constants
 * 
 * Contains all user-facing messages including errors, success messages,
 * loading states, confirmations, empty states, and validation messages.
 * 
 * @example
 * ```typescript
 * import { MESSAGES } from '@/constants';
 * import { toast } from 'sonner';
 * 
 * // Show error message
 * toast.error(MESSAGES.ERRORS.GENERIC);
 * 
 * // Show success message
 * toast.success(MESSAGES.SUCCESS.PROFILE_UPDATED);
 * 
 * // Display loading state
 * <div>{isLoading ? MESSAGES.LOADING.DECKS : 'Content'}</div>
 * 
 * // Confirmation dialog
 * const confirmed = window.confirm(MESSAGES.CONFIRM.DELETE_DECK);
 * ```
 */
export const MESSAGES = {
  /** Error messages */
  ERRORS: {
    /** Generic error message */
    GENERIC: 'An error occurred',
    /** Unauthorized access error */
    UNAUTHORIZED: 'Unauthorized',
    /** API error prefix */
    API_PREFIX: 'API Error: ',
    /** Invalid file type error */
    INVALID_FILE_TYPE: 'Please select an image file',
    /** File size exceeded error */
    FILE_TOO_LARGE: 'Image size must be less than 5MB',
    /** Network connection error */
    NETWORK: 'Network error. Please check your connection.',
  },
  
  /** Success messages */
  SUCCESS: {
    /** Profile update success */
    PROFILE_UPDATED: 'Profile updated successfully',
    /** Profile image update success */
    PROFILE_IMAGE_UPDATED: 'Profile image updated successfully',
    /** Password update success */
    PASSWORD_UPDATED: 'Password updated successfully',
    /** Deck creation success */
    DECK_CREATED: 'Deck created successfully',
    /** Deck deletion success */
    DECK_DELETED: 'Deck deleted successfully',
  },
  
  /** Loading state messages */
  LOADING: {
    /** Default loading message */
    DEFAULT: 'Loading...',
    /** Decks loading message */
    DECKS: 'Loading your study decks...',
    /** Profile loading message */
    PROFILE: 'Loading profile...',
  },
  
  /** Confirmation dialog messages */
  CONFIRM: {
    /** Deck deletion confirmation */
    DELETE_DECK: 'Are you sure you want to delete this deck? This action cannot be undone.',
    /** Note deletion confirmation */
    DELETE_NOTE: 'Are you sure you want to delete this note?',
    /** Logout confirmation */
    LOGOUT: 'Are you sure you want to log out?',
  },
  
  /** Empty state messages */
  EMPTY_STATE: {
    /** No decks available message */
    NO_DECKS: 'No decks available yet',
    /** No notes available message */
    NO_NOTES: 'No notes yet. Add notes while studying materials!',
    /** No reviews due message */
    NO_REVIEWS: 'No reviews due today',
  },
  
  /** Validation error messages */
  VALIDATION: {
    /** Password minimum length error */
    PASSWORD_MIN_LENGTH: 'New password must be at least 8 characters long',
    /** Password mismatch error */
    PASSWORD_MISMATCH: 'New passwords do not match',
    /** Required field error */
    REQUIRED_FIELD: 'This field is required',
    /** Invalid email error */
    INVALID_EMAIL: 'Please enter a valid email address',
  },
} as const;
