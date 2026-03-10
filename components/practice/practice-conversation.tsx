'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, SendIcon, XIcon, Volume2Icon, Settings2Icon, MicIcon, SquareIcon, LightbulbIcon, LoaderIcon } from 'lucide-react';
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
  onBack?: () => void;
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
  setClue,
  onBack
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
  }, [session.messages, clue, sending]);

  // Auto-play logic
  useEffect(() => {
    if (session.messages.length > lastMessageCountRef.current) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.role === 'assistant' && autoPlay && !loadingAudioId) {
        setTimeout(() => {
          playAudio(lastMessage.id, lastMessage.content);
        }, 500);
      }
      lastMessageCountRef.current = session.messages.length;
    } else {
      lastMessageCountRef.current = session.messages.length;
    }
  }, [session.messages, autoPlay, loadingAudioId, playAudio]);

  // Helper to parse and render structured feedback
  const renderFeedback = (feedback: string | null) => {
    if (!feedback) return null;

    try {
      const data = JSON.parse(feedback);
      const hasContent = data.grammar || data.naturalness || data.keigo || data.suggestion;

      if (!hasContent) return null;

      return (
        <div className="mt-2 text-sm max-w-xs md:max-w-sm ml-2 bg-blue-50/80 dark:bg-blue-900/10 border-l-2 border-blue-400 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-r-lg font-medium self-start animate-in fade-in slide-in-from-top-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 block border-b border-blue-200/50 dark:border-blue-700/30 pb-1">Feedback</span>

          <div className="space-y-2">
            {data.grammar && data.grammar !== 'Correct' && (
              <div>
                <span className="text-[10px] text-blue-500/70 block uppercase">Grammar</span>
                <p>{data.grammar}</p>
              </div>
            )}

            {data.naturalness && data.naturalness !== 'Natural' && (
              <div>
                <span className="text-[10px] text-blue-500/70 block uppercase">Naturalness</span>
                <p>{data.naturalness}</p>
              </div>
            )}

            {data.keigo && data.keigo !== 'N/A' && (
              <div>
                <span className="text-[10px] text-blue-500/70 block uppercase">Keigo</span>
                <p>{data.keigo}</p>
              </div>
            )}

            {data.suggestion && (
              <div className="bg-white/50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <span className="text-[10px] text-teal-600 dark:text-teal-400 block uppercase mb-1">Suggestion</span>
                <div
                  className="text-gray-900 dark:text-gray-100 [&>ruby]:mx-0.5"
                  dangerouslySetInnerHTML={{ __html: parseFurigana(data.suggestion) }}
                />
              </div>
            )}
          </div>
        </div>
      );
    } catch (e) {
      // Fallback for plain string feedback
      return (
        <div className="mt-2 text-sm max-w-xs md:max-w-sm ml-2 bg-blue-50/80 dark:bg-blue-900/10 border-l-2 border-blue-400 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-r-lg font-medium self-start animate-in fade-in slide-in-from-top-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-0.5 block">Suggestion</span>
          {feedback}
        </div>
      );
    }
  };

  const parseFurigana = (text: string) => {
    if (!text) return '';
    return text.replace(/[\{｛]\s*([^|｜}｝]+?)\s*[|｜]\s*([^}｝]+?)\s*[\}｝]/g, '<ruby>$1<rt>$2</rt></ruby>');
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;
    await onSendMessage(messageInput);
    setMessageInput('');
    setClue(null); // Clear clue on send
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 font-sans">

      {/* 1. Header (App Shell) */}
      <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/90 backdrop-blur-md z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Go Back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className="text-sm font-semibold truncate leading-tight">
              {session.title || 'Practice Conversation'}
            </span>
            {session.context && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5" title={session.context}>
                {session.context}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Chat Log Area */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-3xl mx-auto p-4 py-6 flex flex-col gap-6">

          {/* Start message placeholder/date */}
          <div className="flex justify-center mb-2">
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gray-500">
              Session Started
            </span>
          </div>

          {session.messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>

                  {/* Bubble */}
                  <div className="group relative flex items-center text-[15px] leading-relaxed">

                    {/* Audio Button for Assistant (shown to the left of the bubble or absolutely positioned) */}
                    {!isUser && (
                      <div className="absolute -left-10 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => playingAudioId === msg.id ? stopAudio() : playAudio(msg.id, msg.content)}
                          disabled={loadingAudioId === msg.id}
                          className={`p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 shadow-sm transition-all cursor-pointer`}
                        >
                          {loadingAudioId === msg.id ? <LoaderIcon className="w-3.5 h-3.5 animate-spin" /> : <Volume2Icon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <div
                      className={`
                        px-4 py-3 
                        ${isUser
                          ? 'bg-teal-500 text-white rounded-2xl rounded-tr-md shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-md border-transparent text-[15px]'}
                        ${!showFurigana ? 'furigana-hidden' : ''}
                        `}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="whitespace-pre-wrap [&>ruby]:mx-0.5" dangerouslySetInnerHTML={{ __html: parseFurigana(msg.content) }} />
                      )}
                    </div>
                  </div>

                  {/* Feedback area */}
                  {!isUser && renderFeedback(msg.feedback)}

                  {/* Timestamp */}
                  <span className={`text-[10px] text-gray-400 mt-1 mx-1`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Sending Indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5 h-[48px]">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Inline Clue Display */}
          {clue && (
            <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 text-sm w-full max-w-sm text-amber-800 dark:text-amber-300 relative shadow-sm">
                <button onClick={() => setClue(null)} className="absolute top-2 right-2 text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 p-1">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
                <strong className="block mb-1 text-xs uppercase tracking-wider">Hint</strong>
                <p className="mb-2">{clue.structure}</p>
                {clue.vocabulary && (
                  <p className="text-xs opacity-80 whitespace-pre-wrap">{clue.vocabulary}</p>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* 3. Dedicated Bottom Input Bar */}
      <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto w-full px-4 py-3 md:py-4">

          {inputError && (
            <div className="text-xs text-red-500 mb-2 font-medium px-2 animate-in fade-in">{inputError}</div>
          )}

          <div className="relative flex flex-col bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl p-2 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 transition-all">

            {/* Main Textarea */}
            <Textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setMessageInput(value);
                const isJapanese = /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\n\r\s\d～！、。？]*$/.test(value);
                if (!isJapanese && value.length > 0) {
                  setInputError('Please enter Japanese text only (Hiragana, Katakana, Kanji).');
                } else {
                  setInputError('');
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Message"}
              disabled={sending}
              style={{ minHeight: '44px' }}
              className={`w-full !border-none !ring-0 !shadow-none !bg-transparent px-3 py-2 max-h-[160px] resize-none text-[15px] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 scrollbar-hide ${isListening ? 'text-red-500' : ''}`}
              rows={1}
            />

            {/* Separator / Divider */}
            <div className="mx-2 h-px bg-gray-200 dark:hidden" />

            {/* Bottom Utilities */}
            <div className="flex items-center justify-between pt-1 pb-1 px-1">
              {/* Left Utilities */}
              <div className="flex items-center">
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    title="Conversation Settings"
                  >
                    <Settings2Icon className="w-5 h-5" />
                  </button>

                  {/* Settings Popup */}
                  {showSettings && (
                    <div className="absolute bottom-full left-0 mb-4 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 origin-bottom-left">
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-2">Settings</div>

                      <button onClick={() => setAutoPlay(!autoPlay)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                        <div className="flex items-center gap-2"><Volume2Icon className="w-4 h-4 text-gray-500" /><span>Auto-play audio</span></div>
                        <div className={`w-8 h-4.5 rounded-full relative transition-colors ${autoPlay ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <div className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white transition-transform ${autoPlay ? 'translate-x-[14px]' : ''}`}></div>
                        </div>
                      </button>

                      <button onClick={() => setShowFurigana(!showFurigana)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 flex items-center justify-center border border-gray-400 rounded text-[10px] font-bold">あ</div><span>Furigana</span></div>
                        <div className={`w-8 h-4.5 rounded-full relative transition-colors ${showFurigana ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <div className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white transition-transform ${showFurigana ? 'translate-x-[14px]' : ''}`}></div>
                        </div>
                      </button>

                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2"></div>

                      <button onClick={() => { setShowSettings(false); onEndSession(); }} disabled={ending} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors text-sm justify-start">
                        {ending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SquareIcon className="w-4 h-4 fill-current" />}
                        <span className="font-semibold">End Session</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Utilities & Send */}
              <div className="flex items-center gap-1">
                {/* Clue/Hint */}
                <button
                  type="button"
                  onClick={onGetClue}
                  disabled={loadingClue || sending}
                  className="p-2 text-amber-500 dark:text-amber-400 hover:text-amber-600 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Get Hint"
                >
                  {loadingClue ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <LightbulbIcon className="w-5 h-5" />}
                </button>

                {/* Mic / Voice */}
                {isSpeechSupported && !messageInput.trim() && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-gray-700 cursor-pointer'}`}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? <SquareIcon className="w-5 h-5 fill-current animate-pulse" /> : <MicIcon className="w-5 h-5" />}
                  </button>
                )}

                {/* Send Button */}
                {messageInput.trim() && (
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !!inputError}
                    className="p-2 ml-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-all disabled:opacity-50 disabled:scale-95 shadow-sm"
                    title="Send Message"
                  >
                    {sending ? <LoaderIcon className="w-5 h-5 animate-spin p-0.5" /> : <SendIcon className="w-5 h-5 pr-0.5 pt-0.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
