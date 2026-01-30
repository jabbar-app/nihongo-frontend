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
import { MailIcon, LockIcon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    useRequireGuest();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.post<any>('/api/v1/auth/login', { email, password });

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
            title="Welcome back"
            subtitle="Enter your credentials to access your account"
            badge="Log in"
        >
            <SocialAuth />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="••••••••"
                            startIcon={LockIcon}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
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
                        {loading ? 'Logging in...' : 'Sign in'}
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                        Create an account
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
