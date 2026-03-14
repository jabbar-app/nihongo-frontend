/**
 * Lazy Loading Fallback Components
 * 
 * Provides reusable loading fallback components for lazy-loaded components.
 */

import React from 'react';

/**
 * Generic lazy component loading spinner
 * 
 * Used as fallback while lazy components are loading
 */
export function LazyComponentLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Lazy modal loading spinner
 * 
 * Used as fallback while lazy modal components are loading
 */
export function LazyModalLoading() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Lazy sidebar loading skeleton
 * 
 * Used as fallback while lazy sidebar components are loading
 */
export function LazySidebarLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
    </div>
  );
}

/**
 * Lazy page loading skeleton
 * 
 * Used as fallback while lazy page components are loading
 */
export function LazyPageLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Lazy list loading skeleton
 * 
 * Used as fallback while lazy list components are loading
 */
export function LazyListLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  );
}

/**
 * Lazy card loading skeleton
 * 
 * Used as fallback while lazy card components are loading
 */
export function LazyCardLoading() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
    </div>
  );
}

/**
 * Lazy form loading skeleton
 * 
 * Used as fallback while lazy form components are loading
 */
export function LazyFormLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
    </div>
  );
}
