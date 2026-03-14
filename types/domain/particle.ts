/**
 * Particle Domain Types
 * 
 * Consolidated type definitions for Japanese particle practice.
 */

/**
 * Represents a Japanese particle
 */
export interface Particle {
  /** Unique identifier for the particle */
  id: number;
  /** The particle character(s) */
  particle: string;
  /** Name of the particle */
  name: string;
  /** Description of usage */
  description: string;
  /** Usage examples */
  examples: ParticleExample[];
  /** Common usage patterns */
  usage_patterns: string[];
}

/**
 * Represents an example sentence for a particle
 */
export interface ParticleExample {
  /** Unique identifier for the example */
  id: number;
  /** Japanese sentence */
  sentence_ja: string;
  /** Indonesian translation */
  sentence_id: string;
  /** English translation */
  sentence_en: string | null;
  /** Explanation of particle usage in this context */
  explanation: string | null;
}

/**
 * Represents a particle practice question
 */
export interface ParticleQuestion {
  /** Unique identifier for the question */
  id: number;
  /** Question text (sentence with blank) */
  question: string;
  /** Correct particle answer */
  correct_answer: string;
  /** Array of answer options */
  options: string[];
  /** Explanation for the correct answer */
  explanation: string | null;
  /** Difficulty level (1-5) */
  difficulty: number;
}

/**
 * Represents a user's answer to a particle question
 */
export interface ParticleUserAnswer {
  /** Question ID */
  question_id: number;
  /** User's selected answer */
  user_answer: string;
  /** Whether the answer was correct */
  is_correct: boolean;
  /** Timestamp when answered */
  answered_at: string;
}
