/**
 * Dictionary Type Mappers
 * 
 * Mapper functions to transform API dictionary responses to domain types.
 */

import type { DictionaryResult, DictionaryEntry, DictionaryExample } from '../domain/dictionary';

/**
 * API response type for dictionary search result
 */
export interface DictionaryResultResponse {
  word: string;
  reading: string;
  meanings: string[];
  part_of_speech?: string;
  jlpt_level?: string;
  examples?: string[];
}

/**
 * API response type for dictionary example
 */
export interface DictionaryExampleResponse {
  sentence_ja: string;
  sentence_id: string;
  sentence_en: string | null;
}

/**
 * API response type for dictionary entry
 */
export interface DictionaryEntryResponse {
  id: number;
  word: string;
  reading: string;
  meanings_id: string[];
  meanings_en: string[];
  part_of_speech: string;
  jlpt_level: string | null;
  common_level: number | null;
  examples: DictionaryExampleResponse[];
}

/**
 * Maps API dictionary result response to domain DictionaryResult type
 * 
 * @param response - API dictionary result response
 * @returns Domain DictionaryResult object
 * 
 * @example
 * ```typescript
 * const result = mapDictionaryResultResponse(apiResponse);
 * ```
 */
export const mapDictionaryResultResponse = (response: DictionaryResultResponse): DictionaryResult => ({
  word: response.word,
  reading: response.reading,
  meanings: response.meanings,
  part_of_speech: response.part_of_speech,
  jlpt_level: response.jlpt_level,
  examples: response.examples,
});

/**
 * Maps API dictionary example response to domain DictionaryExample type
 * 
 * @param response - API dictionary example response
 * @returns Domain DictionaryExample object
 * 
 * @example
 * ```typescript
 * const example = mapDictionaryExampleResponse(apiResponse);
 * ```
 */
export const mapDictionaryExampleResponse = (response: DictionaryExampleResponse): DictionaryExample => ({
  sentence_ja: response.sentence_ja,
  sentence_id: response.sentence_id,
  sentence_en: response.sentence_en,
});

/**
 * Maps API dictionary entry response to domain DictionaryEntry type
 * 
 * @param response - API dictionary entry response
 * @returns Domain DictionaryEntry object
 * 
 * @example
 * ```typescript
 * const entry = mapDictionaryEntryResponse(apiResponse);
 * ```
 */
export const mapDictionaryEntryResponse = (response: DictionaryEntryResponse): DictionaryEntry => ({
  id: response.id,
  word: response.word,
  reading: response.reading,
  meanings_id: response.meanings_id,
  meanings_en: response.meanings_en,
  part_of_speech: response.part_of_speech,
  jlpt_level: response.jlpt_level,
  common_level: response.common_level,
  examples: response.examples.map(mapDictionaryExampleResponse),
});
