'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchIcon, LoaderIcon, SparklesIcon, Volume2Icon, BookOpenIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface DictionaryResult {
    word: string;
    reading: string;
    meanings: string[];
    type: string;
    details: string;
    examples: { ja: string; en: string }[];
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [searchedQuery, setSearchedQuery] = useState('');
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async (searchWord?: string) => {
        const word = searchWord || query;
        if (!word.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);
        setSearchedQuery(word.trim());

        // Update URL without full navigation
        router.replace(`/search?q=${encodeURIComponent(word.trim())}`, { scroll: false });

        try {
            const data = await api.post('/api/v1/dictionary/lookup', { word: word.trim() });
            if (data.data) {
                setResult(data.data);
            } else {
                setError('No definition found for this word.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to lookup word. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Auto-search on page load if query param exists
    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Search Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
                    <div className="flex items-center gap-3 mb-5">
                        <BookOpenIcon className="w-6 h-6 text-gray-400" />
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                            辞書検索 <span className="text-gray-400 font-normal text-sm">Dictionary Search</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit} className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="言葉・漢字を入力... Enter a word or kanji"
                            className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
                        />
                        {loading && <LoaderIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <SparklesIcon className="w-10 h-10 animate-pulse text-teal-400" />
                        <span className="text-sm">AI辞書を検索中... Consulting AI Dictionary</span>
                    </div>
                ) : error ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
                    </div>
                ) : result ? (
                    <div className="space-y-5">
                        {/* Searched Query Label */}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            検索結果: <span className="font-medium text-gray-600 dark:text-gray-300">{searchedQuery}</span>
                        </p>

                        {/* Word Header Card */}
                        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-serif">{result.word}</h2>
                                <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 tracking-wider">
                                    {result.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium mb-4">
                                <span>{result.reading}</span>
                                <button
                                    onClick={() => playAudio(result.word)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                    <Volume2Icon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.meanings.map((m, i) => (
                                    <span key={i} className="inline-block px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        {result.details && (
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">詳細 Details</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.details}</p>
                            </div>
                        )}

                        {/* Examples */}
                        {result.examples && result.examples.length > 0 && (
                            <div className="space-y-3">
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">例文 Examples</div>
                                {result.examples.map((ex, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="font-serif text-gray-800 dark:text-gray-200 mb-1.5 text-base">{ex.ja}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">{ex.en}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : !initialQuery ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">言葉・漢字を入力して検索してください</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">Enter a word or kanji to get a detailed AI-powered explanation</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoaderIcon className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
