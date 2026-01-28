'use client';

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            <div className="max-w-md mx-auto md:max-w-2xl">
                {/* Top Navigation */}
                <div className="px-4 pt-4 pb-2">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 -ml-2"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {/* Login Card */}
                <div className="px-4 pt-8">
                    <Card className="mb-4">
                        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Log in to continue your daily plan and reviews.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="you@example.com"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="••••••••"
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                className="mt-6"
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </Button>
                        </form>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
                            New here?{" "}
                            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>
        </main>
    );
}
