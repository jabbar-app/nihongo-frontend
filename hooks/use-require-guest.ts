'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';

/**
 * Redirects to dashboard if the user is already logged in (has auth token).
 * Use on login, register, forgot-password, reset-password pages.
 */
export function useRequireGuest() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    if (token) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);
}
