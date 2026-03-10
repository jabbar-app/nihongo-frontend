"use client";

import { links } from "@/data/links";
import { ILink } from "@/types";
import { MenuIcon, XIcon, HomeIcon, BookOpenIcon, LibraryIcon, UserIcon, LogOutIcon, SettingsIcon, CalendarIcon, ChevronDownIcon, FileTextIcon, PanelTopCloseIcon, PanelTopOpenIcon, Maximize2Icon, Minimize2Icon, CheckCircle2Icon, HistoryIcon, TrophyIcon, SparklesIcon, SearchIcon, BookIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

import { useHeader } from "@/components/header-context";

export default function Navbar() {
  const { headerContent, showDefaultNav, setShowDefaultNav, showMaterialHeader, setShowMaterialHeader } = useHeader();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Hide default nav on auth pages
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setShowDefaultNav(false);
    } else {
      setShowDefaultNav(true);
    }
  }, [pathname, setShowDefaultNav]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const isActive = (path: string) => {
    // Exact match for most paths
    if (pathname === path) return true;
    // Keep /materials active when viewing material detail pages
    if (path === '/materials' && pathname?.startsWith('/materials/')) return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const navItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpenIcon, label: 'Review', path: '/review' },
    { icon: LibraryIcon, label: 'Decks', path: '/decks' },
    { icon: FileTextIcon, label: 'Materials', path: '/materials' },
    { icon: CalendarIcon, label: 'History', path: '/history' },
    { icon: CheckCircle2Icon, label: 'テスト', path: '/test' },
  ];

  if (headerContent) {
    return (
      <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        {headerContent}
      </nav>
    );
  }

  // Hide nav entirely if instructed (e.g. login page)
  if (!showDefaultNav) {
    return null;
  }

  return (
    <>
      <nav className={`sticky top-0 ${isMenuOpen || isProfileDropdownOpen ? 'z-50' : 'z-20'} w-full px-4 py-2 border-b transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex flex-1 items-center justify-between mx-4">
            <div className="flex items-center gap-1">
              {!isLoggedIn && (
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/')
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              )}
              {isLoggedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/materials"
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/materials')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                  >
                    Learn
                  </Link>
                  <Link
                    href="/review"
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/review')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                  >
                    Review
                  </Link>
                  <Link
                    href="/practice"
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/practice')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                  >
                    Practice
                  </Link>
                  <Link
                    href="/test"
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/test')
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                  >
                    テスト
                  </Link>
                </>
              )}
              <Link
                href="/about"
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${isActive('/about')
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                About
              </Link>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                }
              }}
              className="relative"
            >
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索... Search"
                className="w-48 focus:w-64 pl-9 pr-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            {/* Material Header Toggle & Fullscreen - Only visible on material detail pages */}
            {pathname?.startsWith('/materials/') && (
              <>
                <button
                  onClick={() => setShowMaterialHeader(!showMaterialHeader)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title={showMaterialHeader ? "Hide header for more content" : "Show header"}
                >
                  {showMaterialHeader ? (
                    <PanelTopCloseIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <PanelTopOpenIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit fullscreen" : "Focus mode (fullscreen)"}
                >
                  {isFullscreen ? (
                    <Minimize2Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Maximize2Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </>
            )}
            <ThemeToggle className="cursor-pointer" />

            {/* Profile Dropdown - Only when logged in */}
            {isLoggedIn ? (
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-30 cursor-pointer"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                              {user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@manabou.app'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleNavigation('/history');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <HistoryIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Practice History</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">れんしゅう きろく</span>
                          </div>
                        </button>
                        {/* Decks menu */}
                        <button
                          onClick={() => {
                            handleNavigation('/decks');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <BookIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Decks</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">デッキ</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/history/mastered');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <TrophyIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cards Mastered</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">マスターしたカード</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <SparklesIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">サブスクリプション</span>
                          </div>
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-bold uppercase tracking-wide">Soon</span>
                        </button>
                      </div>

                      <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />

                      {/* Account */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleNavigation('/profile');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">プロフィール</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/settings');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <SettingsIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">セッティング</span>
                          </div>
                        </button>
                      </div>

                      <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />

                      {/* Logout */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                        >
                          <LogOutIcon className="w-4 h-4" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Log out</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">ログアウト</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/login')}
                className="cursor-pointer"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu - Slide in from right, full screen on mobile, fit content on desktop */}
      <div
        className={`fixed top-0 right-0 z-55 h-screen bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-left cursor-pointer"
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 cursor-pointer ${active
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 cursor-pointer ${isActive('/profile')
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                >
                  <UserIcon className={`w-5 h-5 ${isActive('/profile') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => handleNavigation('/settings')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 cursor-pointer ${isActive('/settings')
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/20 cursor-pointer"
                >
                  <LogOutIcon className="w-5 h-5" />
                  <span className="font-medium">Log out</span>
                </button>
              </>
            )}

            {!isLoggedIn && (
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
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
                className="mt-4 cursor-pointer"
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
