/**
 * Error Boundary Component
 * 
 * React error boundary that catches errors in the component tree,
 * logs them, and displays a fallback UI with recovery options.
 * 
 * @module components/error-boundary
 */

'use client';

import React from 'react';
import { ApplicationError, isApplicationError } from '@/types/errors/app-error';
import { ErrorCategory } from '@/types/errors/error-categories';
import { errorLogger } from '@/lib/error-logger';

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  
  /** Custom fallback UI renderer */
  fallback?: (error: ApplicationError, retry: () => void) => React.ReactNode;
  
  /** Optional name for debugging */
  name?: string;
  
  /** Callback when error is caught */
  onError?: (error: ApplicationError) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  error: ApplicationError | null;
  hasError: boolean;
  errorCount: number;
}

/**
 * Error Boundary Component
 * 
 * Catches errors in child components and displays a fallback UI.
 * Logs errors with context and provides recovery options.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary name="Dashboard">
 *   <DashboardContent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
      errorCount: 0,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = isApplicationError(error)
      ? error
      : new ApplicationError({
          category: ErrorCategory.UNKNOWN,
          message: error.message || 'An unexpected error occurred',
          code: 'COMPONENT_ERROR',
          details: { originalError: error.toString() },
        });

    return {
      error: appError,
      hasError: true,
      errorCount: 0,
    };
  }

  /**
   * Log error when caught
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const appError = isApplicationError(error)
      ? error
      : new ApplicationError({
          category: ErrorCategory.UNKNOWN,
          message: error.message || 'An unexpected error occurred',
          code: 'COMPONENT_ERROR',
        });

    // Log error with context
    errorLogger.error(appError, {
      componentStack: errorInfo.componentStack,
      boundaryName: this.props.name,
      timestamp: new Date().toISOString(),
    });

    // Call optional error callback
    this.props.onError?.(appError);
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      error: null,
      hasError: false,
      errorCount: 0,
    });
  };

  /**
   * Render fallback UI or children
   */
  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} onRetry={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
interface DefaultErrorFallbackProps {
  error: ApplicationError;
  onRetry: () => void;
}

/**
 * Default fallback UI displayed when an error is caught
 */
function DefaultErrorFallback({
  error,
  onRetry,
}: DefaultErrorFallbackProps): React.ReactNode {
  const getErrorMessage = (): string => {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'Connection lost. Please check your internet connection.';
      case ErrorCategory.AUTHENTICATION:
        return 'Your session has expired. Please log in again.';
      case ErrorCategory.AUTHORIZATION:
        return "You don't have permission to access this resource.";
      case ErrorCategory.NOT_FOUND:
        return 'The resource you are looking for was not found.';
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.CONFLICT:
        return 'The data has changed. Please refresh and try again.';
      case ErrorCategory.SERVER:
        return 'A server error occurred. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const getRecoveryAction = (): string => {
    switch (error.recoveryAction) {
      case 'retry':
        return 'Try Again';
      case 'refresh':
        return 'Refresh Page';
      case 'login':
        return 'Go to Login';
      case 'navigate':
        return 'Go Home';
      default:
        return 'Try Again';
    }
  };

  const handleRecovery = (): void => {
    switch (error.recoveryAction) {
      case 'refresh':
        window.location.reload();
        break;
      case 'login':
        window.location.href = '/login';
        break;
      case 'navigate':
        window.location.href = '/';
        break;
      case 'retry':
      default:
        onRetry();
        break;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 text-center mb-6">{getErrorMessage()}</p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
            <p className="font-semibold mb-2">Error Details (Development Only):</p>
            <p className="mb-1">
              <strong>Code:</strong> {error.code}
            </p>
            <p className="mb-1">
              <strong>Category:</strong> {error.category}
            </p>
            {error.message && (
              <p className="mb-1">
                <strong>Message:</strong> {error.message}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleRecovery}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {getRecoveryAction()}
        </button>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
