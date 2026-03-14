import { InputHTMLAttributes, forwardRef } from 'react';
import FormField from './form-field';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    startIcon?: React.ElementType;
}

/**
 * Input Component
 * 
 * Convenience wrapper around FormField for text inputs.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="user@example.com"
 *   error={errors.email}
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', type = 'text', startIcon, ...props }, ref) => {
        return (
            <FormField
                ref={ref}
                type={type as any}
                label={label}
                error={error}
                startIcon={startIcon}
                className={className}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
