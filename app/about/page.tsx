'use client';

import { GithubIcon, LinkedinIcon, TwitterIcon, HeartIcon, CodeIcon, GlobeIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 dark:opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-200 blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-200 blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        The Story Behind <span className="text-teal-600 dark:text-teal-400">Manabou</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Bridging the gap between active learning and real conversation.
                    </p>
                </div>
            </section>

            {/* The Mission Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HeartIcon className="w-8 h-8 text-teal-500 fill-teal-500/20" />
                            Why Manabou?
                        </h2>
                        <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
                            <p>
                                Learning a new language is an incredible journey, but for many students of Japanese, there's a common hurdle: <strong>speaking</strong>.
                            </p>
                            <p>
                                Textbooks and flashcards are great for vocabulary, but they can't talk back. Finding a conversation partner can be intimidating, expensive, or difficult to schedule.
                            </p>
                            <p>
                                I built <strong>Manabou</strong> ("Let's Learn") to solve this. utilizing advanced AI to provide a safe, judgment-free space where you can practice speaking Japanese anytime, anywhere. It sounds natural, understands context, and helps you improve—just like a real friend.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-600 rounded-2xl rotate-3 opacity-10"></div>
                        <div className="relative bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <blockquote className="italic text-gray-700 dark:text-gray-300 text-lg border-l-4 border-teal-500 pl-4">
                                "The best way to learn a language is to speak it. Manabou gives you the confidence to find your voice."
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Creator Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 flex items-center justify-center gap-3">
                        <CodeIcon className="w-8 h-8 text-blue-500" />
                        Meet the Creator
                    </h2>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="md:flex">
                            <div className="md:w-2/5 bg-gradient-to-br from-teal-500 to-blue-600 p-8 flex flex-col justify-center items-center text-white">
                                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 mb-6 overflow-hidden flex items-center justify-center">
                                    {/* Placeholder for Profile Image */}
                                    <span className="text-4xl font-bold">JA</span>
                                </div>
                                <h3 className="text-2xl font-bold">Jabbar Ali Panggabean</h3>
                                <p className="text-teal-100 font-medium">Full Stack Engineer</p>
                            </div>
                            <div className="md:w-3/5 p-8 md:p-12 text-left">
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    Hi! I'm Jabbar. I'm a passionate software engineer who loves building tools that empower people.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    Manabou is a project close to my heart, combining my interest in AI technology with the beauty of language learning. My goal is to make high-quality language practice accessible to everyone.
                                </p>

                                <div className="flex items-center gap-4">
                                    <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-teal-500 hover:text-white transition-colors" title="GitHub">
                                        <GithubIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-colors" title="LinkedIn">
                                        <LinkedinIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-sky-500 hover:text-white transition-colors" title="Twitter">
                                        <TwitterIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-500 hover:text-white transition-colors" title="Portfolio">
                                        <GlobeIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Ready to start speaking?
                </h2>
                <Link href="/practice" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 md:text-lg md:px-10 shadow-lg shadow-teal-600/30 transition-all hover:-translate-y-1">
                    Start Practicing Now
                </Link>
            </section>
        </div>
    );
}
