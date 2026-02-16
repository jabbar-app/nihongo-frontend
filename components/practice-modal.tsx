'use client';

import { useEffect, RefObject, Ref } from 'react';
import { XIcon, RotateCcwIcon, LanguagesIcon, EyeIcon, EyeOffIcon, SendIcon, LoaderIcon } from 'lucide-react';
import Button from './ui/button';
import Input from './ui/input';

interface PracticeSentence {
    ja: string;
    ja_annotated?: string;
    id?: string;
    en?: string;
}

interface PracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    practiceSentence: PracticeSentence | null;
    showFurigana: boolean;
    showTranslation: boolean;
    onToggleFurigana: () => void;
    onToggleTranslation: () => void;
    onGenerateNew: () => void;
    generatingSentence: boolean;
    practiceInput: string;
    onInputChange: (value: string) => void;
    onCheck: () => void;
    practiceFeedback: 'none' | 'correct' | 'incorrect';
    practiceInputRef: Ref<HTMLInputElement>;
}

export function PracticeModal({
    isOpen,
    onClose,
    practiceSentence,
    showFurigana,
    showTranslation,
    onToggleFurigana,
    onToggleTranslation,
    onGenerateNew,
    generatingSentence,
    practiceInput,
    onInputChange,
    onCheck,
    practiceFeedback,
    practiceInputRef,
}: PracticeModalProps) {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            {/* Modal Container - Full screen on mobile, centered on desktop */}
            <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                            title="Close (ESC)"
                        >
                            <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Practice Sentence
                        </h2>
                    </div>

                    <button
                        onClick={onGenerateNew}
                        disabled={generatingSentence}
                        className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors cursor-pointer disabled:opacity-50"
                        title="Generate New Sentence"
                    >
                        <RotateCcwIcon className={`w-5 h-5 ${generatingSentence ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    {/* Toggle Controls */}
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                        <button
                            onClick={onToggleFurigana}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${showFurigana
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <LanguagesIcon className="w-4 h-4" />
                            <span>Furigana</span>
                        </button>

                        <button
                            onClick={onToggleTranslation}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${showTranslation
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {showTranslation ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                            <span>Translation</span>
                        </button>
                    </div>

                    {/* Sentence Display */}
                    <div className="space-y-4">
                        {generatingSentence ? (
                            <div className="h-32 flex items-center justify-center">
                                <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
                            </div>
                        ) : practiceSentence && practiceSentence.ja ? (
                            <div className="space-y-4">
                                {/* Japanese Sentence */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 sm:p-8 border-l-4 border-teal-500 shadow-sm">
                                    <div className="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-200 font-serif leading-relaxed break-words [&_rt]:text-sm [&_rt]:text-gray-500 [&_rt]:font-sans">
                                        {showFurigana && practiceSentence.ja_annotated ? (
                                            <span dangerouslySetInnerHTML={{ __html: practiceSentence.ja_annotated }} />
                                        ) : (
                                            practiceSentence.ja
                                        )}
                                    </div>
                                </div>

                                {/* Translation */}
                                {showTranslation && (practiceSentence.id || practiceSentence.en) && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-3 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {practiceSentence.id && (
                                            <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mr-2">ID:</span>
                                                {practiceSentence.id}
                                            </div>
                                        )}
                                        {practiceSentence.en && (
                                            <div className="text-base sm:text-lg text-gray-600 dark:text-gray-400 italic">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide not-italic mr-2">EN:</span>
                                                {practiceSentence.en}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="text-gray-400">
                                    <RotateCcwIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                                        No practice sentence yet
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        Click the refresh button above to generate a new sentence with AI
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Practice Input */}
                    {practiceSentence && practiceSentence.ja && (
                        <div className="space-y-3 pt-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Type the sentence:
                            </label>
                            <div className="relative">
                                <Input
                                    ref={practiceInputRef}
                                    value={practiceInput}
                                    onChange={(e) => onInputChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') onCheck();
                                    }}
                                    placeholder="練習..."
                                    className={`pr-14 text-base sm:text-lg min-h-[64px] ${practiceFeedback === 'correct'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 border-2'
                                        : practiceFeedback === 'incorrect'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 border-2'
                                            : ''
                                        }`}
                                />
                                <button
                                    onClick={onCheck}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/60 text-teal-600 dark:text-teal-400 transition-colors cursor-pointer"
                                    title="Check (Enter)"
                                >
                                    <SendIcon className={`w-5 h-5 ${practiceFeedback === 'correct' ? 'text-green-600' : ''}`} />
                                </button>
                            </div>

                            {/* Feedback */}
                            {practiceFeedback === 'correct' && (
                                <div className="text-sm text-green-600 dark:text-green-400 font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
                                    ✓ Correct! Great job!
                                </div>
                            )}
                            {practiceFeedback === 'incorrect' && (
                                <div className="text-sm text-red-600 dark:text-red-400 font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
                                    ✗ Not quite right. Try again!
                                </div>
                            )}

                            {/* Helper text */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-x-3">
                                <span>
                                    Press <kbd className="px-2 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd> to check
                                </span>
                                <span>•</span>
                                <span>
                                    Press <kbd className="px-2 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">ESC</kbd> to close
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
