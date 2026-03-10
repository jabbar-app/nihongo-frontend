'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PracticeConversation from '@/components/practice/practice-conversation';
import { LoaderIcon, ArrowLeftIcon } from 'lucide-react';

interface PracticeMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    feedback: string | null;
    sequence: number;
    created_at: string;
}

interface PracticeSession {
    id: number;
    title: string | null;
    context: string | null;
    reading_id: number | null;
    started_at: string;
    ended_at: string | null;
    messages: PracticeMessage[];
}

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [session, setSession] = useState<PracticeSession | null>(null);

    const [sending, setSending] = useState(false);
    const [ending, setEnding] = useState(false);

    const [clue, setClue] = useState<{ structure: string; vocabulary: string } | null>(null);
    const [loadingClue, setLoadingClue] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        fetchSession();
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const data = await api.get<{ session: PracticeSession }>(`/api/v1/practice/sessions/${sessionId}`);
            setSession(data.session);
        } catch (err: any) {
            setError(err.message || 'Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || !session || sending) return;

        const userMessage = text.trim();
        setSending(true);
        setError('');

        // Optimistically add user message
        const newUserMessage: PracticeMessage = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            feedback: null,
            sequence: session.messages.length + 1,
            created_at: new Date().toISOString(),
        };

        try {
            setSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...prev.messages, newUserMessage],
                };
            });

            const data = await api.post<{ assistant_message: PracticeMessage }>(`/api/v1/practice/sessions/${session.id}/message`, {
                message: userMessage,
            });

            // Update session with new messages
            setSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [
                        ...prev.messages.filter(msg => msg.id !== newUserMessage.id),
                        newUserMessage,
                        data.assistant_message,
                    ],
                };
            });
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
            // Revert optimistic update
            setSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: prev.messages.filter(msg => msg.id !== newUserMessage.id),
                };
            });
        } finally {
            setSending(false);
        }
    };

    const endSession = async () => {
        if (!session || ending) return;

        if (!confirm('Are you sure you want to end this conversation? It will be saved to your history.')) {
            return;
        }

        setEnding(true);
        setError('');

        try {
            await api.post(`/api/v1/practice/sessions/${session.id}/end`, {});
            router.push('/practice/history'); // Or anywhere the user wants to go after ending
        } catch (err: any) {
            setError(err.message || 'Failed to end session');
        } finally {
            setEnding(false);
        }
    };

    const getClue = async () => {
        if (!session || loadingClue) return;
        setLoadingClue(true);
        setError('');
        try {
            const data = await api.post<{ structure: string; vocabulary: string }>(`/api/v1/practice/sessions/${session.id}/clue`, {});
            setClue(data);
        } catch (err: any) {
            setError(err.message || 'Failed to get clue');
        } finally {
            setLoadingClue(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-2">
                    <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
                    <p className="text-sm text-gray-500">Loading conversation...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800/30 text-center space-y-4">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Session not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:underline"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
            {/* Absolute positioning of error if any happens during chatting */}
            {error && !loading && session && (
                <div className="absolute top-16 left-0 right-0 z-50 p-2 pointer-events-none flex justify-center">
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm shadow-md border border-red-200 dark:border-red-800/30 pointer-events-auto">
                        {error}
                    </div>
                </div>
            )}

            <PracticeConversation
                session={session}
                onSendMessage={sendMessage}
                onEndSession={endSession}
                onGetClue={getClue}
                sending={sending}
                ending={ending}
                clue={clue}
                loadingClue={loadingClue}
                setClue={setClue}
                onBack={() => router.back()}
            />
        </div>
    );
}
