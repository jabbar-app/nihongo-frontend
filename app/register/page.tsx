'use client';

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthLayout from "@/components/auth/auth-layout";
import SocialAuth from "@/components/auth/social-auth";
import { api } from "@/lib/api";
import { useRequireGuest } from "@/hooks/use-require-guest";
import { UserIcon, MailIcon, LockIcon } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    useRequireGuest();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // Note: password_confirmation is no longer required by backend as per plan
            const data = await api.post<any>('/api/v1/auth/register', {
                name,
                email,
                password,
            });

            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Trigger storage event for navbar update
            window.dispatchEvent(new Event('storage'));
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start building a calm daily Japanese study habit"
            badge="Sign up"
        >
            <SocialAuth />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="John Doe"
                        startIcon={UserIcon}
                    />
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
                    <div className="space-y-2">
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            minLength={8}
                            placeholder="At least 8 characters"
                            startIcon={LockIcon}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            Must be at least 8 characters
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        fullWidth
                        size="lg"
                        className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
