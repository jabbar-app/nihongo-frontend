'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import AuthLayout from '@/components/auth/auth-layout';
import { api } from '@/lib/api';
import { useRequireGuest } from '@/hooks/use-require-guest';
import { MailIcon } from 'lucide-react';

export default function ForgotPasswordPage() {
  useRequireGuest();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If an account exists for that email, we've sent a password reset link."
        badge="Email sent"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn&apos;t receive an email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setError('');
              }}
              className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="block text-center text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset your password."
      badge="Reset password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder="you@example.com"
          startIcon={MailIcon}
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
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
