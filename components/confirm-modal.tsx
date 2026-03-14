'use client';

import { AlertCircleIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmModal Component
 * 
 * A specialized modal for confirmation dialogs with variant styling.
 * Uses the base Modal component for consistent structure.
 * 
 * @example
 * ```tsx
 * <ConfirmModal
 *   isOpen={isOpen}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning',
}: ConfirmModalProps) {
    const variantStyles = {
        danger: {
            icon: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-800/50',
            button: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-100 dark:border-yellow-800/50',
            button: 'bg-yellow-600 hover:bg-yellow-700',
        },
        info: {
            icon: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-800/50',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const styles = variantStyles[variant];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            size="md"
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onCancel} className="cursor-pointer">
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={`${styles.button} text-white min-w-[100px] cursor-pointer`}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div className={`flex gap-4 p-4 rounded-xl ${styles.bg} border ${styles.border}`}>
                <AlertCircleIcon className={`w-6 h-6 flex-shrink-0 ${styles.icon}`} />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
            </div>
        </Modal>
    );
}
