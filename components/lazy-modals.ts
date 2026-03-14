/**
 * Lazy Modal Components
 * 
 * Lazy-loaded modal components for improved code splitting.
 * Modals are typically shown conditionally, making them ideal candidates for lazy loading.
 */

import dynamic from 'next/dynamic';
import { LazyModalLoading } from './ui/lazy-loading';

/**
 * Lazy-loaded card edit modal
 * 
 * Used for editing card content
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Edit Card</button>
 *     {isOpen && (
 *       <LazyCardEditModal
 *         cardId="123"
 *         onClose={() => setIsOpen(false)}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const LazyCardEditModal = dynamic(
  () => import('./card-edit-modal'),
  { loading: () => <LazyModalLoading /> }
);

/**
 * Lazy-loaded confirm modal
 * 
 * Used for confirmation dialogs
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>Delete</button>
 *     {isOpen && (
 *       <LazyConfirmModal
 *         title="Delete Item?"
 *         message="This action cannot be undone."
 *         onConfirm={() => handleDelete()}
 *         onCancel={() => setIsOpen(false)}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const LazyConfirmModal = dynamic(
  () => import('./confirm-modal'),
  { loading: () => <LazyModalLoading /> }
);

/**
 * Lazy-loaded deck form modal
 * 
 * Used for creating/editing decks
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <>
 *     <button onClick={() => setIsOpen(true)}>New Deck</button>
 *     {isOpen && (
 *       <LazyDeckFormModal
 *         onClose={() => setIsOpen(false)}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const LazyDeckFormModal = dynamic(
  () => import('./deck-form-modal'),
  { loading: () => <LazyModalLoading /> }
);
