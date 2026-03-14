/**
 * Lazy Practice Components
 * 
 * Lazy-loaded practice feature components for improved code splitting.
 * Practice components are feature-specific and can be deferred until the practice page loads.
 */

import dynamic from 'next/dynamic';
import { LazyComponentLoading } from './ui/lazy-loading';

/**
 * Lazy-loaded practice conversation component
 * 
 * Used for conversation-based practice
 * 
 * @example
 * ```tsx
 * return (
 *   <div>
 *     <h1>Practice</h1>
 *     <LazyPracticeConversation sessionId="123" />
 *   </div>
 * );
 * ```
 */
export const LazyPracticeConversation = dynamic(
  () => import('./practice/practice-conversation'),
  { loading: () => <LazyComponentLoading /> }
);

/**
 * Lazy-loaded can-do scenario view component
 * 
 * Used for viewing can-do scenarios
 * 
 * @example
 * ```tsx
 * return (
 *   <div>
 *     <h1>Can-Do Scenarios</h1>
 *     <LazyCanDoScenarioView scenarioId="123" />
 *   </div>
 * );
 * ```
 */
export const LazyCanDoScenarioView = dynamic(
  () => import('./practice/can-do-scenario-view'),
  { loading: () => <LazyComponentLoading /> }
);

/**
 * Lazy-loaded can-do list component
 * 
 * Used for displaying can-do items
 * 
 * @example
 * ```tsx
 * return (
 *   <div>
 *     <h1>Can-Do Items</h1>
 *     <LazyCanDoList />
 *   </div>
 * );
 * ```
 */
export const LazyCanDoList = dynamic(
  () => import('./practice/can-do-list'),
  { loading: () => <LazyComponentLoading /> }
);

/**
 * Lazy-loaded can-do item component
 * 
 * Used for displaying individual can-do items
 * 
 * @example
 * ```tsx
 * return (
 *   <div>
 *     <LazyCanDoItem itemId="123" />
 *   </div>
 * );
 * ```
 */
export const LazyCanDoItem = dynamic(
  () => import('./practice/can-do-item'),
  { loading: () => <LazyComponentLoading /> }
);
