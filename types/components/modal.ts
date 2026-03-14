/**
 * Modal Component Types
 * 
 * Consolidated type definitions for modal components.
 */

/**
 * Base props for all modal components
 */
export interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Optional title for the modal */
  title?: string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking outside closes the modal */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
}

/**
 * Props for confirmation modal
 */
export interface ConfirmModalProps extends BaseModalProps {
  /** Confirmation message */
  message: string;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Variant for the confirm button */
  variant?: 'primary' | 'danger' | 'warning';
  /** Whether the action is loading */
  loading?: boolean;
}

/**
 * Props for form modal
 */
export interface FormModalProps extends BaseModalProps {
  /** Callback when form is submitted */
  onSubmit: () => void;
  /** Submit button text */
  submitText?: string;
  /** Whether the form is submitting */
  submitting?: boolean;
  /** Whether the submit button is disabled */
  submitDisabled?: boolean;
  /** Form content */
  children: React.ReactNode;
}

/**
 * Props for alert modal
 */
export interface AlertModalProps extends BaseModalProps {
  /** Alert message */
  message: string;
  /** Alert type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Callback when acknowledged */
  onAcknowledge?: () => void;
  /** Acknowledge button text */
  acknowledgeText?: string;
}
