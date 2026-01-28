interface ProgressBarProps {
    progress: number; // 0-100
    className?: string;
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
    return (
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
            <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    );
}
