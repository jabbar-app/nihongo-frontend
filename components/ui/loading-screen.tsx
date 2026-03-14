import { Loader2 } from "lucide-react";
import StateScreen from "./state-screen";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingScreen Component
 * 
 * Convenience wrapper around StateScreen for loading states.
 * 
 * @example
 * ```tsx
 * <LoadingScreen message="Loading..." fullScreen />
 * ```
 */
export default function LoadingScreen({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingScreenProps) {
  return (
    <StateScreen
      type="loading"
      message={message}
      fullScreen={fullScreen}
    />
  );
}
