/**
 * Particle Type Mappers
 * 
 * Mapper functions to transform API particle responses to domain types.
 */

import type {
  Particle,
  ParticleExample,
  ParticleQuestion,
  ParticleUserAnswer,
} from '../domain/particle';

/**
 * API response type for particle example data
 */
export interface ParticleExampleResponse {
  id: number;
  sentence_ja: string;
  sentence_id: string;
  sentence_en: string | null;
  explanation: string | null;
}

/**
 * API response type for particle data
 */
export interface ParticleResponse {
  id: number;
  particle: string;
  name: string;
  description: string;
  examples: ParticleExampleResponse[];
  usage_patterns: string[];
}

/**
 * API response type for particle question data
 */
export interface ParticleQuestionResponse {
  id: number;
  question: string;
  correct_answer: string;
  options: string[];
  explanation: string | null;
  difficulty: number;
}

/**
 * API response type for particle user answer data
 */
export interface ParticleUserAnswerResponse {
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  answered_at: string;
}

/**
 * Maps API particle example response to domain ParticleExample type
 * 
 * @param response - API particle example response
 * @returns Domain ParticleExample object
 * 
 * @example
 * ```typescript
 * const example = mapParticleExampleResponse(apiResponse);
 * ```
 */
export const mapParticleExampleResponse = (response: ParticleExampleResponse): ParticleExample => ({
  id: response.id,
  sentence_ja: response.sentence_ja,
  sentence_id: response.sentence_id,
  sentence_en: response.sentence_en,
  explanation: response.explanation,
});

/**
 * Maps API particle response to domain Particle type
 * 
 * @param response - API particle response
 * @returns Domain Particle object
 * 
 * @example
 * ```typescript
 * const particle = mapParticleResponse(apiResponse);
 * ```
 */
export const mapParticleResponse = (response: ParticleResponse): Particle => ({
  id: response.id,
  particle: response.particle,
  name: response.name,
  description: response.description,
  examples: response.examples.map(mapParticleExampleResponse),
  usage_patterns: response.usage_patterns,
});

/**
 * Maps API particle question response to domain ParticleQuestion type
 * 
 * @param response - API particle question response
 * @returns Domain ParticleQuestion object
 * 
 * @example
 * ```typescript
 * const question = mapParticleQuestionResponse(apiResponse);
 * ```
 */
export const mapParticleQuestionResponse = (response: ParticleQuestionResponse): ParticleQuestion => ({
  id: response.id,
  question: response.question,
  correct_answer: response.correct_answer,
  options: response.options,
  explanation: response.explanation,
  difficulty: response.difficulty,
});

/**
 * Maps API particle user answer response to domain ParticleUserAnswer type
 * 
 * @param response - API particle user answer response
 * @returns Domain ParticleUserAnswer object
 * 
 * @example
 * ```typescript
 * const answer = mapParticleUserAnswerResponse(apiResponse);
 * ```
 */
export const mapParticleUserAnswerResponse = (response: ParticleUserAnswerResponse): ParticleUserAnswer => ({
  question_id: response.question_id,
  user_answer: response.user_answer,
  is_correct: response.is_correct,
  answered_at: response.answered_at,
});
