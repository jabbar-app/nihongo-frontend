'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HomeIcon, MessageSquareIcon, UserIcon, FileTextIcon, RotateCcwIcon } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initial check
    setIsLoggedIn(!!localStorage.getItem('auth_token'));

    // Listen for storage events (login/logout sync)
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (pathname === '/' || pathname === '/login' || pathname === '/register' || !isLoggedIn) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard')
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <HomeIcon className={`w-6 h-6 ${isActive('/dashboard') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/dashboard') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Home</span>
        </Link>
        <Link
          href="/materials"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/materials')
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <FileTextIcon className={`w-6 h-6 ${isActive('/materials') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/materials') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Learn</span>
        </Link>
        <Link
          href="/review"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/review')
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <RotateCcwIcon className={`w-6 h-6 ${isActive('/review') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/review') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Review</span>
        </Link>
        <Link
          href="/practice"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/practice')
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <MessageSquareIcon className={`w-6 h-6 ${isActive('/practice') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/practice') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Practice</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/profile')
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        >
          <UserIcon className={`w-6 h-6 ${isActive('/profile') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/profile') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
