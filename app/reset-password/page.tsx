'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, FormEvent, Suspense } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import AuthLayout from '@/components/auth/auth-layout';
import { api } from '@/lib/api';
import { useRequireGuest } from '@/hooks/use-require-guest';
import { LockIcon } from 'lucide-react';

function ResetPasswordForm() {
  useRequireGuest();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!token || !email) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);

    try {
      await api.post('/api/v1/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password reset"
        subtitle="Your password has been reset. You can now sign in with your new password."
        badge="Success"
      >
        <Link
          href="/login"
          className="block w-full text-center py-3 px-4 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  if (!token || !email) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This password reset link is invalid or has expired. Please request a new one."
        badge="Reset password"
      >
        <Link
          href="/forgot-password"
          className="block w-full text-center py-3 px-4 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          Request new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your new password below."
      badge="Reset password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={loading}
          placeholder="••••••••"
          startIcon={LockIcon}
        />
        <Input
          label="Confirm password"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          minLength={8}
          disabled={loading}
          placeholder="••••••••"
          startIcon={LockIcon}
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/login"
            className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." subtitle="Please wait." badge="">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
