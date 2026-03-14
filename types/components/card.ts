/**
 * Card Component Types
 * 
 * Consolidated type definitions for card components.
 */

import React from 'react';

/**
 * Base props for card components
 */
export interface BaseCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the card is clickable/hoverable */
  hoverable?: boolean;
}

/**
 * Props for Card component
 */
export interface CardProps extends BaseCardProps {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Props for StatsCard component
 */
export interface StatsCardProps {
  /** Title of the stat */
  title: string;
  /** Value to display */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Trend indicator */
  trend?: {
    /** Trend value */
    value: number;
    /** Whether the trend is positive */
    isPositive: boolean;
  };
  /** Color variant */
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for DeckCard component
 */
export interface DeckCardProps {
  /** Deck name */
  name: string;
  /** Deck description */
  description?: string;
  /** Number of cards in the deck */
  cardCount: number;
  /** Number of cards due for review */
  dueCount?: number;
  /** JLPT level */
  level?: string;
  /** Whether this is an official deck */
  isOfficial?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for CardHeader component
 */
export interface CardHeaderProps {
  /** Header title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional action button or element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for CardFooter component
 */
export interface CardFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}
