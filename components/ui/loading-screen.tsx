import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-20 w-full";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer pulse */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-teal-500/20 animate-ping" />
        {/* Spinner */}
        <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin" />
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
