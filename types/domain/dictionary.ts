/**
 * Dictionary Domain Types
 * 
 * Consolidated type definitions for dictionary lookups and entries.
 */

/**
 * Represents a dictionary search result
 */
export interface DictionaryResult {
  /** The word or phrase */
  word: string;
  /** Reading in hiragana/katakana */
  reading: string;
  /** Array of meanings/definitions */
  meanings: string[];
  /** Part of speech */
  part_of_speech?: string;
  /** JLPT level if applicable */
  jlpt_level?: string;
  /** Example sentences */
  examples?: string[];
}

/**
 * Represents a detailed dictionary entry
 */
export interface DictionaryEntry {
  /** Unique identifier for the entry */
  id: number;
  /** The word in kanji (if applicable) */
  word: string;
  /** Reading in hiragana */
  reading: string;
  /** Array of meanings in Indonesian */
  meanings_id: string[];
  /** Array of meanings in English */
  meanings_en: string[];
  /** Part of speech */
  part_of_speech: string;
  /** JLPT level */
  jlpt_level: string | null;
  /** Common usage level (1-5, 1 being most common) */
  common_level: number | null;
  /** Array of example sentences */
  examples: DictionaryExample[];
}

/**
 * Represents an example sentence in a dictionary entry
 */
export interface DictionaryExample {
  /** Japanese sentence */
  sentence_ja: string;
  /** Indonesian translation */
  sentence_id: string;
  /** English translation */
  sentence_en: string | null;
}
