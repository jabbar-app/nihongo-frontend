/**
 * Validation Constants
 * 
 * Contains all validation rules for passwords, file uploads, and forms.
 * 
 * @example
 * ```typescript
 * import { VALIDATION_CONSTANTS, MESSAGES } from '@/constants';
 * 
 * // Password validation
 * if (password.length < VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH) {
 *   return MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH;
 * }
 * 
 * // File upload validation
 * if (file.size > VALIDATION_CONSTANTS.FILE_UPLOAD.MAX_SIZE) {
 *   return MESSAGES.ERRORS.FILE_TOO_LARGE;
 * }
 * 
 * // Email validation
 * if (!VALIDATION_CONSTANTS.FORM.EMAIL_PATTERN.test(email)) {
 *   return MESSAGES.VALIDATION.INVALID_EMAIL;
 * }
 * ```
 */
export const VALIDATION_CONSTANTS = {
  /** Password validation rules */
  PASSWORD: {
    /** Minimum password length (8 characters) */
    MIN_LENGTH: 8,
    /** Maximum password length (128 characters) */
    MAX_LENGTH: 128,
    /** Require at least one uppercase letter */
    REQUIRE_UPPERCASE: true,
    /** Require at least one number */
    REQUIRE_NUMBER: true,
    /** Require at least one special character */
    REQUIRE_SPECIAL: false,
  },
  
  /** File upload validation rules */
  FILE_UPLOAD: {
    /** Image MIME type prefix */
    IMAGE_PREFIX: 'image/',
    /** Maximum file size (5MB) */
    MAX_SIZE: 5 * 1024 * 1024,
    /** Allowed file extensions */
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  
  /** Form field validation rules */
  FORM: {
    /** Minimum name length (2 characters) */
    NAME_MIN_LENGTH: 2,
    /** Maximum name length (100 characters) */
    NAME_MAX_LENGTH: 100,
    /** Email validation pattern */
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;
