'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpenIcon, SearchIcon, XIcon, LoaderIcon, SparklesIcon, Volume2Icon } from 'lucide-react';
import { api } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';

interface DictionaryResult {
    word: string;
    reading: string;
    meanings: string[];
    type: string;
    details: string;
    examples: { ja: string; en: string }[];
}

export default function SmartDictionaryFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await api.post('/api/v1/dictionary/lookup', { word: query });
            if (data.data) {
                setResult(data.data);
            } else {
                setError('No definition found.');
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

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.95 }}
                            className="fixed inset-x-4 bottom-24 md:inset-auto md:bottom-24 md:right-8 md:w-96 z-50 flex flex-col max-h-[80vh]"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                                {/* Header / Search */}
                                <div className="p-4 bg-teal-600">
                                    <div className="flex items-center justify-between mb-4 text-white">
                                        <div className="flex items-center gap-2 font-bold">
                                            <BookOpenIcon className="w-5 h-5" />
                                            <span>Smart Dictionary</span>
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSearch} className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Enter word or kanji..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all font-sans"
                                        />
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                                        {loading && <LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white animate-spin" />}
                                    </form>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-0 bg-gray-50 dark:bg-gray-900 scrollbar-hide min-h-[200px]">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                                            <SparklesIcon className="w-8 h-8 animate-pulse text-teal-400" />
                                            <span className="text-sm">Consulting AI Dictionary...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="p-8 text-center text-red-500 text-sm">
                                            {error}
                                        </div>
                                    ) : result ? (
                                        <div className="p-5 space-y-5">
                                            {/* Word Header */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">{result.word}</h2>
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 tracking-wider">
                                                        {result.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3">
                                                    <span>{result.reading}</span>
                                                    <button onClick={() => playAudio(result.word)} className="p-1 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                                                        <Volume2Icon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.meanings.map((m, i) => (
                                                        <span key={i} className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            {result.details && (
                                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                                                    <div className="font-bold mb-1 opacity-80 text-xs uppercase">details</div>
                                                    {result.details}
                                                </div>
                                            )}

                                            {/* Examples */}
                                            {result.examples && result.examples.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Examples</div>
                                                    {result.examples.map((ex, i) => (
                                                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                                            <div className="font-serif text-gray-800 dark:text-gray-200 mb-1">{ex.ja}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">{ex.en}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 px-6 text-center text-gray-400 text-sm">
                                            Enter a word or kanji to get a detailed explanation powered by AI.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* FAB Trigger */}
            <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed right-6 bottom-24 md:right-8 md:bottom-8 z-40 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-gray-800 text-white rotate-45'
                        : 'bg-teal-600 text-white hover:bg-teal-500 hover:shadow-teal-500/30'
                    }`}
            >
                {isOpen ? <XIcon className="w-6 h-6" /> : <BookOpenIcon className="w-6 h-6" />}
            </motion.button>
        </>
    );
}
