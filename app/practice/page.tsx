'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareIcon, SendIcon, XIcon, BookOpenIcon, MenuIcon, ArrowLeftIcon, LoaderIcon, Volume2Icon, Settings2Icon, PlusIcon, MicIcon, SquareIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import { api } from '@/lib/api';
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from '@/components/ui/textarea';
import MobileSidebar from '@/components/mobile-sidebar';
import { useHeader } from "@/components/header-context";
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

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
  // Header Context Integration
  const { setHeaderContent } = useHeader();
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

  // Material CRUD state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState<{ type: string; title: string; description: string; content: string }>({
    type: 'conversation',
    title: '',
    description: '',
    content: '',
  });
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [materialError, setMaterialError] = useState('');
  const [deleteConfirmReading, setDeleteConfirmReading] = useState<Reading | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  // Audio state
  const [autoPlay, setAutoPlay] = useState(true);
  const { playAudio, loadingAudioId, playingAudioId, stopAudio } = useAudioPlayer();
  const lastMessageCountRef = useRef(0);

  // Voice Input state
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported: isSpeechSupported } = useSpeechRecognition();

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setMessageInput(transcript);
    }
  }, [transcript]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Auto-play logic
  useEffect(() => {
    if (session && session.messages.length > lastMessageCountRef.current) {
      const lastMessage = session.messages[session.messages.length - 1];
      // If it's a new message from assistant
      if (lastMessage.role === 'assistant' && autoPlay && !loadingAudioId) {
        // Small delay to ensure UI renders
        setTimeout(() => {
          playAudio(lastMessage.id, lastMessage.content);
        }, 500);
      }
      lastMessageCountRef.current = session.messages.length;
    } else if (session) {
      // Sync ref on load
      lastMessageCountRef.current = session.messages.length;
    }
  }, [session?.messages, autoPlay, loadingAudioId, playAudio]);


  useEffect(() => {
    if (isMobile) {
      // Only set header content if session is active or we want constant header
      // The previous implementation had the header always visible.
      // We will render the header via portal using setHeaderContent.

      setHeaderContent(

        <div className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
            >
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Practice Conversation
            </h1>
          </div>

          <div className="flex items-center gap-2">

            <ThemeToggle />
          </div>
        </div>
      );


    } else {
      setHeaderContent(null);
    }

    return () => setHeaderContent(null);
  }, [setHeaderContent, session, ending, sidebarOpen, isMobile, autoPlay]);

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

  const openAddModal = () => {
    setEditingReading(null);
    setMaterialForm({ type: 'conversation', title: '', description: '', content: '' });
    setMaterialError('');
    setShowMaterialModal(true);
  };

  const openEditModal = (reading: Reading) => {
    setEditingReading(reading);
    setMaterialForm({
      type: reading.type,
      title: reading.title,
      description: reading.description ?? '',
      content: reading.content,
    });
    setMaterialError('');
    setShowMaterialModal(true);
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false);
    setEditingReading(null);
    setMaterialForm({ type: 'conversation', title: '', description: '', content: '' });
    setMaterialError('');
  };

  const saveMaterial = async () => {
    if (!materialForm.title.trim()) {
      setMaterialError('Title is required.');
      return;
    }
    if (!materialForm.content.trim()) {
      setMaterialError('Content is required.');
      return;
    }
    setSaveLoading(true);
    setMaterialError('');
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      if (editingReading) {
        const response = await fetch(`${apiUrl}/api/v1/readings/${editingReading.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            type: materialForm.type,
            title: materialForm.title.trim(),
            description: materialForm.description.trim() || null,
            content: materialForm.content.trim(),
          }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to update material');
        }
      } else {
        const response = await fetch(`${apiUrl}/api/v1/readings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            type: materialForm.type,
            title: materialForm.title.trim(),
            description: materialForm.description.trim() || null,
            content: materialForm.content.trim(),
          }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to create material');
        }
      }
      closeMaterialModal();
      fetchReadings();
    } catch (err) {
      setMaterialError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaveLoading(false);
    }
  };

  const openDeleteConfirm = (reading: Reading, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmReading(reading);
  };

  const closeDeleteConfirm = () => {
    if (!deleteLoadingId) setDeleteConfirmReading(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmReading) return;
    const reading = deleteConfirmReading;
    setDeleteLoadingId(reading.id);
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/v1/readings/${reading.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to delete');
      setDeleteConfirmReading(null);
      fetchReadings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    } finally {
      setDeleteLoadingId(null);
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

    // Optimistically add user message
    const newUserMessage: PracticeMessage = {
      id: Date.now(), // Temporary ID
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

      const data = await api.post<{ assistant_message: PracticeMessage }>('/api/v1/practice/sessions/' + session.id + '/message', {
        message: userMessage,
      });

      // Update session with new messages
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages.filter(msg => msg.id !== newUserMessage.id), // Remove temporary user message
            newUserMessage, // Add user message with correct ID if needed, or just keep the optimistic one
            data.assistant_message,
          ],
        };
      });

      // Focus input again
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessageInput(userMessage); // Restore message on error
      // Remove optimistic user message if API call fails
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim() && !sending) {
        sendMessage();
      }
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
    <main className="h-[calc(100dvh-4rem)] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-h-0 w-full dark:bg-gray-900 relative">
        {/* Error Display */}
        {error && (
          <div className="px-4 pt-2 flex-none w-full">
            <div className="max-w-md mx-auto md:max-w-4xl p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!session && (
          <div className="flex-none px-4 pt-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 w-full">
            <div className="max-w-md mx-auto md:max-w-4xl flex gap-2">
              <button
                onClick={() => { }}
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

        {/* FAB: Add New Material */}
        {showReadingSelector && !session && (
          <button
            type="button"
            onClick={openAddModal}
            className="fixed right-4 bottom-[calc(5rem+1rem)] md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            title="Add New Material"
          >
            <PlusIcon className="w-7 h-7" />
          </button>
        )}

        {/* Reading Selector */}
        {showReadingSelector && !session && (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-md mx-auto md:max-w-4xl px-4 py-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Select Practice Material</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose an article or conversation script to practice with, or start a free conversation.
                </p>
              </div>

              {/* Free Conversation Option */}
              <Card
                className={`p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${startingSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !startingSession && startSession(null, null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
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
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openEditModal(reading)}
                            className="p-2 rounded-lg text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-teal-400 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeleteConfirm(reading, e)}
                            disabled={deleteLoadingId === reading.id}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoadingId === reading.id ? (
                              <LoaderIcon className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-4 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700">
                  <p>No articles or conversations available.</p>
                  <Button onClick={openAddModal} size="sm" className="mt-3 flex items-center gap-2 mx-auto">
                    <PlusIcon className="w-4 h-4" />
                    Add New Material
                  </Button>
                </Card>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmReading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeDeleteConfirm}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete material?</h3>
                      <button
                        type="button"
                        onClick={closeDeleteConfirm}
                        disabled={!!deleteLoadingId}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        &ldquo;{deleteConfirmReading.title}&rdquo; will be permanently deleted. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" onClick={closeDeleteConfirm} disabled={!!deleteLoadingId}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={confirmDelete} disabled={!!deleteLoadingId}>
                        {deleteLoadingId === deleteConfirmReading.id ? (
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Material Create/Edit Modal */}
              {showMaterialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeMaterialModal}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingReading ? 'Edit Material' : 'Add New Material'}
                      </h3>
                      <button
                        type="button"
                        onClick={closeMaterialModal}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {materialError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                          {materialError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={materialForm.type}
                          onChange={(e) => setMaterialForm((f) => ({ ...f, type: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                        >
                          <option value="conversation">Conversation</option>
                          <option value="article">Article</option>
                          <option value="story">Story</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                        <Input
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. At the restaurant"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                        <Input
                          value={materialForm.description}
                          onChange={(e) => setMaterialForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Short description"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                        <Textarea
                          value={materialForm.content}
                          onChange={(e) => setMaterialForm((f) => ({ ...f, content: e.target.value }))}
                          placeholder="Paste or type the conversation, article, or story text..."
                          className="w-full min-h-[120px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" onClick={closeMaterialModal} disabled={saveLoading}>
                        Cancel
                      </Button>
                      <Button onClick={saveMaterial} disabled={saveLoading}>
                        {saveLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : (editingReading ? 'Save changes' : 'Create')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversation Interface */}
        {session && (
          <>
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
                            className={`p-1 rounded-full transition-colors ${playingAudioId === msg.id ? 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20' : 'text-gray-400 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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
            </div>

            {/* Input Area */}
            <div className="flex-none px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-40 w-full">
              <div className="max-w-md mx-auto md:max-w-4xl px-4">
                <div className={`relative border-2 ${isListening ? 'border-red-500 bg-red-50/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : (inputError ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 focus-within:border-teal-500/50 dark:focus-within:border-teal-400/50 focus-within:ring-4 focus-within:ring-teal-500/10 dark:focus-within:ring-teal-400/10')} rounded-xl transition-all duration-300`}>
                  <Textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMessageInput(value);

                      // Validate Japanese
                      // Allow empty, or Japanese chars (Hiragana, Katakana, Kanji, Punctuation, Numbers, Whitespace)
                      const isJapanese = /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\n\r\s\d～！、。？]*$/.test(value);

                      if (!isJapanese && value.length > 0) {
                        setInputError('Please enter Japanese text only (Hiragana, Katakana, Kanji).');
                      } else {
                        setInputError('');
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message in Japanese..."
                    disabled={sending}
                    className={`w-full !border-none !ring-0 !shadow-none !bg-transparent px-4 py-3 min-h-[60px] ${inputError ? '!text-red-600' : ''}`}
                  />
                  <div className="flex justify-between items-center px-2 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={settingsRef}>
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="p-2 rounded-full text-gray-400 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Session Settings"
                        >
                          <Settings2Icon className="w-5 h-5" />
                        </button>

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

                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

                            <button
                              onClick={() => {
                                setShowSettings(false);
                                endSession();
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

                      <div className="text-xs text-red-500 font-medium px-2 py-1 min-h-[1.5em]">
                        {inputError}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSpeechSupported && (
                        <button
                          onClick={isListening ? stopListening : () => { resetTranscript(); startListening(); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105 ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-900' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-600'}`}
                          title={isListening ? "Stop Recording" : "Voice Input (Japanese)"}
                        >
                          {isListening ? (
                            <>
                              <SquareIcon className="w-4 h-4 fill-current animate-pulse" />
                              <span className="text-xs font-bold animate-pulse">Listening...</span>
                            </>
                          ) : (
                            <MicIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || sending || !!inputError}
                        size="sm"
                        className="rounded-lg"
                      >
                        {sending ? (
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <SendIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
