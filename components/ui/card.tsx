import { ReactNode, HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = '', padding = 'md', ...props }, ref) => {
    const paddings = {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
    };
    
    return (
        <div ref={ref} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm ${paddings[padding]} ${className}`} {...props}>
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export default Card;
