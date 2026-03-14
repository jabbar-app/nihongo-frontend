/**
 * Form Component Types
 * 
 * Consolidated type definitions for form input components.
 */

import React from 'react';

/**
 * Base props for form input components
 */
export interface BaseInputProps {
  /** Input name attribute */
  name?: string;
  /** Input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Input component
 */
export interface InputProps extends BaseInputProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Key down handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Icon to display (left side) */
  icon?: React.ReactNode;
  /** Icon to display (right side) */
  rightIcon?: React.ReactNode;
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Auto-complete attribute */
  autoComplete?: string;
  /** Maximum length */
  maxLength?: number;
}

/**
 * Props for Textarea component
 */
export interface TextareaProps extends BaseInputProps {
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Key down handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Number of rows */
  rows?: number;
  /** Whether to auto-resize */
  autoResize?: boolean;
  /** Maximum length */
  maxLength?: number;
  /** Minimum height */
  minHeight?: string;
  /** Maximum height */
  maxHeight?: string;
}

/**
 * Props for Button component
 */
export interface ButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Icon to display (left side) */
  icon?: React.ReactNode;
  /** Icon to display (right side) */
  rightIcon?: React.ReactNode;
  /** Whether the button should take full width */
  fullWidth?: boolean;
}

/**
 * Props for Select component
 */
export interface SelectProps extends BaseInputProps {
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Select options */
  options: SelectOption[];
  /** Default option text */
  defaultOption?: string;
}

/**
 * Represents a select option
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * Props for Checkbox component
 */
export interface CheckboxProps {
  /** Checkbox name */
  name?: string;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label text */
  label?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Radio component
 */
export interface RadioProps {
  /** Radio name */
  name: string;
  /** Radio value */
  value: string;
  /** Whether the radio is checked */
  checked?: boolean;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label text */
  label?: string;
  /** Whether the radio is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
