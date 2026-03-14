/**
 * User Type Mappers
 * 
 * Mapper functions to transform API user responses to domain types.
 */

import type { User, UserProfile } from '../domain/user';

/**
 * API response type for user data
 */
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  preferred_language: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * API response type for user profile data
 */
export interface UserProfileResponse extends UserResponse {
  bio: string | null;
  location: string | null;
  website: string | null;
  study_goals: string | null;
  current_jlpt_level: string | null;
  target_jlpt_level: string | null;
}

/**
 * Maps API user response to domain User type
 * 
 * @param response - API user response
 * @returns Domain User object
 * 
 * @example
 * ```typescript
 * const user = mapUserResponse(apiResponse);
 * ```
 */
export const mapUserResponse = (response: UserResponse): User => ({
  id: response.id,
  name: response.name,
  email: response.email,
  role: response.role as 'admin' | 'user' | 'moderator',
  avatar_url: response.avatar_url,
  preferred_language: response.preferred_language as 'en' | 'id' | 'ja',
  email_verified: response.email_verified,
  created_at: response.created_at,
  updated_at: response.updated_at,
});

/**
 * Maps API user profile response to domain UserProfile type
 * 
 * @param response - API user profile response
 * @returns Domain UserProfile object
 * 
 * @example
 * ```typescript
 * const profile = mapUserProfileResponse(apiResponse);
 * ```
 */
export const mapUserProfileResponse = (response: UserProfileResponse): UserProfile => ({
  ...mapUserResponse(response),
  bio: response.bio,
  location: response.location,
  website: response.website,
  study_goals: response.study_goals,
  current_jlpt_level: response.current_jlpt_level,
  target_jlpt_level: response.target_jlpt_level,
});
