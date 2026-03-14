import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import FormField from './form-field';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    autoResize?: boolean;
}

/**
 * Textarea Component
 * 
 * Convenience wrapper around FormField for textarea inputs.
 * Supports auto-resizing based on content.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Message"
 *   placeholder="Enter your message"
 *   error={errors.message}
 *   autoResize
 * />
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', autoResize = true, onChange, rows = 3, ...props }, ref) => {
        const innerRef = useRef<HTMLTextAreaElement>(null);

        // Combine refs
        const setRef = (element: HTMLTextAreaElement | null) => {
            innerRef.current = element;
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                (ref as any).current = element;
            }
        };

        useEffect(() => {
            if (autoResize && innerRef.current) {
                innerRef.current.style.height = 'auto';
                innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
            }
        }, [props.value, autoResize]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (autoResize) {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
            }
            onChange?.(e);
        };

        return (
            <FormField
                ref={setRef}
                type="textarea"
                label={label}
                error={error}
                rows={rows}
                className={`resize-none min-h-[52px] max-h-[200px] overflow-y-auto ${className}`}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
