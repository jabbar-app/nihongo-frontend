/**
 * Question Domain Types
 * 
 * Consolidated type definitions for quiz questions and assessments.
 */

/**
 * Represents a generic question
 */
export interface Question {
  /** Unique identifier for the question */
  id: number;
  /** Question text in Japanese */
  question_jp: string;
  /** Question text in Indonesian */
  question_id: string | null;
  /** Question text in English */
  question_en: string | null;
  /** Correct answer */
  correct_answer: string;
  /** Array of answer options */
  options: string[];
  /** Explanation for the correct answer */
  explanation: string | null;
  /** Question type */
  type: 'multiple_choice' | 'fill_in_blank' | 'true_false' | 'matching';
  /** Difficulty level (1-5) */
  difficulty: number;
  /** Associated topic or category */
  category: string | null;
}

/**
 * Represents a user's answer to a question
 */
export interface UserAnswer {
  /** Unique identifier for the answer record */
  id: number;
  /** User ID */
  user_id: number;
  /** Question ID */
  question_id: number;
  /** User's selected answer */
  user_answer: string;
  /** Whether the answer was correct */
  is_correct: boolean;
  /** Time taken to answer in seconds */
  time_taken: number | null;
  /** Timestamp when answered */
  answered_at: string;
}

/**
 * Represents a quiz or assessment
 */
export interface Quiz {
  /** Unique identifier for the quiz */
  id: number;
  /** Quiz title */
  title: string;
  /** Quiz description */
  description: string | null;
  /** Array of questions in the quiz */
  questions: Question[];
  /** Time limit in minutes (null for no limit) */
  time_limit: number | null;
  /** Passing score percentage */
  passing_score: number;
  /** Quiz category */
  category: string;
}

/**
 * Represents a user's quiz attempt
 */
export interface QuizAttempt {
  /** Unique identifier for the attempt */
  id: number;
  /** User ID */
  user_id: number;
  /** Quiz ID */
  quiz_id: number;
  /** Score achieved (0-100) */
  score: number;
  /** Whether the user passed */
  passed: boolean;
  /** Time taken in seconds */
  time_taken: number;
  /** Array of user answers */
  answers: UserAnswer[];
  /** Timestamp when started */
  started_at: string;
  /** Timestamp when completed */
  completed_at: string;
}
