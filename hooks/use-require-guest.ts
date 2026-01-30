'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects to /dashboard if the user is already logged in (has auth_token).
 * Use on login, register, forgot-password, reset-password pages.
 */
export function useRequireGuest() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);
}
