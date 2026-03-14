/**
 * Practice Type Mappers
 * 
 * Mapper functions to transform API practice responses to domain types.
 */

import type { PracticeMessage, PracticeSession, Reading, PracticeSentence } from '../domain/practice';

/**
 * API response type for practice message data
 */
export interface PracticeMessageResponse {
  id: number;
  role: string;
  content: string;
  feedback: string | null;
  sequence: number;
  created_at: string;
}

/**
 * API response type for reading data
 */
export interface ReadingResponse {
  id: number;
  type: string;
  title: string;
  description: string | null;
  content: string;
}

/**
 * API response type for practice session data
 */
export interface PracticeSessionResponse {
  id: number;
  title: string | null;
  context: string | null;
  reading_id: number | null;
  started_at: string;
  ended_at: string | null;
  messages: PracticeMessageResponse[];
  reading?: ReadingResponse;
}

/**
 * API response type for practice sentence data
 */
export interface PracticeSentenceResponse {
  id: number;
  sentence_jp: string;
  sentence_id: string;
  sentence_en: string | null;
  audio_url: string | null;
}

/**
 * Maps API practice message response to domain PracticeMessage type
 * 
 * @param response - API practice message response
 * @returns Domain PracticeMessage object
 * 
 * @example
 * ```typescript
 * const message = mapPracticeMessageResponse(apiResponse);
 * ```
 */
export const mapPracticeMessageResponse = (response: PracticeMessageResponse): PracticeMessage => ({
  id: response.id,
  role: response.role as 'user' | 'assistant',
  content: response.content,
  feedback: response.feedback,
  sequence: response.sequence,
  created_at: response.created_at,
});

/**
 * Maps API reading response to domain Reading type
 * 
 * @param response - API reading response
 * @returns Domain Reading object
 * 
 * @example
 * ```typescript
 * const reading = mapReadingResponse(apiResponse);
 * ```
 */
export const mapReadingResponse = (response: ReadingResponse): Reading => ({
  id: response.id,
  type: response.type,
  title: response.title,
  description: response.description,
  content: response.content,
});

/**
 * Maps API practice session response to domain PracticeSession type
 * 
 * @param response - API practice session response
 * @returns Domain PracticeSession object
 * 
 * @example
 * ```typescript
 * const session = mapPracticeSessionResponse(apiResponse);
 * ```
 */
export const mapPracticeSessionResponse = (response: PracticeSessionResponse): PracticeSession => ({
  id: response.id,
  title: response.title,
  context: response.context,
  reading_id: response.reading_id,
  started_at: response.started_at,
  ended_at: response.ended_at,
  messages: response.messages.map(mapPracticeMessageResponse),
  reading: response.reading ? mapReadingResponse(response.reading) : undefined,
});

/**
 * Maps API practice sentence response to domain PracticeSentence type
 * 
 * @param response - API practice sentence response
 * @returns Domain PracticeSentence object
 * 
 * @example
 * ```typescript
 * const sentence = mapPracticeSentenceResponse(apiResponse);
 * ```
 */
export const mapPracticeSentenceResponse = (response: PracticeSentenceResponse): PracticeSentence => ({
  id: response.id,
  sentence_jp: response.sentence_jp,
  sentence_id: response.sentence_id,
  sentence_en: response.sentence_en,
  audio_url: response.audio_url,
});
