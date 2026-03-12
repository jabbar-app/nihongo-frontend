import { ReactNode } from "react";
import { ChevronRightIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  titleJa?: string;
  description?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  titleJa,
  description,
  icon,
  iconBgColor = "bg-teal-50 dark:bg-teal-900/20",
  iconTextColor = "text-teal-600 dark:text-teal-400",
  breadcrumbs,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto hide-scrollbar">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isDashboard = crumb.label.toLowerCase() === 'dashboard';
            
            return (
              <div key={crumb.label} className="flex items-center shrink-0">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-1.5">
                    {isDashboard && <LayoutDashboard className="w-3.5 h-3.5" />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`flex items-center gap-1.5 ${isLast ? (titleJa ? "text-teal-600 dark:text-teal-500 font-medium tracking-wider text-xs sm:text-sm" : "text-gray-900 dark:text-gray-200") : ""}`}>
                    {isDashboard && <LayoutDashboard className="w-3.5 h-3.5" />}
                    {isLast && titleJa ? titleJa : crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRightIcon className="w-4 h-4 mx-1 sm:mx-2 shrink-0 opacity-50" />}
              </div>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="flex-1 flex gap-4 items-start w-full">
          <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {/* Passed Icon moved to right side */}
          {icon && !action && (
            <div className={`hidden sm:flex p-3 rounded-2xl shrink-0 ${iconBgColor} ${iconTextColor} ml-4`}>
              {icon}
            </div>
          )}
        </div>

        {/* Optional Action Area (e.g. Create Button) */}
        {action && (
          <div className="w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
