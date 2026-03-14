'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HomeIcon, MessageSquareIcon, FileTextIcon, RotateCcwIcon, CheckCircle2Icon } from 'lucide-react';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) return pathname === ROUTES.HOME;
    return pathname?.startsWith(path);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initial check
    setIsLoggedIn(!!localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY));

    // Listen for storage events (login/logout sync)
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (pathname === ROUTES.HOME || pathname === ROUTES.AUTH.LOGIN || pathname === ROUTES.AUTH.REGISTER || !isLoggedIn) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        <Link
          href={ROUTES.DASHBOARD}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(ROUTES.DASHBOARD)
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <HomeIcon className={`w-6 h-6 ${isActive(ROUTES.DASHBOARD) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive(ROUTES.DASHBOARD) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Home</span>
        </Link>
        <Link
          href={ROUTES.MATERIALS}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(ROUTES.MATERIALS)
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <FileTextIcon className={`w-6 h-6 ${isActive(ROUTES.MATERIALS) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive(ROUTES.MATERIALS) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Learn</span>
        </Link>
        <Link
          href={ROUTES.REVIEW}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(ROUTES.REVIEW)
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <RotateCcwIcon className={`w-6 h-6 ${isActive(ROUTES.REVIEW) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive(ROUTES.REVIEW) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Review</span>
        </Link>
        <Link
          href={ROUTES.PRACTICE}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(ROUTES.PRACTICE)
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <MessageSquareIcon className={`w-6 h-6 ${isActive(ROUTES.PRACTICE) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive(ROUTES.PRACTICE) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Practice</span>
        </Link>
        <Link
          href={ROUTES.TEST}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(ROUTES.TEST)
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <CheckCircle2Icon className={`w-6 h-6 ${isActive(ROUTES.TEST) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive(ROUTES.TEST) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>テスト</span>
        </Link>

      </div>
    </nav>
  );
}
