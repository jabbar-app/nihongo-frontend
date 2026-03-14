/**
 * useForm Hook
 * 
 * Hook for managing form state with validation and error handling.
 * Provides methods for handling form submission and field changes.
 * 
 * @module hooks/use-form
 */

import React from 'react';

/**
 * Form field error
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Form state
 */
export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * Form configuration
 */
export interface FormConfig<T> {
  /** Initial form values */
  initialValues: T;
  
  /** Validation function */
  validate?: (values: T) => Record<string, string> | Promise<Record<string, string>>;
  
  /** Form submission handler */
  onSubmit: (values: T) => void | Promise<void>;
}

/**
 * Return type for useForm hook
 */
export interface UseFormReturn<T> {
  /** Current form state */
  state: FormState<T>;
  
  /** Handle field change */
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /** Handle field blur */
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /** Handle form submission */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  
  /** Set field value */
  setFieldValue: (field: keyof T, value: any) => void;
  
  /** Set field error */
  setFieldError: (field: keyof T, error: string) => void;
  
  /** Reset form to initial values */
  reset: () => void;
}

/**
 * Hook for managing form state
 * 
 * Provides form state management with validation and error handling.
 * 
 * @param config - Form configuration
 * @returns Form state and handlers
 * 
 * @example
 * ```typescript
 * const { state, handleChange, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: Record<string, string> = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     if (!values.password) errors.password = 'Password is required';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await loginUser(values);
 *   },
 * });
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input
 *       name="email"
 *       value={state.values.email}
 *       onChange={handleChange}
 *     />
 *     {state.errors.email && <span>{state.errors.email}</span>}
 *     <button type="submit" disabled={state.isSubmitting}>
 *       Submit
 *     </button>
 *   </form>
 * );
 * ```
 */
export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const { initialValues, validate, onSubmit } = config;

  const [state, setState] = React.useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
  });

  /**
   * Validate form
   */
  const validateForm = React.useCallback(
    async (values: T): Promise<Record<string, string>> => {
      if (!validate) {
        return {};
      }

      try {
        const errors = await validate(values);
        return errors;
      } catch (error) {
        console.error('Form validation error:', error);
        return {};
      }
    },
    [validate]
  );

  /**
   * Handle field change
   */
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      setState((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
        isDirty: true,
      }));
    },
    []
  );

  /**
   * Handle field blur
   */
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;

      setState((prevState) => ({
        ...prevState,
        touched: {
          ...prevState.touched,
          [name]: true,
        },
      }));
    },
    []
  );

  /**
   * Handle form submission
   */
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setState((prevState) => ({
        ...prevState,
        isSubmitting: true,
      }));

      try {
        // Validate form
        const errors = await validateForm(state.values);

        if (Object.keys(errors).length > 0) {
          setState((prevState) => ({
            ...prevState,
            errors,
            isSubmitting: false,
          }));
          return;
        }

        // Submit form
        await onSubmit(state.values);

        setState((prevState) => ({
          ...prevState,
          isSubmitting: false,
        }));
      } catch (error) {
        console.error('Form submission error:', error);
        setState((prevState) => ({
          ...prevState,
          isSubmitting: false,
        }));
      }
    },
    [state.values, validateForm, onSubmit]
  );

  /**
   * Set field value
   */
  const setFieldValue = React.useCallback((field: keyof T, value: any) => {
    setState((prevState) => ({
      ...prevState,
      values: {
        ...prevState.values,
        [field]: value,
      },
      isDirty: true,
    }));
  }, []);

  /**
   * Set field error
   */
  const setFieldError = React.useCallback((field: keyof T, error: string) => {
    setState((prevState) => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [field]: error,
      },
    }));
  }, []);

  /**
   * Reset form
   */
  const reset = React.useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialValues]);

  return {
    state,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

export default useForm;
