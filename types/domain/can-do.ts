/**
 * Can-Do Domain Types
 * 
 * Consolidated type definitions for Can-Do checklist functionality.
 * These types are used for tracking learner progress against CEFR-style can-do statements.
 */

/**
 * Represents a Can-Do target statement
 */
export interface CanDoTarget {
  /** Unique identifier for the target */
  id: number;
  /** Topic title (e.g., "あいさつをする") */
  topic_title: string;
  /** Can-Do identifier code */
  cando_id: string;
  /** Description in Japanese */
  description_jp: string;
  /** Description in Indonesian */
  description_id: string;
  /** Star rating (0-3) indicating proficiency level */
  stars: number;
}

/**
 * Represents a chapter grouping of Can-Do targets
 */
export interface CanDoChapter {
  /** Unique identifier for the chapter */
  id: number;
  /** Chapter number */
  chapter_number: number;
  /** Chapter title (e.g., "第1課：はじめまして") */
  chapter_title: string;
  /** Array of targets in this chapter */
  targets: CanDoTarget[];
}

/**
 * Represents a practice scenario for Can-Do evaluation
 */
export interface CanDoScenario {
  /** Unique identifier for the scenario */
  id: number;
  /** Scenario title */
  title: string;
  /** Scenario description */
  description: string;
  /** Associated Can-Do target ID */
  target_id: number;
  /** Array of questions in this scenario */
  questions: CanDoQuestion[];
}

/**
 * Represents a question within a Can-Do scenario
 */
export interface CanDoQuestion {
  /** Unique identifier for the question */
  id: number;
  /** Question text in Japanese */
  question_jp: string;
  /** Question text in Indonesian */
  question_id: string | null;
  /** Correct answer */
  correct_answer: string;
  /** Array of answer options */
  options: string[];
  /** Explanation for the correct answer */
  explanation: string | null;
}

/**
 * Represents a user's answer to a Can-Do question
 */
export interface UserCanDoAnswer {
  /** Unique identifier for the answer */
  id: number;
  /** User ID */
  user_id: number;
  /** Question ID */
  question_id: number;
  /** User's selected answer */
  user_answer: string;
  /** Whether the answer was correct */
  is_correct: boolean;
  /** Timestamp when answered */
  answered_at: string;
}

/**
 * Represents a user's progress on a Can-Do target
 */
export interface UserCanDoProgress {
  /** Unique identifier for the progress record */
  id: number;
  /** User ID */
  user_id: number;
  /** Can-Do target ID */
  target_id: number;
  /** Star rating (0-3) */
  stars: number;
  /** Last updated timestamp */
  updated_at: string;
}
