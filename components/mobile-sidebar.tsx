'use client';

import { usePathname, useRouter } from 'next/navigation';
import { XIcon, HomeIcon, BookOpenIcon, LibraryIcon, UserIcon, LogOutIcon, SettingsIcon, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export default function MobileSidebar({ isOpen, onClose, user }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    onClose();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpenIcon, label: 'Review', path: '/review' },
    { icon: LibraryIcon, label: 'Decks', path: '/decks' },
    { icon: CalendarIcon, label: 'History', path: '/history' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Level {user?.rank || '1'}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Profile & Settings */}
          <button
            onClick={() => handleNavigation('/profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
              isActive('/profile')
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${isActive('/profile') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="font-medium">Profile</span>
          </button>

          <button
            onClick={() => handleNavigation('/settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
              isActive('/settings')
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <SettingsIcon className={`w-5 h-5 ${isActive('/settings') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="font-medium">Settings</span>
          </button>

          {/* Logout */}
          {isLoggedIn && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOutIcon className="w-5 h-5" />
                <span className="font-medium">Log out</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
