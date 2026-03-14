/**
 * Dashboard Type Mappers
 * 
 * Mapper functions to transform API dashboard responses to domain types.
 */

import type {
  DashboardData,
  DailyActivity,
  DeckStatsSummary,
  UserStats,
} from '../domain/dashboard';

/**
 * API response type for dashboard data
 */
export interface DashboardDataResponse {
  dueToday: number;
  reviewedToday: number;
  totalCards: number;
  masteredCards: number;
  newCards: number;
  learningCards: number;
  studyStreak: number;
  longestStreak: number;
  totalReviews: number;
  retentionRate: number;
  practiceSessionsCount: number;
  totalPracticeTime: number;
  recentActivity?: DailyActivityResponse[];
  deckStats?: DeckStatsSummaryResponse[];
}

/**
 * API response type for daily activity data
 */
export interface DailyActivityResponse {
  date: string;
  reviews: number;
  new_cards: number;
  practice_time: number;
}

/**
 * API response type for deck stats summary
 */
export interface DeckStatsSummaryResponse {
  deck_id: number;
  deck_name: string;
  total_cards: number;
  due_cards: number;
  mastered_cards: number;
  retention_rate: number;
}

/**
 * API response type for user stats
 */
export interface UserStatsResponse {
  total_study_time: number;
  total_reviews: number;
  total_practice_sessions: number;
  level: number;
  experience_points: number;
  member_since: string;
}

/**
 * Maps API daily activity response to domain DailyActivity type
 * 
 * @param response - API daily activity response
 * @returns Domain DailyActivity object
 * 
 * @example
 * ```typescript
 * const activity = mapDailyActivityResponse(apiResponse);
 * ```
 */
export const mapDailyActivityResponse = (response: DailyActivityResponse): DailyActivity => ({
  date: response.date,
  reviews: response.reviews,
  new_cards: response.new_cards,
  practice_time: response.practice_time,
});

/**
 * Maps API deck stats summary response to domain DeckStatsSummary type
 * 
 * @param response - API deck stats summary response
 * @returns Domain DeckStatsSummary object
 * 
 * @example
 * ```typescript
 * const deckStats = mapDeckStatsSummaryResponse(apiResponse);
 * ```
 */
export const mapDeckStatsSummaryResponse = (response: DeckStatsSummaryResponse): DeckStatsSummary => ({
  deck_id: response.deck_id,
  deck_name: response.deck_name,
  total_cards: response.total_cards,
  due_cards: response.due_cards,
  mastered_cards: response.mastered_cards,
  retention_rate: response.retention_rate,
});

/**
 * Maps API dashboard data response to domain DashboardData type
 * 
 * @param response - API dashboard data response
 * @returns Domain DashboardData object
 * 
 * @example
 * ```typescript
 * const dashboard = mapDashboardDataResponse(apiResponse);
 * ```
 */
export const mapDashboardDataResponse = (response: DashboardDataResponse): DashboardData => ({
  dueToday: response.dueToday,
  reviewedToday: response.reviewedToday,
  totalCards: response.totalCards,
  masteredCards: response.masteredCards,
  newCards: response.newCards,
  learningCards: response.learningCards,
  studyStreak: response.studyStreak,
  longestStreak: response.longestStreak,
  totalReviews: response.totalReviews,
  retentionRate: response.retentionRate,
  practiceSessionsCount: response.practiceSessionsCount,
  totalPracticeTime: response.totalPracticeTime,
  recentActivity: response.recentActivity?.map(mapDailyActivityResponse),
  deckStats: response.deckStats?.map(mapDeckStatsSummaryResponse),
});

/**
 * Maps API user stats response to domain UserStats type
 * 
 * @param response - API user stats response
 * @returns Domain UserStats object
 * 
 * @example
 * ```typescript
 * const userStats = mapUserStatsResponse(apiResponse);
 * ```
 */
export const mapUserStatsResponse = (response: UserStatsResponse): UserStats => ({
  total_study_time: response.total_study_time,
  total_reviews: response.total_reviews,
  total_practice_sessions: response.total_practice_sessions,
  level: response.level,
  experience_points: response.experience_points,
  member_since: response.member_since,
});
