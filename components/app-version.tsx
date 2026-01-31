'use client';

const APP_VERSION = '1.0.0';

export default function AppVersion() {
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 text-center py-1 text-[10px] text-gray-400 dark:text-gray-600 pointer-events-none z-10">
      v{APP_VERSION}
    </div>
  );
}
