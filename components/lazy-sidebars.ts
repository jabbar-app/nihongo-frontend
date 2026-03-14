/**
 * Lazy Sidebar Components
 * 
 * Lazy-loaded sidebar components for improved code splitting.
 * Sidebars are often hidden and can be deferred until needed.
 */

import dynamic from 'next/dynamic';
import { LazySidebarLoading } from './ui/lazy-loading';

/**
 * Lazy-loaded note sidebar component
 * 
 * Used for displaying notes in a sidebar
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Show Notes</button>
 *     {isOpen && <LazyNoteSidebar onClose={() => setIsOpen(false)} />}
 *   </>
 * );
 * ```
 */
export const LazyNoteSidebar = dynamic(
  () => import('./note-sidebar'),
  { loading: () => <LazySidebarLoading /> }
);

/**
 * Lazy-loaded mobile sidebar component
 * 
 * Used for mobile navigation sidebar
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Menu</button>
 *     {isOpen && <LazyMobileSidebar onClose={() => setIsOpen(false)} />}
 *   </>
 * );
 * ```
 */
export const LazyMobileSidebar = dynamic(
  () => import('./mobile-sidebar'),
  { loading: () => <LazySidebarLoading /> }
);
