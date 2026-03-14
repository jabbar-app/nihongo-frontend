/**
 * Card Type Mappers
 * 
 * Mapper functions to transform API card responses to domain types.
 */

import type { Card, UserCard, CardWithUserData, ReviewResult } from '../domain/card';

/**
 * API response type for card data
 */
export interface CardResponse {
  id: number;
  kanji: string | null;
  kana: string;
  meaning_id: string;
  meaning_en: string | null;
  example_sentence_ja: string | null;
  example_sentence_id: string | null;
  example_sentence_en: string | null;
  part_of_speech: string | null;
  jlpt_level: string | null;
  deck_id: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response type for user card data
 */
export interface UserCardResponse {
  id: number;
  user_id: number;
  card_id: number;
  interval: number;
  ease_factor: number;
  review_count: number;
  correct_count: number;
  next_review_date: string;
  last_review_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * API response type for card with user data
 */
export interface CardWithUserDataResponse extends CardResponse {
  user_card: UserCardResponse | null;
}

/**
 * API response type for review result
 */
export interface ReviewResultResponse {
  card_id: number;
  rating: number;
  new_interval: number;
  new_ease_factor: number;
  next_review_date: string;
  is_correct: boolean;
}

/**
 * Maps API card response to domain Card type
 * 
 * @param response - API card response
 * @returns Domain Card object
 * 
 * @example
 * ```typescript
 * const card = mapCardResponse(apiResponse);
 * ```
 */
export const mapCardResponse = (response: CardResponse): Card => ({
  id: response.id,
  kanji: response.kanji,
  kana: response.kana,
  meaning_id: response.meaning_id,
  meaning_en: response.meaning_en,
  example_sentence_ja: response.example_sentence_ja,
  example_sentence_id: response.example_sentence_id,
  example_sentence_en: response.example_sentence_en,
  part_of_speech: response.part_of_speech,
  jlpt_level: response.jlpt_level,
  deck_id: response.deck_id,
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API user card response to domain UserCard type
 * 
 * @param response - API user card response
 * @returns Domain UserCard object
 * 
 * @example
 * ```typescript
 * const userCard = mapUserCardResponse(apiResponse);
 * ```
 */
export const mapUserCardResponse = (response: UserCardResponse): UserCard => ({
  id: response.id,
  user_id: response.user_id,
  card_id: response.card_id,
  interval: response.interval,
  ease_factor: response.ease_factor,
  review_count: response.review_count,
  correct_count: response.correct_count,
  next_review_date: response.next_review_date,
  last_review_date: response.last_review_date,
  status: response.status as 'new' | 'learning' | 'review' | 'mastered',
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API card with user data response to domain CardWithUserData type
 * 
 * @param response - API card with user data response
 * @returns Domain CardWithUserData object
 * 
 * @example
 * ```typescript
 * const cardWithData = mapCardWithUserDataResponse(apiResponse);
 * ```
 */
export const mapCardWithUserDataResponse = (response: CardWithUserDataResponse): CardWithUserData => ({
  ...mapCardResponse(response),
  user_card: response.user_card ? mapUserCardResponse(response.user_card) : null,
});

/**
 * Maps API review result response to domain ReviewResult type
 * 
 * @param response - API review result response
 * @returns Domain ReviewResult object
 * 
 * @example
 * ```typescript
 * const result = mapReviewResultResponse(apiResponse);
 * ```
 */
export const mapReviewResultResponse = (response: ReviewResultResponse): ReviewResult => ({
  card_id: response.card_id,
  rating: response.rating as 1 | 2 | 3 | 4,
  new_interval: response.new_interval,
  new_ease_factor: response.new_ease_factor,
  next_review_date: response.next_review_date,
  is_correct: response.is_correct,
});
