"use client";

import { links } from "@/data/links";
import { ILink } from "@/types";
import { MenuIcon, XIcon, HomeIcon, BookOpenIcon, LibraryIcon, UserIcon, LogOutIcon, SettingsIcon, CalendarIcon, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme-context";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    setIsLoggedIn(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Invalid user data
      }
    }

    const handleStorageChange = () => {
      const newToken = localStorage.getItem('auth_token');
      setIsLoggedIn(!!newToken);
      if (newToken) {
        const newUserData = localStorage.getItem('user');
        if (newUserData) {
          try {
            setUser(JSON.parse(newUserData));
          } catch (e) {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown-container')) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Debug dark/light mode for menu section
  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;

    console.log('[Navbar] ===== Menu Dark/Light Mode Debug =====');
    console.log('[Navbar] isDarkMode state:', isDarkMode);
    console.log('[Navbar] documentElement has dark class?', document.documentElement.classList.contains('dark'));

    const menuElement = menuRef.current;
    const computedStyle = window.getComputedStyle(menuElement);

    console.log('[Navbar] Menu element classes:', menuElement.className);
    console.log('[Navbar] Menu has bg-white?', menuElement.className.includes('bg-white'));
    console.log('[Navbar] Menu has dark:bg-gray-900?', menuElement.className.includes('dark:bg-gray-900'));
    console.log('[Navbar] Computed menu background color:', computedStyle.backgroundColor);
    console.log('[Navbar] Computed menu color (text):', computedStyle.color);

    // Check header section
    const headerElement = menuElement.querySelector('.flex.items-center.justify-between.p-4');
    if (headerElement) {
      const headerStyle = window.getComputedStyle(headerElement as Element);
      console.log('[Navbar] Header element classes:', (headerElement as Element).className);
      console.log('[Navbar] Header computed background:', headerStyle.backgroundColor);
      console.log('[Navbar] Header computed border color:', headerStyle.borderBottomColor);
    }

    // Check user name text
    const userNameElement = menuElement.querySelector('.font-semibold.text-sm');
    if (userNameElement) {
      const userNameStyle = window.getComputedStyle(userNameElement as Element);
      console.log('[Navbar] User name element classes:', (userNameElement as Element).className);
      console.log('[Navbar] User name has text-gray-900?', (userNameElement as Element).className.includes('text-gray-900'));
      console.log('[Navbar] User name has dark:text-white?', (userNameElement as Element).className.includes('dark:text-white'));
      console.log('[Navbar] User name computed color:', userNameStyle.color);
    }

    // Check navigation items
    const navButtons = menuElement.querySelectorAll('button, a');
    navButtons.forEach((btn, index) => {
      const btnStyle = window.getComputedStyle(btn);
      console.log(`[Navbar] Nav item ${index} classes:`, btn.className);
      console.log(`[Navbar] Nav item ${index} computed color:`, btnStyle.color);
      console.log(`[Navbar] Nav item ${index} computed background:`, btnStyle.backgroundColor);
    });

    // Check if CSS rules are being applied for menu background
    const stylesheets = Array.from(document.styleSheets);
    let foundRule = false;
    stylesheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            if (rule.selectorText && rule.selectorText.includes('dark:bg-gray-900') && rule.selectorText.includes('html.dark')) {
              console.log(`[Navbar] Found CSS rule: ${rule.selectorText} -> ${rule.style.backgroundColor}`);
              foundRule = true;
            }
            if (rule.selectorText && rule.selectorText.includes('bg-white') && rule.selectorText.includes('html.dark')) {
              console.log(`[Navbar] Found bg-white override rule: ${rule.selectorText} -> ${rule.style.backgroundColor}`);
              foundRule = true;
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    });
    if (!foundRule) {
      console.log('[Navbar] WARNING: Could not find CSS rule for dark:bg-gray-900 or bg-white override!');
    }

    // Check expected vs actual color
    const expectedColorDark = 'rgb(17, 24, 39)'; // gray-900
    const expectedColorLight = 'rgb(255, 255, 255)'; // white
    const actualColor = computedStyle.backgroundColor;
    const expectedColor = isDarkMode ? expectedColorDark : expectedColorLight;
    console.log('[Navbar] Expected color:', expectedColor, isDarkMode ? '(dark mode)' : '(light mode)');
    console.log('[Navbar] Actual computed color:', actualColor);
    console.log('[Navbar] Colors match?', actualColor === expectedColor || (isDarkMode && actualColor.includes('17')) || (!isDarkMode && actualColor.includes('255')));

    console.log('[Navbar] ===== End Menu Debug =====');
  }, [isMenuOpen, isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const getStartStudyingLink = () => {
    return isLoggedIn ? '/review' : '/login';
  };

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const navItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpenIcon, label: 'Review', path: '/review' },
    { icon: LibraryIcon, label: 'Decks', path: '/decks' },
    { icon: CalendarIcon, label: 'History', path: '/history' },
  ];

  return (
    <>
      <nav className='fixed w-full top-0 z-50 px-4 py-2 border-b transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30'>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/review"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/review')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Review
                </Link>
                <Link
                  href="/practice"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/practice')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Practice
                </Link>
              </>
            )}
            <Link
              href="/about"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              About
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Desktop Profile Dropdown - Only when logged in */}
            {isLoggedIn && (
              <div className="hidden md:block relative profile-dropdown-container">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <button
                        onClick={() => {
                          handleNavigation('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
                      >
                        <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">Profile</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 rounded-b-lg"
                      >
                        <LogOutIcon className="w-5 h-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu - Slide in from right, full screen on mobile, fit content on desktop */}
      <div 
        ref={menuRef}
        className={`fixed top-0 right-0 z-50 h-screen bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out ${
          isMenuOpen 
            ? "translate-x-0" 
            : "translate-x-full"
        } w-full md:w-80`}
      >
        <div className="flex flex-col h-full">
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
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col p-4 overflow-y-auto flex-1">
          {!isLoggedIn && links.map((link: ILink) => (
            <button
              key={link.name}
              onClick={() => handleNavigation(link.href)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
            >
              <span className="font-medium">{link.name}</span>
            </button>
          ))}
          {isLoggedIn && navItems.map((item) => {
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
          {isLoggedIn && <div className="border-t border-gray-200 dark:border-gray-700 my-4" />}

          {/* Profile & Settings */}
          {isLoggedIn && (
            <>
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
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOutIcon className="w-5 h-5" />
                <span className="font-medium">Log out</span>
              </button>
            </>
          )}

          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Login</span>
            </Link>
          )}

          {!isLoggedIn && (
            <Button
              onClick={() => {
                router.push(getStartStudyingLink());
                setIsMenuOpen(false);
              }}
              fullWidth
              className="mt-4"
            >
              Start studying
            </Button>
          )}
          </nav>
        </div>
      </div>
    </>
  );
}
