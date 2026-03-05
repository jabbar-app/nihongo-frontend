"use client";

import { useState, useEffect } from "react";
import { Loader2, Play, CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react";
import { api as apiClient } from "@/lib/api";

interface Question {
    id: number;
    question_jp: string;
    question_id: string;
    expected_answer: string;
    answers?: UserAnswer[];
}

interface UserAnswer {
    id: number;
    user_answer: string;
    is_correct: boolean;
    feedback: string;
}

interface Scenario {
    id: number;
    content: string;
    type: string;
    created_at: string;
    questions: Question[];
}

export default function CanDoScenarioView({ targetId }: { targetId: number }) {
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [history, setHistory] = useState<Scenario[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const [answers, setAnswers] = useState<string[]>([]);
    const [results, setResults] = useState<any[] | null>(null);
    const [overallGrade, setOverallGrade] = useState<{ correct: number; total: number; stars_earned: number } | null>(null);

    const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});

    const toggleTranslation = (id: number) => {
        setShowTranslations(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Load scenario history on mount
    useEffect(() => {
        fetchHistory();
    }, [targetId]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data: any = await apiClient.get(`/api/v1/cando-targets/${targetId}/scenarios`);
            const scenarios: Scenario[] = data.scenarios || [];
            setHistory(scenarios);

            // Auto-load the most recent scenario
            if (scenarios.length > 0) {
                loadScenarioFromHistory(scenarios[0]);
            }
        } catch (error: any) {
            console.error("Failed to load scenario history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const loadScenarioFromHistory = (s: Scenario) => {
        setScenario(s);
        setResults(null);
        setOverallGrade(null);
        setShowTranslations({});

        // Check if questions have user answers already (submitted scenario)
        const hasAnswers = s.questions.some(q => q.answers && q.answers.length > 0);
        if (hasAnswers) {
            // Pre-fill the answers and results from history
            const userAnswers = s.questions.map(q => q.answers?.[0]?.user_answer || "");
            setAnswers(userAnswers);

            const feedback = s.questions.map(q => {
                const ans = q.answers?.[0];
                return ans ? {
                    question_id: q.id,
                    is_correct: ans.is_correct,
                    feedback: ans.feedback,
                } : null;
            }).filter(Boolean);

            setResults(feedback);

            const correct = feedback.filter(f => f?.is_correct).length;
            setOverallGrade({ correct, total: s.questions.length, stars_earned: 0 });
        } else {
            setAnswers(new Array(s.questions.length).fill(""));
        }
    };

    const generateScenario = async () => {
        setLoading(true);
        setScenario(null);
        setAnswers([]);
        setResults(null);
        setOverallGrade(null);
        setShowTranslations({});
        setErrorMsg("");

        try {
            const data: any = await apiClient.post(`/api/v1/cando-targets/${targetId}/scenario/generate`, {});
            setScenario(data.scenario);
            setAnswers(new Array(data.scenario.questions.length).fill(""));
            // Refresh history
            fetchHistory();
        } catch (error: any) {
            console.error("Failed to generate scenario:", error);
            setErrorMsg("There was an error connecting to the AI service to generate your scenario.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const submitAnswers = async () => {
        if (!scenario) return;
        setSubmitting(true);
        setErrorMsg("");

        try {
            const payload = {
                answers: scenario.questions.map((q, i) => ({
                    question_id: q.id,
                    user_answer: answers[i]
                }))
            };

            const data: any = await apiClient.post(`/api/v1/cando-scenarios/${scenario.id}/submit`, payload);

            setResults(data.feedback);
            setOverallGrade(data.grade);
            // Refresh history to include submission results
            fetchHistory();
        } catch (error: any) {
            console.error("Failed to submit answers", error);
            setErrorMsg("There was an error submitting your answers.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loadingHistory) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading scenarios...</p>
            </div>
        );
    }

    // Empty state - no scenario loaded and not generating
    if (!scenario && !loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-4">
                        <Play className="w-8 h-8 ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ready to test your skills?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Our AI will generate a unique scenario, reading passage, or dialogue tailored to this specific Can-do target.
                    </p>
                    <button
                        onClick={generateScenario}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        Generate Scenario
                    </button>
                </div>

                {/* History list even in empty state */}
                <HistoryList
                    history={history}
                    activeScenarioId={null}
                    onSelect={loadScenarioFromHistory}
                    formatDate={formatDate}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">Generating your custom AI scenario...</p>
                <p className="text-sm text-gray-400 mt-2">This usually takes about 5-10 seconds.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/50">
                    {errorMsg}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Scenario Context
                    </h3>
                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-japanese text-lg sm:text-xl">
                        {scenario?.content}
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-8">
                    {scenario?.questions.map((q, index) => {
                        const feedback = results?.find(r => r.question_id === q.id);
                        const showTr = showTranslations[q.id];

                        return (
                            <div key={q.id} className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                        Q{index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900 dark:text-gray-100 font-medium text-lg mb-1 leading-snug">{q.question_jp}</p>

                                        <button
                                            onClick={() => toggleTranslation(q.id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 font-medium bg-transparent border-none cursor-pointer"
                                        >
                                            {showTr ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            {showTr ? 'Hide translation' : 'Show translation'}
                                        </button>

                                        {showTr && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">{q.question_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pl-10">
                                    <textarea
                                        value={answers[index]}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Type your answer in Japanese..."
                                        disabled={!!results}
                                        className="w-full min-h-[80px] p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-shadow resize-y"
                                    />

                                    {feedback && (
                                        <div className={`mt-3 p-4 rounded-lg border ${feedback.is_correct ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'}`}>
                                            <div className="flex items-start gap-2">
                                                {feedback.is_correct ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`font-medium ${feedback.is_correct ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                                                        {feedback.is_correct ? 'Correct!' : 'Needs Improvement'}
                                                    </p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                                        {feedback.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {!results ? (
                        <button
                            onClick={submitAnswers}
                            disabled={submitting || answers.some(a => !a.trim())}
                            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Answers
                        </button>
                    ) : (
                        <>
                            <div className="text-center sm:text-left">
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Final Score: {overallGrade?.correct} / {overallGrade?.total}
                                </p>
                            </div>
                            <button
                                onClick={generateScenario}
                                className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Generate New Scenario
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Scenario History */}
            <HistoryList
                history={history}
                activeScenarioId={scenario?.id ?? null}
                onSelect={loadScenarioFromHistory}
                formatDate={formatDate}
            />
        </div>
    );
}

/* ─── History Sub-component ─── */
function HistoryList({
    history,
    activeScenarioId,
    onSelect,
    formatDate,
}: {
    history: Scenario[];
    activeScenarioId: number | null;
    onSelect: (s: Scenario) => void;
    formatDate: (d: string) => string;
}) {
    if (history.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scenario History</h4>
                <span className="text-xs text-gray-400 ml-auto">{history.length} scenario{history.length !== 1 ? 's' : ''}</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {history.map((s) => {
                    const hasAnswers = s.questions.some(q => q.answers && q.answers.length > 0);
                    const correctCount = hasAnswers
                        ? s.questions.filter(q => q.answers?.[0]?.is_correct).length
                        : 0;
                    const isActive = s.id === activeScenarioId;

                    return (
                        <li key={s.id}>
                            <button
                                onClick={() => onSelect(s)}
                                className={`w-full text-left px-4 sm:px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center gap-3 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-3 border-indigo-500' : ''}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                                        {s.content.slice(0, 80)}{s.content.length > 80 ? '…' : ''}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {formatDate(s.created_at)} · <span className="capitalize">{s.type}</span>
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {hasAnswers ? (
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${correctCount === s.questions.length
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                            }`}>
                                            <CheckCircle2 className="w-3 h-3" />
                                            {correctCount}/{s.questions.length}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                            Not answered
                                        </span>
                                    )}
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
