/**
 * Country Constants
 * 
 * Contains country codes, flags, and related information for
 * international phone number formatting and country selection.
 * 
 * @example
 * ```typescript
 * import { COUNTRY_CONSTANTS } from '@/constants';
 * 
 * // Display country selector
 * <select>
 *   {COUNTRY_CONSTANTS.CODES.map(({ code, country, flag }) => (
 *     <option key={code} value={code}>
 *       {flag} {country} (+{code})
 *     </option>
 *   ))}
 * </select>
 * 
 * // Get default country code
 * const defaultCode = COUNTRY_CONSTANTS.DEFAULT_CODE; // '62' (Indonesia)
 * 
 * // Find country by code
 * const country = COUNTRY_CONSTANTS.CODES.find(c => c.code === '81');
 * console.log(country?.country); // 'Japan'
 * ```
 */
export const COUNTRY_CONSTANTS = {
  /** List of supported countries with codes and flags */
  CODES: [
    { code: '62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '65', country: 'Singapore', flag: '🇸🇬' },
    { code: '66', country: 'Thailand', flag: '🇹🇭' },
    { code: '84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '63', country: 'Philippines', flag: '🇵🇭' },
    { code: '81', country: 'Japan', flag: '🇯🇵' },
    { code: '82', country: 'South Korea', flag: '🇰🇷' },
    { code: '86', country: 'China', flag: '🇨🇳' },
    { code: '91', country: 'India', flag: '🇮🇳' },
    { code: '1', country: 'United States', flag: '🇺🇸' },
    { code: '44', country: 'United Kingdom', flag: '🇬🇧' },
  ],
  
  /** Default country code (Indonesia) */
  DEFAULT_CODE: '62',
} as const;
