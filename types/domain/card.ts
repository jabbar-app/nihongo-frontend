/**
 * Card Domain Types
 * 
 * Consolidated type definitions for flashcards and user card data.
 * These types are used for vocabulary learning and spaced repetition.
 */

/**
 * Represents a flashcard with vocabulary information
 */
export interface Card {
  /** Unique identifier for the card */
  id: number;
  /** Kanji representation (optional) */
  kanji: string | null;
  /** Kana reading (hiragana/katakana) */
  kana: string;
  /** Meaning in Indonesian */
  meaning_id: string;
  /** Meaning in English (optional) */
  meaning_en: string | null;
  /** Example sentence in Japanese (optional) */
  example_sentence_ja: string | null;
  /** Example sentence in Indonesian (optional) */
  example_sentence_id: string | null;
  /** Example sentence in English (optional) */
  example_sentence_en: string | null;
  /** Part of speech (e.g., "noun", "verb") */
  part_of_speech: string | null;
  /** JLPT level (e.g., "N5", "N4") */
  jlpt_level: string | null;
  /** Deck ID this card belongs to */
  deck_id: number;
  /** Timestamp when the card was created */
  created_at?: string;
  /** Timestamp when the card was last updated */
  updated_at?: string;
}

/**
 * Represents a user's progress and SRS data for a specific card
 */
export interface UserCard {
  /** Unique identifier for the user card record */
  id: number;
  /** User ID */
  user_id: number;
  /** Card ID */
  card_id: number;
  /** Current SRS interval in days */
  interval: number;
  /** Ease factor for SRS algorithm */
  ease_factor: number;
  /** Number of times reviewed */
  review_count: number;
  /** Number of times marked as correct */
  correct_count: number;
  /** Next review date */
  next_review_date: string;
  /** Last review date */
  last_review_date: string | null;
  /** Current status of the card */
  status: 'new' | 'learning' | 'review' | 'mastered';
  /** Timestamp when the user card was created */
  created_at: string;
  /** Timestamp when the user card was last updated */
  updated_at: string;
}

/**
 * Represents a card with user-specific data
 */
export interface CardWithUserData extends Card {
  /** User-specific card data */
  user_card: UserCard | null;
}

/**
 * Represents the result of a card review
 */
export interface ReviewResult {
  /** Card ID that was reviewed */
  card_id: number;
  /** User's rating (1-4: again, hard, good, easy) */
  rating: 1 | 2 | 3 | 4;
  /** New interval calculated */
  new_interval: number;
  /** New ease factor */
  new_ease_factor: number;
  /** Next review date */
  next_review_date: string;
  /** Whether the card was marked correct */
  is_correct: boolean;
}
