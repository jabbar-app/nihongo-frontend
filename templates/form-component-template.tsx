/**
 * FormComponentName - Brief description of what this form does
 * 
 * This form component handles [form purpose].
 * It manages form state, validation, and submission.
 * 
 * Features:
 * - Form state management
 * - Input validation
 * - Error display
 * - Loading state
 * - Success feedback
 * 
 * @example
 * ```tsx
 * <FormComponentName onSubmit={(data) => console.log(data)} />
 * ```
 * 
 * @component
 */

import React, { useState, useCallback } from 'react';
import { useForm } from '@/hooks/use-form';

/**
 * Form data type
 */
interface FormData {
  field1: string;
  field2: string;
  field3?: string;
}

/**
 * Props for FormComponentName
 */
interface FormComponentNameProps {
  /** Callback when form is submitted */
  onSubmit: (data: FormData) => Promise<void>;
  
  /** Initial form values */
  initialValues?: Partial<FormData>;
  
  /** CSS class name */
  className?: string;
}

/**
 * Form component implementation
 * 
 * This component demonstrates form best practices:
 * - Uses custom useForm hook for state management
 * - Implements validation
 * - Shows loading state during submission
 * - Displays error messages
 * - Provides success feedback
 */
export function FormComponentName({
  onSubmit,
  initialValues,
  className,
}: FormComponentNameProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<FormData>(
    {
      field1: initialValues?.field1 || '',
      field2: initialValues?.field2 || '',
      field3: initialValues?.field3 || '',
    },
    {
      field1: (value) => !value ? 'Field 1 is required' : null,
      field2: (value) => !value ? 'Field 2 is required' : null,
    }
  );

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await onSubmit(values);
        setSubmitSuccess(true);
        resetForm();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An error occurred'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, resetForm]
  );

  return (
    <form onSubmit={handleFormSubmit} className={className}>
      {/* Field 1 */}
      <div className="mb-4">
        <label htmlFor="field1" className="block text-sm font-medium mb-1">
          Field 1
        </label>
        <input
          id="field1"
          type="text"
          name="field1"
          value={values.field1}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.field1 && (
          <p className="text-red-600 text-sm mt-1">{errors.field1}</p>
        )}
      </div>

      {/* Field 2 */}
      <div className="mb-4">
        <label htmlFor="field2" className="block text-sm font-medium mb-1">
          Field 2
        </label>
        <input
          id="field2"
          type="text"
          name="field2"
          value={values.field2}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.field2 && (
          <p className="text-red-600 text-sm mt-1">{errors.field2}</p>
        )}
      </div>

      {/* Field 3 (Optional) */}
      <div className="mb-4">
        <label htmlFor="field3" className="block text-sm font-medium mb-1">
          Field 3 (Optional)
        </label>
        <input
          id="field3"
          type="text"
          name="field3"
          value={values.field3}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">Form submitted successfully!</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
