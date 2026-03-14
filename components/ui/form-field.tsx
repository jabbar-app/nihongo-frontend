'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';

type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'textarea';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  startIcon?: React.ElementType;
  type?: FormFieldType;
  rows?: number;
}

/**
 * FormField Component
 * 
 * A consolidated form input component supporting multiple input types.
 * Handles text, email, password, number inputs and textarea.
 * 
 * @example
 * ```tsx
 * <FormField
 *   type="email"
 *   label="Email"
 *   placeholder="user@example.com"
 *   error={errors.email}
 * />
 * <FormField
 *   type="textarea"
 *   label="Message"
 *   rows={4}
 *   placeholder="Enter your message"
 * />
 * ```
 */
const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ label, error, className = '', type = 'text', startIcon: StartIcon, rows = 3, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const isTextarea = type === 'textarea';

    const togglePassword = () => setShowPassword(!showPassword);

    const baseInputClasses = `w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none
      ${error
        ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 placeholder:text-red-300'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-teal-500/50 dark:focus:border-teal-400/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10'
      } ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            {label}
          </label>
        )}

        {isTextarea ? (
          <textarea
            ref={ref as any}
            rows={rows}
            className={baseInputClasses}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <div className="relative">
            {StartIcon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <StartIcon className="w-5 h-5" />
              </div>
            )}

            <input
              ref={ref as any}
              type={isPassword ? (showPassword ? 'text' : 'password') : type}
              className={`${baseInputClasses} ${StartIcon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'}`}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />

            {isPassword && (
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer text-xs font-medium"
              >
                {showPassword ? 'ショー' : 'ハイド'}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-1.5 ml-1 text-sm text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
            {error}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
