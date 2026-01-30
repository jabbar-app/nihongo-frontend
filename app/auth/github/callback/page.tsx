'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Store token
            localStorage.setItem('auth_token', token);

            // Generate user data from token or fetch it
            api.get('/api/v1/me')
                .then(user => {
                    localStorage.setItem('user', JSON.stringify(user));
                    // Trigger storage event for navbar update
                    window.dispatchEvent(new Event('storage'));
                    router.push('/dashboard');
                })
                .catch(err => {
                    console.error('Failed to fetch user:', err);
                    router.push('/login?error=auth_failed');
                });
        } else {
            router.push('/login?error=no_token');
        }
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400">Authenticating with GitHub...</p>
            </div>
        </div>
    );
}

export default function GithubCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
