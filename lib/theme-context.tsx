'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'darkMode';

// Helper function to get initial theme from localStorage (safe for SSR)
function getInitialTheme(): boolean {
  if (typeof window === 'undefined') {
    return false; // Default to light mode on server
  }

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    return false; // Default to light mode if no saved preference
  } catch (error) {
    return false; // Default to light mode on error
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return getInitialTheme();
  });
  const [mounted, setMounted] = useState(false);

  // Sync theme with document on mount
  useEffect(() => {
    // Check if document already has dark class (from script)
    const hasDarkClass = document.documentElement.classList.contains('dark');

    // Sync state with document if they don't match
    if (hasDarkClass !== isDarkMode) {
      setIsDarkMode(hasDarkClass);
    }

    setMounted(true);
  }, []); // Only run on mount

  // Sync document class when isDarkMode changes
  useEffect(() => {
    if (!mounted) return; // Don't run until mounted

    // Ensure document class matches state
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, mounted]);

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
    localStorage.setItem(THEME_STORAGE_KEY, isDark.toString());

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setTheme(newMode);
  };

  // Always provide the context, even before mounted
  // This ensures components can use useTheme() immediately
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
