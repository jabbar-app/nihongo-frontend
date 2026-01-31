"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PWATestPage() {
    const [showPrompt, setShowPrompt] = useState(true);

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">PWA Install Prompt Test</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The prompt was dismissed. Refresh the page to see it again.
                    </p>
                    <button
                        onClick={() => setShowPrompt(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Show Prompt Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                        PWA Install Prompt Test
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        This page demonstrates the PWA install prompt. The actual prompt appears below.
                    </p>
                </div>

                {/* Simulated PWA Install Prompt */}
                <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-up">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="relative p-6">
                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Install Manabou
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        Install our app for a better experience with offline access and quick launch.
                                    </p>

                                    <button
                                        onClick={() => alert("Install button clicked! In production, this would trigger the native install prompt.")}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        Install Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* iOS Version */}
                <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        iOS Version (for reference)
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Tap</span>
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                        </svg>
                        <span>then "Add to Home Screen"</span>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Testing Notes:
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• The actual PWA prompt will only appear on HTTPS sites</li>
                        <li>• The prompt appears 3 seconds after page load</li>
                        <li>• Dismissal is remembered for 3 days</li>
                        <li>• On iOS, manual installation instructions are shown</li>
                        <li>• On Android/Chrome, the native install prompt is triggered</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
