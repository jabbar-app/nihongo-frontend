import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', autoResize = true, onChange, ...props }, ref) => {
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
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        ref={setRef}
                        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none resize-none min-h-[52px] max-h-[200px] overflow-y-auto
                            ${error
                                ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 placeholder:text-red-300'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-teal-500/50 dark:focus:border-teal-400/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-teal-500/10 dark:focus:ring-teal-400/10'
                            } ${className}`}
                        onChange={handleChange}
                        rows={1}
                        {...props}
                    />
                </div>
                {error && (
                    <div className="mt-1.5 ml-1 text-sm text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                        {error}
                    </div>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
