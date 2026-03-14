'use client';

import { ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

/**
 * Base Modal Component
 * 
 * A reusable modal wrapper with header, content, and footer sections.
 * Provides consistent styling and behavior across the application.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={onClose} title="Confirm Action">
 *   <p>Are you sure?</p>
 *   <div className="flex gap-2">
 *     <Button onClick={onClose}>Cancel</Button>
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *   </div>
 * </Modal>
 * ```
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full overflow-hidden flex flex-col ${sizeClasses[size]}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {closeButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.displayName = 'Modal';

export default React.memo(Modal);
