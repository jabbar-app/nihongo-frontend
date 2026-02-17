'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MessageSquareIcon, SendIcon, XIcon, Volume2Icon, Settings2Icon, MicIcon, SquareIcon, LightbulbIcon, LoaderIcon } from 'lucide-react';
import Button from "@/components/ui/button";
import Textarea from '@/components/ui/textarea';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

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

interface PracticeConversationProps {
    session: PracticeSession;
    onSendMessage: (text: string) => Promise<void>;
    onEndSession: () => void;
    onGetClue: () => void;
    sending: boolean;
    ending: boolean;
    clue: { structure: string; vocabulary: string } | null;
    loadingClue: boolean;
    setClue: (clue: { structure: string; vocabulary: string } | null) => void;
}

export default function PracticeConversation({
    session,
    onSendMessage,
    onEndSession,
    onGetClue,
    sending,
    ending,
    clue,
    loadingClue,
    setClue
}: PracticeConversationProps) {
    // Local state
    const [messageInput, setMessageInput] = useState('');
    const [inputError, setInputError] = useState('');
    const [showFurigana, setShowFurigana] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const lastMessageCountRef = useRef(0);

    // Hooks
    const { playAudio, loadingAudioId, playingAudioId, stopAudio } = useAudioPlayer();
    const { isListening, transcript, startListening, stopListening, isSupported: isSpeechSupported } = useSpeechRecognition();

    // Sync transcript to input
    useEffect(() => {
        if (transcript) {
            setMessageInput(transcript);
        }
    }, [transcript]);

    // Click outside to close settings
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-scroll logic
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session.messages]);

    // Auto-play logic
    useEffect(() => {
        if (session.messages.length > lastMessageCountRef.current) {
            const lastMessage = session.messages[session.messages.length - 1];
            // If it's a new message from assistant
            if (lastMessage.role === 'assistant' && autoPlay && !loadingAudioId) {
                // Small delay to ensure UI renders
                setTimeout(() => {
                    playAudio(lastMessage.id, lastMessage.content);
                }, 500);
            }
            lastMessageCountRef.current = session.messages.length;
        } else {
            // Sync ref on load
            lastMessageCountRef.current = session.messages.length;
        }
    }, [session.messages, autoPlay, loadingAudioId, playAudio]);

    // Helper to parse {Kanji|Reading} format to HTML
    const parseFurigana = (text: string) => {
        if (!text) return '';
        // Replace {Kanji|Reading} with <ruby>Kanji<rt>Reading</rt></ruby>
        return text.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || sending) return;
        await onSendMessage(messageInput);
        setMessageInput('');
        // Focus input again
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            if (messageInput.trim() && !sending) {
                handleSendMessage();
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full relative">
            {/* Context Display */}
            {session.context && (
                <div className="flex-none px-4 pt-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 w-full">
                    <div className="max-w-md mx-auto md:max-w-4xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Practice Context:</div>
                        <div className="text-sm text-gray-900 dark:text-white max-h-20 overflow-y-auto mb-2 whitespace-pre-wrap">
                            {session.context.substring(0, 200)}
                            {session.context.length > 200 && '...'}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-md mx-auto md:max-w-4xl p-4 space-y-4">
                    {session.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">NihongoAI</div>
                                        <button
                                            onClick={() => playingAudioId === msg.id ? stopAudio() : playAudio(msg.id, msg.content)}
                                            disabled={loadingAudioId === msg.id}
                                            className={`p-1 rounded-full transition-colors ${playingAudioId === msg.id ? 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20' : 'text-gray-400 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-800'} cursor-pointer`}
                                            title="Play Audio"
                                        >
                                            {loadingAudioId === msg.id ? (
                                                <LoaderIcon className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Volume2Icon className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                )}
                                {msg.role === 'user' && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-right">You</div>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-2 ${msg.role === 'user'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                                        } ${!showFurigana ? 'furigana-hidden' : ''}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="whitespace-pre-wrap [&>ruby]:mx-0.5" dangerouslySetInnerHTML={{ __html: parseFurigana(msg.content) }} />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>
                                {msg.role === 'assistant' && msg.feedback && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">💡 Feedback:</div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300">{msg.feedback}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                                <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-40 w-full">
                <div className="max-w-md mx-auto md:max-w-4xl px-4 space-y-4">

                    {/* Clue Display */}
                    {clue && (
                        <div className="relative p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={() => setClue(null)}
                                className="absolute top-2 right-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 cursor-pointer"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                            <div className="mb-2">
                                <span className="font-semibold text-yellow-800 dark:text-yellow-200 block mb-1">Sentence Structure Hint:</span>
                                <p className="text-yellow-700 dark:text-yellow-300">{clue.structure}</p>
                            </div>
                            {clue.vocabulary && (
                                <div>
                                    <span className="font-semibold text-yellow-800 dark:text-yellow-200 block mb-1">Useful Vocabulary:</span>
                                    <p className="text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{clue.vocabulary}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2 items-end">
                        <div className="relative flex-1">
                            <Textarea
                                ref={inputRef}
                                value={messageInput}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    const value = e.target.value;
                                    setMessageInput(value);

                                    // Validate Japanese
                                    const isJapanese = /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\n\r\s\d～！、。？]*$/.test(value);

                                    if (!isJapanese && value.length > 0) {
                                        setInputError('Please enter Japanese text only (Hiragana, Katakana, Kanji).');
                                    } else {
                                        setInputError('');
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? "Listening..." : "Type your message in Japanese..."}
                                disabled={sending}
                                className={`w-full !border-none !ring-0 !shadow-none !bg-transparent px-4 py-3 min-h-[50px] max-h-[150px] resize-none pr-10 ${inputError ? '!text-red-600' : ''} ${isListening ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                rows={1}
                            />

                            <div className="absolute right-2 bottom-2">
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-full transition-all ${isListening
                                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        } ${!isSpeechSupported ? 'hidden' : ''} cursor-pointer`}
                                    title={isListening ? "Stop recording" : "Voice input"}
                                >
                                    {isListening ? (
                                        <SquareIcon className="w-4 h-4 fill-current" />
                                    ) : (
                                        <MicIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || sending || !!inputError}
                            className="h-[50px] w-[50px] p-0 flex items-center justify-center flex-shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {sending ? (
                                <LoaderIcon className="w-6 h-6 animate-spin" />
                            ) : (
                                <SendIcon className="w-6 h-6 ml-0.5" />
                            )}
                        </Button>
                    </div>

                    <div className="flex justify-between items-center px-1 pb-1">
                        <div className="relative" ref={settingsRef}>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 dark:text-gray-500 dark:hover:text-teal-400 transition-colors cursor-pointer"
                                    title="Settings"
                                >
                                    <Settings2Icon className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={onGetClue}
                                    disabled={loadingClue || sending}
                                    className="p-1 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                    title="Get a hint"
                                >
                                    {loadingClue ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <LightbulbIcon className="w-4 h-4" />}
                                </button>
                            </div>

                            {showSettings && (
                                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1 uppercase tracking-wider">
                                        Session Settings
                                    </div>

                                    <button
                                        onClick={() => setAutoPlay(!autoPlay)}
                                        className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-left"
                                    >
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                            <Volume2Icon className="w-4 h-4" />
                                            <span>Auto-play Audio</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${autoPlay ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${autoPlay ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowFurigana(!showFurigana)}
                                        className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-left cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                            <span className="text-xs font-bold border border-current rounded px-0.5">あ</span>
                                            <span>Furigana</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${showFurigana ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${showFurigana ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </button>

                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

                                    <button
                                        onClick={() => {
                                            setShowSettings(false);
                                            onEndSession();
                                        }}
                                        disabled={ending}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors text-sm text-left disabled:opacity-50"
                                    >
                                        {ending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <XIcon className="w-4 h-4" />}
                                        <span>End Session</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-red-500 font-medium ml-2 flex-1 text-right">
                            {inputError}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
