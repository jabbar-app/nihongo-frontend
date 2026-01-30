'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MessageSquareIcon, BookOpenIcon, CalendarIcon, ClockIcon, MenuIcon, TrashIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import { api } from '@/lib/api';
import Card from "@/components/ui/card";
import MobileSidebar from '@/components/mobile-sidebar';
import { useHeader } from "@/components/header-context";

interface Reading {
  id: number;
  title: string;
  type: string;
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
  duration_seconds: number | null;
  messages: PracticeMessage[];
  reading?: Reading;
  messages_count?: number;
}

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  // Header Context
  const { setHeaderContent } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setHeaderContent(

        <div className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
            >
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Practice History</h1>
          </div>

          <ThemeToggle />
        </div>
      );

    } else {
      setHeaderContent(null);
    }
    return () => setHeaderContent(null);
  }, [setHeaderContent, sidebarOpen, isMobile]);

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

    fetchSessions();
  }, [router]);

  const fetchSessions = async () => {
    try {
      const data = await api.get<{ data: PracticeSession[] } | PracticeSession[]>('/api/v1/practice/sessions');
      setSessions(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await api.delete(`/api/v1/practice/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const fetchSessionDetails = async (sessionId: number) => {
    try {
      const data = await api.get<{ session: PracticeSession }>(`/api/v1/practice/sessions/${sessionId}`);
      setSelectedSession(data.session);
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
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

      <div className="max-w-md mx-auto md:max-w-4xl">


        {/* Error Display */}
        {error && (
          <div className="px-4 pt-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!selectedSession && (
          <div className="sticky top-16 z-30 px-4 pt-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/practice')}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Practice
              </button>
              <button
                onClick={() => { }}
                className="px-4 py-3 text-sm font-medium text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 transition-colors"
              >
                History
              </button>
            </div>
          </div>
        )}

        {/* Session List */}
        {!selectedSession && (
          <div className="px-4 py-4">
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border dark:border-gray-600"
                    onClick={() => fetchSessionDetails(session.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        {session.reading ? (
                          <BookOpenIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        ) : (
                          <MessageSquareIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          {session.title || session.reading?.title || 'Free Conversation'}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{formatDate(session.started_at)}</span>
                          </div>
                          {session.duration_seconds && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatDuration(session.duration_seconds)}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {session.messages_count || session.messages?.length || 0} messages
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this session?')) {
                            deleteSession(session.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        title="Delete session"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center dark:bg-gray-800 dark:border dark:border-gray-600">
                <MessageSquareIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No practice sessions yet</p>
                <button
                  onClick={() => router.push('/practice')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Start Practicing
                </button>
              </Card>
            )}
          </div>
        )}

        {/* Session Details */}
        {selectedSession && (
          <div className="px-4 py-4">
            <button
              onClick={() => setSelectedSession(null)}
              className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to list</span>
            </button>

            <Card className="p-4 mb-4 dark:bg-gray-800 dark:border dark:border-gray-600">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedSession.title || selectedSession.reading?.title || 'Free Conversation'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(selectedSession.started_at)}</span>
                  </div>
                  {selectedSession.duration_seconds && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDuration(selectedSession.duration_seconds)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedSession.context && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Context:</div>
                  <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selectedSession.context}
                  </div>
                </div>
              )}
            </Card>

            {/* Messages */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Conversation</h3>
              {selectedSession.messages && selectedSession.messages.length > 0 ? (
                selectedSession.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {msg.role === 'assistant' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI</div>
                      )}
                      {msg.role === 'user' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-right">You</div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${msg.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border dark:border-gray-600'
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
                ))
              ) : (
                <Card className="p-4 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-800 dark:border dark:border-gray-600">
                  No messages in this session
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
