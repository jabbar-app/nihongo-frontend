'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, PlayIcon } from 'lucide-react';
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

interface DeckData {
    deck: Deck;
    isGeneral: boolean;
    cards: any[];
}

export default function DeckDetailPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const [deckData, setDeckData] = useState<DeckData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;

        const fetchDeck = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/v1/decks/${slug}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load deck');
                }

                const data = await response.json();
                setDeckData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDeck();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
            </main>
        );
    }

    if (error || !deckData) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
                <div className="max-w-md mx-auto px-4 pt-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 -ml-2 mb-4"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                        {error || 'Deck not found'}
                    </div>
                </div>
            </main>
        );
    }

    const { deck, cards } = deckData;

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

                {/* Deck Header */}
                <div className="px-4 pt-4 mb-4">
                    <Card className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{deck.name}</h1>
                                {deck.level && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{deck.level}</div>
                                )}
                            </div>
                        </div>
                        {deck.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{deck.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-gray-900 dark:text-white">{deck.card_count}</span> cards
                            </div>
                            <Button
                                onClick={() => router.push('/review')}
                                size="sm"
                            >
                                <PlayIcon className="w-4 h-4 mr-2" />
                                Start Review
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Cards List */}
                {cards && cards.length > 0 && (
                    <div className="px-4">
                        <h2 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Cards in this deck</h2>
                        <div className="space-y-2">
                            {cards.slice(0, 20).map((card: any) => (
                                <Card key={card.id} padding="sm" className="hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            {card.kanji && (
                                                <div className="text-lg font-semibold mb-1 text-gray-900 dark:text-white" style={{ fontFamily: 'serif' }}>
                                                    {card.kanji}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-600 dark:text-gray-300">{card.kana}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.meaning_id || card.meaning_en}</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {cards.length > 20 && (
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Showing 20 of {cards.length} cards
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
