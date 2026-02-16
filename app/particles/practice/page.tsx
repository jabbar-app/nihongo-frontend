'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, LoaderIcon, RefreshCwIcon, Volume2Icon } from 'lucide-react';
import { api } from '@/lib/api';
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
// import Confetti from 'react-confetti'; // Maybe add later if available

interface Question {
    question: string;
    correct_answer: string;
    options: string[];
    explanation: string;
    romaji: string;
    meaning: string;
}

export default function ParticlePracticePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetParticle = searchParams.get('particle');

    const [loading, setLoading] = useState(true);
    const [questionData, setQuestionData] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [streak, setStreak] = useState(0);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowExplanation(false);

        try {
            const endpoint = targetParticle
                ? `/api/v1/particles/practice?particle=${targetParticle}`
                : '/api/v1/particles/practice';

            const data = await api.post<Question>(endpoint, {});
            setQuestionData(data);
        } catch (error) {
            console.error('Failed to fetch question:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, [targetParticle]);

    const handleOptionSelect = (option: string) => {
        if (isCorrect !== null) return; // Prevent changing after answer
        setSelectedOption(option);
    };

    const checkAnswer = () => {
        if (!selectedOption || !questionData) return;

        const correct = selectedOption === questionData.correct_answer;
        setIsCorrect(correct);
        setShowExplanation(true);

        if (correct) {
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }
    };

    if (loading && !questionData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {targetParticle ? `Practicing "${targetParticle}"` : 'Mixed Practice'}
                    </span>
                </div>
                <div className="text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">
                    Streak: {streak} 🔥
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
                {questionData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Question Card */}
                        <Card className="p-8 mb-8 text-center shadow-lg border-t-4 border-teal-500">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                                {questionData.question.split(/(\[ \])/).map((part, i) =>
                                    part === '[ ]' ? (
                                        <span key={i} className={`inline-block border-b-4 mx-2 px-2 min-w-[3rem] transition-colors
                      ${isCorrect === null
                                                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-transparent'
                                                : isCorrect
                                                    ? 'border-green-500 text-green-600 dark:text-green-400'
                                                    : 'border-red-500 text-red-600 dark:text-red-400'
                                            }
                    `}>
                                            {isCorrect !== null ? (isCorrect ? questionData.correct_answer : selectedOption) : '?'}
                                        </span>
                                    ) : part
                                )}
                            </h2>

                            {/* Context/Meaning */}
                            <div className="text-gray-500 dark:text-gray-400 space-y-1">
                                <p className="font-medium text-lg text-gray-700 dark:text-gray-300">{questionData.meaning}</p>
                                <p className="text-sm opacity-70 font-mono">{questionData.romaji}</p>
                            </div>
                        </Card>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {questionData.options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                const isAnswer = option === questionData.correct_answer;

                                let variantClass = "border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20";

                                if (isCorrect !== null) {
                                    if (isAnswer) {
                                        variantClass = "border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                                    } else if (isSelected && !isAnswer) {
                                        variantClass = "border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 opacity-70";
                                    } else {
                                        variantClass = "border-2 border-gray-100 dark:border-gray-800 opacity-50";
                                    }
                                } else if (isSelected) {
                                    variantClass = "border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-200 dark:ring-teal-900 ring-offset-2 dark:ring-offset-gray-900";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={isCorrect !== null}
                                        className={`p-6 rounded-xl text-2xl font-bold transition-all duration-200 transform active:scale-95 ${variantClass}`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Actions / Feedback */}
                        <div className="space-y-4">
                            {isCorrect === null ? (
                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 font-bold shadow-md hover:shadow-lg transition-all"
                                    disabled={!selectedOption || loading}
                                    onClick={checkAnswer}
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className={`p-4 rounded-xl mb-4 flex gap-4 items-start ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {isCorrect ? (
                                                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-bold mb-1 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                                {isCorrect ? 'Correct!' : 'Incorrect'}
                                            </h4>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {questionData.explanation}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full text-lg h-14 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                                        onClick={fetchQuestion}
                                        disabled={loading}
                                    >
                                        {loading ? <LoaderIcon className="w-5 h-5 animate-spin mx-auto" /> : 'Next Question'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
