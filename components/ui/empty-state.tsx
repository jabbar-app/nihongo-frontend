import { ReactNode } from "react";
import { Search } from "lucide-react";
import StateScreen from "./state-screen";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Convenience wrapper around StateScreen for empty states.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   title="No items"
 *   description="Create your first item"
 *   action={<Button>Create</Button>}
 * />
 * ```
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <StateScreen
      type="empty"
      title={title}
      message={description}
      icon={icon || <Search className="w-10 h-10 opacity-40" />}
      action={action}
      className={`bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700/50 ${className}`}
    />
  );
}
