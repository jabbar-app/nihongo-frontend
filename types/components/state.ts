/**
 * State Component Types
 * 
 * Consolidated type definitions for state display components (loading, error, empty states).
 */

import React from 'react';

/**
 * Props for LoadingScreen component
 */
export interface LoadingScreenProps {
  /** Loading message */
  message?: string;
  /** Size of the loading indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show as fullscreen */
  fullscreen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for ErrorScreen component
 */
export interface ErrorScreenProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Optional error code */
  code?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Whether to show as fullscreen */
  fullscreen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Empty state title */
  title: string;
  /** Empty state description */
  description?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Action button */
  action?: {
    /** Button label */
    label: string;
    /** Button click handler */
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Children to render */
  children: React.ReactNode;
  /** Fallback UI when error occurs */
  fallback?: (error: Error) => React.ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Props for Skeleton component (loading placeholder)
 */
export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional CSS classes */
  className?: string;
}
