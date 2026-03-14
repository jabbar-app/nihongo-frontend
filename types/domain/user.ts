/**
 * User Domain Types
 * 
 * Consolidated type definitions for user accounts and profiles.
 */

/**
 * Represents a user account
 */
export interface User {
  /** Unique identifier for the user */
  id: number;
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
  /** User's role in the system */
  role: 'admin' | 'user' | 'moderator';
  /** User's profile picture URL */
  avatar_url: string | null;
  /** User's preferred language */
  preferred_language: 'en' | 'id' | 'ja';
  /** Whether the user's email is verified */
  email_verified: boolean;
  /** Timestamp when the user was created */
  created_at: string;
  /** Timestamp when the user was last updated */
  updated_at: string;
}

/**
 * Represents a user's profile information
 */
export interface UserProfile extends User {
  /** User's bio or description */
  bio: string | null;
  /** User's location */
  location: string | null;
  /** User's website URL */
  website: string | null;
  /** User's study goals */
  study_goals: string | null;
  /** User's current JLPT level */
  current_jlpt_level: string | null;
  /** User's target JLPT level */
  target_jlpt_level: string | null;
}
