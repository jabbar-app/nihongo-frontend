/**
 * Deck Type Mappers
 * 
 * Mapper functions to transform API deck responses to domain types.
 */

import type { Deck, DeckStats, DeckWithStats } from '../domain/deck';

/**
 * API response type for deck data
 */
export interface DeckResponse {
  id: number;
  name: string;
  description: string | null;
  level: string | null;
  source: string | null;
  slug: string;
  is_official: boolean;
  card_count: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response type for deck statistics
 */
export interface DeckStatsResponse {
  total_cards: number;
  new_cards: number;
  due_cards: number;
  mastered_cards: number;
  retention_rate: number;
}

/**
 * API response type for deck with statistics
 */
export interface DeckWithStatsResponse extends DeckResponse {
  stats: DeckStatsResponse;
}

/**
 * Maps API deck response to domain Deck type
 * 
 * @param response - API deck response
 * @returns Domain Deck object
 * 
 * @example
 * ```typescript
 * const deck = mapDeckResponse(apiResponse);
 * ```
 */
export const mapDeckResponse = (response: DeckResponse): Deck => ({
  id: response.id,
  name: response.name,
  description: response.description,
  level: response.level,
  source: response.source,
  slug: response.slug,
  is_official: response.is_official,
  card_count: response.card_count,
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API deck stats response to domain DeckStats type
 * 
 * @param response - API deck stats response
 * @returns Domain DeckStats object
 * 
 * @example
 * ```typescript
 * const stats = mapDeckStatsResponse(apiResponse);
 * ```
 */
export const mapDeckStatsResponse = (response: DeckStatsResponse): DeckStats => ({
  total_cards: response.total_cards,
  new_cards: response.new_cards,
  due_cards: response.due_cards,
  mastered_cards: response.mastered_cards,
  retention_rate: response.retention_rate,
});

/**
 * Maps API deck with stats response to domain DeckWithStats type
 * 
 * @param response - API deck with stats response
 * @returns Domain DeckWithStats object
 * 
 * @example
 * ```typescript
 * const deckWithStats = mapDeckWithStatsResponse(apiResponse);
 * ```
 */
export const mapDeckWithStatsResponse = (response: DeckWithStatsResponse): DeckWithStats => ({
  ...mapDeckResponse(response),
  stats: mapDeckStatsResponse(response.stats),
});
