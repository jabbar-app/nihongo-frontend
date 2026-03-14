/**
 * Deck Domain Types
 * 
 * Consolidated type definitions for flashcard decks.
 * These types are used for managing collections of flashcards.
 */

/**
 * Represents a flashcard deck
 */
export interface Deck {
  /** Unique identifier for the deck */
  id: number;
  /** Name of the deck */
  name: string;
  /** Optional description of the deck */
  description: string | null;
  /** JLPT level (e.g., "N5", "N4", "N3") */
  level: string | null;
  /** Source of the deck content */
  source: string | null;
  /** URL-friendly slug for the deck */
  slug: string;
  /** Whether this is an official/system deck */
  is_official: boolean;
  /** Number of cards in the deck */
  card_count: number;
  /** Timestamp when the deck was created */
  created_at?: string;
  /** Timestamp when the deck was last updated */
  updated_at?: string;
}

/**
 * Represents statistics for a deck
 */
export interface DeckStats {
  /** Total number of cards */
  total_cards: number;
  /** Number of new cards (never studied) */
  new_cards: number;
  /** Number of cards due for review */
  due_cards: number;
  /** Number of mastered cards */
  mastered_cards: number;
  /** Average retention rate (0-100) */
  retention_rate: number;
}

/**
 * Represents a deck with its statistics
 */
export interface DeckWithStats extends Deck {
  /** Deck statistics */
  stats: DeckStats;
}
