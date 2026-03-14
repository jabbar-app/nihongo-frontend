/**
 * Lazy Error Boundary
 * 
 * Error boundary specifically designed for lazy-loaded components.
 * Catches errors during lazy component loading and rendering.
 */

import React from 'react';
import { ErrorBoundary } from './error-boundary';

interface LazyErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary for lazy-loaded components
 * 
 * Wraps lazy components to catch loading and rendering errors
 * 
 * @example
 * ```tsx
 * <LazyErrorBoundary>
 *   <LazyModal />
 * </LazyErrorBoundary>
 * ```
 */
export function LazyErrorBoundary({
  children,
  fallback,
  onError,
}: LazyErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error) =>
        fallback ? (
          fallback(error)
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-900">Failed to load component</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        )
      }
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Lazy error boundary for modals
 * 
 * Specialized error boundary for modal components
 */
export function LazyModalErrorBoundary({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <LazyErrorBoundary
      fallback={(error) => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
            <h3 className="font-semibold text-red-900">Failed to load modal</h3>
            <p className="text-sm text-red-700 mt-2">{error.message}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </LazyErrorBoundary>
  );
}

/**
 * Lazy error boundary for sidebars
 * 
 * Specialized error boundary for sidebar components
 */
export function LazySidebarErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyErrorBoundary
      fallback={(error) => (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Failed to load sidebar: {error.message}
          </p>
        </div>
      )}
    >
      {children}
    </LazyErrorBoundary>
  );
}

/**
 * Lazy error boundary for pages
 * 
 * Specialized error boundary for page components
 */
export function LazyPageErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyErrorBoundary
      fallback={(error) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Failed to load page
            </h1>
            <p className="text-red-700 mb-4">{error.message}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </LazyErrorBoundary>
  );
}
