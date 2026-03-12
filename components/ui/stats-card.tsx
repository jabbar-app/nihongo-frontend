import { ReactNode } from "react";
import Card from "./card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconColor = "text-teal-600 dark:text-teal-400",
  onClick,
  className = "",
}: StatsCardProps) {
  return (
    <Card 
      className={`p-4 dark:border dark:border-gray-600 ${onClick ? 'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {icon ? (
        <div className="flex items-center gap-2 mb-2">
          <span className={`[&>svg]:w-5 [&>svg]:h-5 ${iconColor}`}>{icon}</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      )}
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    </Card>
  );
}
