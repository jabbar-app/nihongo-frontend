'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, GraduationCapIcon, BookIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';

interface Deck {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    level: string | null;
    source: string | null;
    is_official: boolean;
    card_count: number;
}

export default function DecksPage() {
    const router = useRouter();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/v1/decks`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load decks');
                }

                const data = await response.json();
                // Handle paginated response
                setDecks(data.data || data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDecks();
    }, []);

    const getDeckIcon = (deck: Deck) => {
        if (deck.level?.includes('N5') || deck.level?.includes('N4')) {
            return { Icon: GraduationCapIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
        }
        if (deck.level?.includes('N3') || deck.level?.includes('N2')) {
            return { Icon: BookOpenIcon, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
        }
        if (deck.level?.includes('N1')) {
            return { Icon: BookIcon, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
        }
        return { Icon: BookOpenIcon, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' };
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            <div className="max-w-md mx-auto">
                {/* Top Navigation */}
                <div className="px-4 pt-4 pb-2">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 -ml-2"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {/* Header */}
                <div className="px-4 pt-4 mb-4">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">All Decks</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Browse and study from available decks</p>
                </div>

                {/* Decks Grid */}
                {error ? (
                    <div className="px-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                            {error}
                        </div>
                    </div>
                ) : decks.length > 0 ? (
                    <div className="px-4 space-y-3">
                        {decks.map((deck) => {
                            const { Icon, bgColor, iconColor } = getDeckIcon(deck);
                            return (
                                <button
                                    key={deck.id}
                                    onClick={() => router.push(`/decks/${deck.slug}`)}
                                    className="w-full text-left"
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-6 h-6 ${iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-base mb-1 truncate text-gray-900 dark:text-white">{deck.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
                                                    {deck.level && ` • ${deck.level}`}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-4">
                        <Card>
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No decks available
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    );
}
