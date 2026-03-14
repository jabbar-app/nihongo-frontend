/**
 * Practice Domain Types
 * 
 * Consolidated type definitions for practice sessions, messages, and readings.
 * These types are used across practice pages and components.
 */

/**
 * Represents a single message in a practice conversation
 */
export interface PracticeMessage {
  /** Unique identifier for the message */
  id: number;
  /** Role of the message sender */
  role: 'user' | 'assistant';
  /** Content of the message */
  content: string;
  /** Optional feedback on the user's message (JSON string or plain text) */
  feedback: string | null;
  /** Sequence number in the conversation */
  sequence: number;
  /** Timestamp when the message was created */
  created_at: string;
}

/**
 * Represents a practice conversation session
 */
export interface PracticeSession {
  /** Unique identifier for the session */
  id: number;
  /** Optional title for the session */
  title: string | null;
  /** Optional context or scenario for the practice */
  context: string | null;
  /** Optional reference to a reading material */
  reading_id: number | null;
  /** Timestamp when the session started */
  started_at: string;
  /** Timestamp when the session ended (null if ongoing) */
  ended_at: string | null;
  /** Array of messages in the conversation */
  messages: PracticeMessage[];
  /** Optional reading material associated with the session */
  reading?: Reading;
}

/**
 * Represents a reading material (article, conversation, or story)
 */
export interface Reading {
  /** Unique identifier for the reading */
  id: number;
  /** Type of reading material */
  type: string;
  /** Title of the reading */
  title: string;
  /** Optional description of the reading */
  description: string | null;
  /** Content of the reading */
  content: string;
}

/**
 * Represents a practice sentence for vocabulary or grammar practice
 */
export interface PracticeSentence {
  /** Unique identifier for the sentence */
  id: number;
  /** Japanese sentence */
  sentence_jp: string;
  /** Indonesian translation */
  sentence_id: string;
  /** English translation */
  sentence_en: string | null;
  /** Optional audio URL */
  audio_url: string | null;
}
