import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, Sparkles } from "lucide-react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    image?: string;
    badge?: string;
}

export default function AuthLayout({ children, title, subtitle, badge }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
            {/* Left Side - Hero/Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-900 via-gray-900 to-emerald-950 opacity-100" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-24 left-24 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col p-12 justify-between">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-teal-300" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Manabou</span>
                        </Link>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-300 backdrop-blur-sm">
                                <span className="mr-2">🇯🇵</span> Daily Japanese Habit
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
                                Master Japanese,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400">
                                    one day at a time.
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Join thousands of learners building a consistent study routine with our spaced repetition system and curated daily plans.
                            </p>
                        </div>

                        {/* Testimonial or Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <blockquote className="space-y-3">
                                <p className="text-lg font-medium text-white">
                                    "継続は力なり (Keitsoku wa chikara nari) - Continuance is strength."
                                </p>
                                <footer className="text-sm text-gray-400">
                                    — Japanese Proverb
                                </footer>
                            </blockquote>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>© 2024 Manabou</span>
                        <div className="flex gap-4">
                            <span className="cursor-pointer hover:text-gray-300 transition-colors">Privacy</span>
                            <span className="cursor-pointer hover:text-gray-300 transition-colors">Terms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8 relative">
                {/* Mobile Header (Back Button) */}
                <div className="absolute top-4 left-4 lg:hidden">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        {badge && (
                            <span className="inline-block rounded-full bg-teal-50 dark:bg-teal-900/30 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2">
                                {badge}
                            </span>
                        )}
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        <p className="text-base text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
