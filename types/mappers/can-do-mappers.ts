/**
 * Can-Do Type Mappers
 * 
 * Mapper functions to transform API Can-Do responses to domain types.
 */

import type {
  CanDoTarget,
  CanDoChapter,
  CanDoScenario,
  CanDoQuestion,
  UserCanDoAnswer,
  UserCanDoProgress,
} from '../domain/can-do';

/**
 * API response type for Can-Do target data
 */
export interface CanDoTargetResponse {
  id: number;
  topic_title: string;
  cando_id: string;
  description_jp: string;
  description_id: string;
  stars: number;
}

/**
 * API response type for Can-Do chapter data
 */
export interface CanDoChapterResponse {
  id: number;
  chapter_number: number;
  chapter_title: string;
  targets: CanDoTargetResponse[];
}

/**
 * API response type for Can-Do question data
 */
export interface CanDoQuestionResponse {
  id: number;
  question_jp: string;
  question_id: string | null;
  correct_answer: string;
  options: string[];
  explanation: string | null;
}

/**
 * API response type for Can-Do scenario data
 */
export interface CanDoScenarioResponse {
  id: number;
  title: string;
  description: string;
  target_id: number;
  questions: CanDoQuestionResponse[];
}

/**
 * API response type for user Can-Do answer data
 */
export interface UserCanDoAnswerResponse {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  answered_at: string;
}

/**
 * API response type for user Can-Do progress data
 */
export interface UserCanDoProgressResponse {
  id: number;
  user_id: number;
  target_id: number;
  stars: number;
  updated_at: string;
}

/**
 * Maps API Can-Do target response to domain CanDoTarget type
 * 
 * @param response - API Can-Do target response
 * @returns Domain CanDoTarget object
 * 
 * @example
 * ```typescript
 * const target = mapCanDoTargetResponse(apiResponse);
 * ```
 */
export const mapCanDoTargetResponse = (response: CanDoTargetResponse): CanDoTarget => ({
  id: response.id,
  topic_title: response.topic_title,
  cando_id: response.cando_id,
  description_jp: response.description_jp,
  description_id: response.description_id,
  stars: response.stars,
});

/**
 * Maps API Can-Do chapter response to domain CanDoChapter type
 * 
 * @param response - API Can-Do chapter response
 * @returns Domain CanDoChapter object
 * 
 * @example
 * ```typescript
 * const chapter = mapCanDoChapterResponse(apiResponse);
 * ```
 */
export const mapCanDoChapterResponse = (response: CanDoChapterResponse): CanDoChapter => ({
  id: response.id,
  chapter_number: response.chapter_number,
  chapter_title: response.chapter_title,
  targets: response.targets.map(mapCanDoTargetResponse),
});

/**
 * Maps API Can-Do question response to domain CanDoQuestion type
 * 
 * @param response - API Can-Do question response
 * @returns Domain CanDoQuestion object
 * 
 * @example
 * ```typescript
 * const question = mapCanDoQuestionResponse(apiResponse);
 * ```
 */
export const mapCanDoQuestionResponse = (response: CanDoQuestionResponse): CanDoQuestion => ({
  id: response.id,
  question_jp: response.question_jp,
  question_id: response.question_id,
  correct_answer: response.correct_answer,
  options: response.options,
  explanation: response.explanation,
});

/**
 * Maps API Can-Do scenario response to domain CanDoScenario type
 * 
 * @param response - API Can-Do scenario response
 * @returns Domain CanDoScenario object
 * 
 * @example
 * ```typescript
 * const scenario = mapCanDoScenarioResponse(apiResponse);
 * ```
 */
export const mapCanDoScenarioResponse = (response: CanDoScenarioResponse): CanDoScenario => ({
  id: response.id,
  title: response.title,
  description: response.description,
  target_id: response.target_id,
  questions: response.questions.map(mapCanDoQuestionResponse),
});

/**
 * Maps API user Can-Do answer response to domain UserCanDoAnswer type
 * 
 * @param response - API user Can-Do answer response
 * @returns Domain UserCanDoAnswer object
 * 
 * @example
 * ```typescript
 * const answer = mapUserCanDoAnswerResponse(apiResponse);
 * ```
 */
export const mapUserCanDoAnswerResponse = (response: UserCanDoAnswerResponse): UserCanDoAnswer => ({
  id: response.id,
  user_id: response.user_id,
  question_id: response.question_id,
  user_answer: response.user_answer,
  is_correct: response.is_correct,
  answered_at: response.answered_at,
});

/**
 * Maps API user Can-Do progress response to domain UserCanDoProgress type
 * 
 * @param response - API user Can-Do progress response
 * @returns Domain UserCanDoProgress object
 * 
 * @example
 * ```typescript
 * const progress = mapUserCanDoProgressResponse(apiResponse);
 * ```
 */
export const mapUserCanDoProgressResponse = (response: UserCanDoProgressResponse): UserCanDoProgress => ({
  id: response.id,
  user_id: response.user_id,
  target_id: response.target_id,
  stars: response.stars,
  updated_at: response.updated_at,
});
