/**
 * Lazy Loading Utilities
 * 
 * Provides utilities for implementing component-based code splitting
 * with consistent patterns and error handling.
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Options for lazy loading components
 */
export interface LazyLoadOptions {
  /** Loading component to display while loading */
  loading?: React.ComponentType<any>;
  /** Whether to render on server side */
  ssr?: boolean;
  /** Delay before showing loading component (ms) */
  delay?: number;
}

/**
 * Lazy load a component with consistent patterns
 * 
 * @param importFunc - Function that imports the component
 * @param options - Lazy loading options
 * @returns Lazy loaded component
 * 
 * @example
 * ```typescript
 * const LazyModal = lazyLoad(
 *   () => import('./Modal'),
 *   { loading: () => <LoadingSpinner /> }
 * );
 * ```
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: LazyLoadOptions = {}
) {
  return dynamic(importFunc, {
    loading: options.loading,
    ssr: options.ssr ?? true,
  });
}

/**
 * Lazy load a component with no SSR
 * 
 * @param importFunc - Function that imports the component
 * @param options - Lazy loading options
 * @returns Lazy loaded component (client-side only)
 * 
 * @example
 * ```typescript
 * const LazyChart = lazyLoadClient(
 *   () => import('./Chart'),
 *   { loading: () => <LoadingSpinner /> }
 * );
 * ```
 */
export function lazyLoadClient<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: LazyLoadOptions = {}
) {
  return dynamic(importFunc, {
    loading: options.loading,
    ssr: false,
  });
}

/**
 * Lazy load a component with SSR enabled
 * 
 * @param importFunc - Function that imports the component
 * @param options - Lazy loading options
 * @returns Lazy loaded component (server-side rendered)
 * 
 * @example
 * ```typescript
 * const LazyContent = lazyLoadServer(
 *   () => import('./Content'),
 *   { loading: () => <LoadingSpinner /> }
 * );
 * ```
 */
export function lazyLoadServer<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: LazyLoadOptions = {}
) {
  return dynamic(importFunc, {
    loading: options.loading,
    ssr: true,
  });
}

/**
 * Lazy load multiple components
 * 
 * @param components - Object with component imports
 * @param options - Lazy loading options
 * @returns Object with lazy loaded components
 * 
 * @example
 * ```typescript
 * const { Modal, Form, List } = lazyLoadMultiple({
 *   Modal: () => import('./Modal'),
 *   Form: () => import('./Form'),
 *   List: () => import('./List'),
 * }, { loading: () => <LoadingSpinner /> });
 * ```
 */
export function lazyLoadMultiple<T extends Record<string, () => Promise<any>>>(
  components: T,
  options: LazyLoadOptions = {}
): Record<keyof T, React.ComponentType<any>> {
  const result: Record<string, React.ComponentType<any>> = {};

  for (const [key, importFunc] of Object.entries(components)) {
    result[key] = dynamic(importFunc, {
      loading: options.loading,
      ssr: options.ssr ?? true,
    });
  }

  return result as Record<keyof T, React.ComponentType<any>>;
}
