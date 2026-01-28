'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareIcon, SendIcon, XIcon, BookOpenIcon, MenuIcon, ArrowLeftIcon, LoaderIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import MobileSidebar from '@/components/mobile-sidebar';

interface Reading {
  id: number;
  type: string;
  title: string;
  description: string | null;
  content: string;
}

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
  reading?: Reading;
}

export default function PracticePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingSession, setStartingSession] = useState(false);

  // Practice state
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [showReadingSelector, setShowReadingSelector] = useState(true);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Invalid user data
      }
    }

    fetchReadings();
  }, [router]);

  useEffect(() => {
    if (session && session.messages.length > 0) {
      scrollToBottom();
    }
  }, [session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchReadings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/readings?type=conversation,article`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setReadings(data.readings?.data || data.readings || []);
      }
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (reading: Reading | null = null, customContext: string | null = null) => {
    try {
      setError('');
      setStartingSession(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      const payload: any = {};
      if (reading) {
        payload.reading_id = reading.id;
      }
      if (customContext) {
        payload.context = customContext;
        payload.title = 'Custom Practice';
      }

      const response = await fetch(`${apiUrl}/api/v1/practice/sessions/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to start practice session' };
        }
        throw new Error(errorData.message || 'Failed to start practice session');
      }

      const data = await response.json();

      // Ensure messages array includes the initial message
      const sessionData = {
        ...data.session,
        messages: data.session.messages || (data.initial_message ? [data.initial_message] : []),
      };
      setSession(sessionData);
      setShowReadingSelector(false);
      setSelectedReading(reading);

      // Focus input after a short delay
      setTimeout(() => inputRef.current?.focus(), 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setStartingSession(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !session || sending) return;

    const userMessage = messageInput.trim();
    setMessageInput('');
    setSending(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/api/v1/practice/sessions/${session.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();

      // Update session with new messages
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            data.user_message,
            data.assistant_message,
          ],
        };
      });

      // Focus input again
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessageInput(userMessage); // Restore message on error
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
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/api/v1/practice/sessions/${session.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to end session');
      }

      // Reset to start new session
      setSession(null);
      setSelectedReading(null);
      setShowReadingSelector(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setEnding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && messageInput.trim() && !sending) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] flex flex-col dark:bg-gray-900">
        {/* Top Navigation */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 text-center md:text-left md:ml-0">
            Practice Conversation
          </h1>

          <div className="flex items-center gap-2">
            {session && (
              <button
                onClick={endSession}
                disabled={ending}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="End Session"
                aria-label="End Session"
              >
                {ending ? (
                  <LoaderIcon className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                ) : (
                  <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 pt-2">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!session && (
          <div className="px-4 pt-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <button
                onClick={() => {}}
                className="px-4 py-3 text-sm font-medium text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 transition-colors"
              >
                Practice
              </button>
              <button
                onClick={() => router.push('/practice/history')}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                History
              </button>
            </div>
          </div>
        )}

        {/* Reading Selector */}
        {showReadingSelector && !session && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Select Practice Material</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose an article or conversation script to practice with, or start a free conversation.
              </p>
            </div>

            {/* Free Conversation Option */}
            <Card
              className={`p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${startingSession ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !startingSession && startSession(null, null)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  {startingSession ? (
                    <LoaderIcon className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin" />
                  ) : (
                    <MessageSquareIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">Free Conversation</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {startingSession ? 'Starting session...' : 'Start practicing without any material'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Reading List */}
            {readings.length > 0 ? (
              <div className="space-y-3">
                {readings.map((reading) => (
                  <Card
                    key={reading.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${startingSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !startingSession && startSession(reading)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{reading.title}</div>
                        {reading.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{reading.description}</div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {reading.type === 'article' ? 'Article' : reading.type === 'conversation' ? 'Conversation' : 'Story'}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700">
                <p>No articles or conversations available. Create one in your profile to get started.</p>
              </Card>
            )}
          </div>
        )}

        {/* Conversation Interface */}
        {session && (
          <>
            {/* Context Display */}
            {session.context && (
              <div className="px-4 pt-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Practice Context:</div>
                <div className="text-sm text-gray-900 dark:text-white max-h-20 overflow-y-auto mb-2 whitespace-pre-wrap">
                  {session.context.substring(0, 200)}
                  {session.context.length > 200 && '...'}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-4 space-y-4">
              {session.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">NihongoAI</div>
                    )}
                    {msg.role === 'user' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-right">You</div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
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

            {/* Input Area */}
            <div className="fixed bottom-16 left-0 right-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-40 md:bottom-0 md:relative md:z-auto">
              <div className="max-w-md mx-auto mb-4 md:max-w-4xl flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message in Japanese..."
                  disabled={sending}
                  className="flex-1 dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="px-4"
                >
                  {sending ? (
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <SendIcon className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
