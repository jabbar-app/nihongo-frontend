import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withBottomPadding?: boolean;
}

export default function PageContainer({ 
  children, 
  className = "", 
  withBottomPadding = true 
}: PageContainerProps) {
  return (
    <div className={`max-w-4xl mx-auto px-4 pt-6 sm:pt-10 w-full ${withBottomPadding ? "pb-24" : ""} ${className}`}>
      {children}
    </div>
  );
}
