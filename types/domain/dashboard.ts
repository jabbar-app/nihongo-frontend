/**
 * Dashboard Domain Types
 * 
 * Consolidated type definitions for dashboard statistics and data.
 * These types are used for displaying user progress and activity metrics.
 */

/**
 * Represents comprehensive dashboard statistics
 */
export interface DashboardData {
  /** Number of cards due for review today */
  dueToday: number;
  /** Number of cards reviewed today */
  reviewedToday: number;
  /** Total number of cards in user's collection */
  totalCards: number;
  /** Number of mastered cards */
  masteredCards: number;
  /** Number of new cards (never studied) */
  newCards: number;
  /** Number of cards in learning phase */
  learningCards: number;
  /** Current study streak in days */
  studyStreak: number;
  /** Longest study streak achieved */
  longestStreak: number;
  /** Total number of reviews completed */
  totalReviews: number;
  /** Average retention rate (0-100) */
  retentionRate: number;
  /** Number of practice sessions completed */
  practiceSessionsCount: number;
  /** Total practice time in minutes */
  totalPracticeTime: number;
  /** Recent activity data for charts */
  recentActivity?: DailyActivity[];
  /** Deck-specific statistics */
  deckStats?: DeckStatsSummary[];
}

/**
 * Represents daily activity data
 */
export interface DailyActivity {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of reviews completed */
  reviews: number;
  /** Number of new cards studied */
  new_cards: number;
  /** Practice time in minutes */
  practice_time: number;
}

/**
 * Represents summary statistics for a deck
 */
export interface DeckStatsSummary {
  /** Deck ID */
  deck_id: number;
  /** Deck name */
  deck_name: string;
  /** Total cards in deck */
  total_cards: number;
  /** Cards due for review */
  due_cards: number;
  /** Mastered cards */
  mastered_cards: number;
  /** Retention rate (0-100) */
  retention_rate: number;
}

/**
 * Represents user profile statistics
 */
export interface UserStats {
  /** Total study time in minutes */
  total_study_time: number;
  /** Total number of reviews */
  total_reviews: number;
  /** Total number of practice sessions */
  total_practice_sessions: number;
  /** Current level or rank */
  level: number;
  /** Experience points */
  experience_points: number;
  /** Member since date */
  member_since: string;
}
