import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./button";
import StateScreen from "./state-screen";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * ErrorScreen Component
 * 
 * Convenience wrapper around StateScreen for error states.
 * 
 * @example
 * ```tsx
 * <ErrorScreen
 *   title="Error"
 *   message="Failed to load"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export default function ErrorScreen({
  title = "Something went wrong",
  message = "We couldn't load the information or an unexpected error occurred.",
  onRetry
}: ErrorScreenProps) {
  return (
    <StateScreen
      type="error"
      title={title}
      message={message}
      icon={<AlertCircle className="w-10 h-10" />}
      action={
        onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )
      }
    />
  );
}
