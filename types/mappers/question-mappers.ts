/**
 * Question Type Mappers
 * 
 * Mapper functions to transform API question responses to domain types.
 */

import type {
  Question,
  UserAnswer,
  Quiz,
  QuizAttempt,
} from '../domain/question';

/**
 * API response type for question data
 */
export interface QuestionResponse {
  id: number;
  question_jp: string;
  question_id: string | null;
  question_en: string | null;
  correct_answer: string;
  options: string[];
  explanation: string | null;
  type: string;
  difficulty: number;
  category: string | null;
}

/**
 * API response type for user answer data
 */
export interface UserAnswerResponse {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  time_taken: number | null;
  answered_at: string;
}

/**
 * API response type for quiz data
 */
export interface QuizResponse {
  id: number;
  title: string;
  description: string | null;
  questions: QuestionResponse[];
  time_limit: number | null;
  passing_score: number;
  category: string;
}

/**
 * API response type for quiz attempt data
 */
export interface QuizAttemptResponse {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  passed: boolean;
  time_taken: number;
  answers: UserAnswerResponse[];
  started_at: string;
  completed_at: string;
}

/**
 * Maps API question response to domain Question type
 * 
 * @param response - API question response
 * @returns Domain Question object
 * 
 * @example
 * ```typescript
 * const question = mapQuestionResponse(apiResponse);
 * ```
 */
export const mapQuestionResponse = (response: QuestionResponse): Question => ({
  id: response.id,
  question_jp: response.question_jp,
  question_id: response.question_id,
  question_en: response.question_en,
  correct_answer: response.correct_answer,
  options: response.options,
  explanation: response.explanation,
  type: response.type as 'multiple_choice' | 'fill_in_blank' | 'true_false' | 'matching',
  difficulty: response.difficulty,
  category: response.category,
});

/**
 * Maps API user answer response to domain UserAnswer type
 * 
 * @param response - API user answer response
 * @returns Domain UserAnswer object
 * 
 * @example
 * ```typescript
 * const answer = mapUserAnswerResponse(apiResponse);
 * ```
 */
export const mapUserAnswerResponse = (response: UserAnswerResponse): UserAnswer => ({
  id: response.id,
  user_id: response.user_id,
  question_id: response.question_id,
  user_answer: response.user_answer,
  is_correct: response.is_correct,
  time_taken: response.time_taken,
  answered_at: response.answered_at,
});

/**
 * Maps API quiz response to domain Quiz type
 * 
 * @param response - API quiz response
 * @returns Domain Quiz object
 * 
 * @example
 * ```typescript
 * const quiz = mapQuizResponse(apiResponse);
 * ```
 */
export const mapQuizResponse = (response: QuizResponse): Quiz => ({
  id: response.id,
  title: response.title,
  description: response.description,
  questions: response.questions.map(mapQuestionResponse),
  time_limit: response.time_limit,
  passing_score: response.passing_score,
  category: response.category,
});

/**
 * Maps API quiz attempt response to domain QuizAttempt type
 * 
 * @param response - API quiz attempt response
 * @returns Domain QuizAttempt object
 * 
 * @example
 * ```typescript
 * const attempt = mapQuizAttemptResponse(apiResponse);
 * ```
 */
export const mapQuizAttemptResponse = (response: QuizAttemptResponse): QuizAttempt => ({
  id: response.id,
  user_id: response.user_id,
  quiz_id: response.quiz_id,
  score: response.score,
  passed: response.passed,
  time_taken: response.time_taken,
  answers: response.answers.map(mapUserAnswerResponse),
  started_at: response.started_at,
  completed_at: response.completed_at,
});
