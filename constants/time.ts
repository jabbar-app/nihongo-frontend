/**
 * Time Constants
 * 
 * Contains all time-related conversion constants for calculations
 * involving seconds, minutes, hours, and days.
 * 
 * @example
 * ```typescript
 * import { TIME_CONSTANTS } from '@/constants';
 * 
 * // Convert minutes to milliseconds
 * const timeoutMs = 30 * TIME_CONSTANTS.MINUTES_PER_HOUR * 
 *                   TIME_CONSTANTS.MILLISECONDS_PER_SECOND;
 * 
 * // Convert hours to minutes
 * const minutes = 2 * TIME_CONSTANTS.MINUTES_PER_HOUR;
 * 
 * // Calculate milliseconds in a day
 * const msPerDay = TIME_CONSTANTS.HOURS_PER_DAY * 
 *                  TIME_CONSTANTS.MINUTES_PER_HOUR * 
 *                  TIME_CONSTANTS.SECONDS_PER_MINUTE * 
 *                  TIME_CONSTANTS.MILLISECONDS_PER_SECOND;
 * ```
 */
export const TIME_CONSTANTS = {
  /** Number of seconds in a minute (60) */
  SECONDS_PER_MINUTE: 60,
  
  /** Number of minutes in an hour (60) */
  MINUTES_PER_HOUR: 60,
  
  /** Number of hours in a day (24) */
  HOURS_PER_DAY: 24,
  
  /** Number of minutes in a day (1440) */
  MINUTES_PER_DAY: 1440,
  
  /** Number of milliseconds in a second (1000) */
  MILLISECONDS_PER_SECOND: 1000,
} as const;
