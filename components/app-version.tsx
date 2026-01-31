'use client';

const APP_VERSION = '1.0.0';

export default function AppVersion() {
  return (
    <div className="text-center py-2 text-[10px] text-gray-400 dark:text-gray-600">
      v{APP_VERSION}
    </div>
  );
}
