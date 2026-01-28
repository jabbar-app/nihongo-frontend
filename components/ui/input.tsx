import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                        error 
                            ? 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-white' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-teal-500 dark:focus:border-teal-400'
                    } outline-none focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-colors ${className}`}
                    {...props}
                />
                {error && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
