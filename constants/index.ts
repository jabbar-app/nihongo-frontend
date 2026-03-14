/**
 * Constants Barrel Export
 * 
 * Central export point for all application constants.
 * Import constants from this file to access any constant category.
 * 
 * @example
 * ```typescript
 * // Import multiple constants
 * import { AUTH_CONSTANTS, ROUTES, API_CONSTANTS } from '@/constants';
 * 
 * // Use in your code
 * const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
 * router.push(ROUTES.AUTH.LOGIN);
 * fetch(API_CONSTANTS.ENDPOINTS.DASHBOARD);
 * ```
 * 
 * @see {@link ./README.md} - Complete documentation with usage examples
 * @see {@link ./QUICK_REFERENCE.md} - Quick reference guide for common patterns
 * @see {@link ./MIGRATION_CHECKLIST.md} - Step-by-step migration checklist
 * 
 * @module constants
 */

export { AUTH_CONSTANTS } from './auth';
export { API_CONSTANTS } from './api';
export { ROUTES } from './routes';
export { UI_CONSTANTS } from './ui';
export { MESSAGES } from './messages';
export { VALIDATION_CONSTANTS } from './validation';
export { TIME_CONSTANTS } from './time';
export { COUNTRY_CONSTANTS } from './countries';
