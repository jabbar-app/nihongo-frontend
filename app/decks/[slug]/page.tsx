'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, PlayIcon, LayersIcon, GraduationCapIcon, SearchIcon, ClockIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

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
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!slug) return;

        const fetchDeck = async () => {
            try {
                const data = await api.get<DeckData>(`/api/v1/decks/${slug}`);
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
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Loading Deck...</div>
                </div>
            </main>
        );
    }

    if (error || !deckData) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 flex items-center justify-center">
                <div className="max-w-md w-full px-4 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowLeftIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Deck Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "The deck you're looking for doesn't exist."}</p>
                    <Button onClick={() => router.push('/dashboard')} className="w-full">
                        Return to Dashboard
                    </Button>
                </div>
            </main>
        );
    }

    const { deck, cards: rawCards } = deckData;
    // Handle pagination (Laravel returns { data: [...] } for paginate(), array for get())
    // @ts-ignore - cards type definition in interface might need update but this fixes runtime
    const cardsList = Array.isArray(rawCards) ? rawCards : (rawCards?.data || []);

    // Filter cards based on search
    const filteredCards = cardsList.filter((card: any) =>
        (card.kanji && card.kanji.includes(searchQuery)) ||
        (card.kana && card.kana.includes(searchQuery)) ||
        (card.meaning_en && card.meaning_en.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-teal-600 to-emerald-600 dark:from-teal-900 dark:to-emerald-900 pb-16 pt-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-teal-200 blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
                    >
                        <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="md:flex items-start justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${deck.is_official ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30' : 'bg-orange-500/20 text-orange-100 border border-orange-400/30'}`}>
                                    {deck.is_official ? 'Official Deck' : 'Community Deck'}
                                </span>
                                {deck.level && (
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/10">
                                        {deck.level}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                                {deck.name}
                            </h1>

                            {deck.description && (
                                <p className="text-lg text-teal-50 dark:text-gray-300 max-w-2xl leading-relaxed opacity-90">
                                    {deck.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-4 mt-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white">
                                    <LayersIcon className="w-5 h-5 text-teal-200" />
                                    <span className="font-semibold">{deck.card_count}</span>
                                    <span className="text-teal-100/70 text-sm">Cards</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white">
                                    <ClockIcon className="w-5 h-5 text-teal-200" />
                                    <span className="font-semibold">~{Math.ceil(deck.card_count * 0.5)}</span>
                                    <span className="text-teal-100/70 text-sm">Mins</span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Start Button - Hidden on Mobile */}
                        <div className="hidden md:block mt-8 md:mt-0">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/review')}
                                size="lg"
                                className="whitespace-nowrap flex items-center justify-center cursor-pointer"
                            >
                                <PlayIcon className="w-6 h-6 mr-3 fill-current flex-shrink-0" />
                                Start Review
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Toolbar */}
                    <div className="border-b border-gray-100 dark:border-gray-700 p-4 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-30">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <BookOpenIcon className="w-5 h-5 text-teal-500" />
                                Card List
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-[300px]">
                        {filteredCards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCards.slice(0, 50).map((card: any) => (
                                    <div key={card.id} className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            {card.kanji ? (
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
                                                    {card.kanji}
                                                </div>
                                            ) : (
                                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {card.kana}
                                                </div>
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GraduationCapIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        {card.kanji && (
                                            <div className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">
                                                {card.kana}
                                            </div>
                                        )}

                                        <div className="text-gray-600 dark:text-gray-300 text-sm border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                                            {card.meaning_id || card.meaning_en}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
                                <SearchIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No cards found matching "{searchQuery}"</p>
                            </div>
                        )}

                        {filteredCards.length > 50 && (
                            <div className="mt-8 text-center">
                                <span className="text-sm text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                    Showing 50 of {filteredCards.length} cards
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50 safe-area-bottom">
                <Button
                    onClick={() => router.push('/review')}
                    className="w-full shadow-lg shadow-teal-600/20 text-lg py-6 rounded-full whitespace-nowrap flex items-center justify-center"
                >
                    <PlayIcon className="w-5 h-5 mr-2 fill-current flex-shrink-0" />
                    Start Reviewing ({deck.card_count})
                </Button>
            </div>
        </main>
    );
}
