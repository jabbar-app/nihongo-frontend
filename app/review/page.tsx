'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LightbulbIcon, LightbulbOffIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, Volume2Icon, MenuIcon, UndoIcon, SkipForwardIcon, ClockIcon, TrendingUpIcon, XIcon, EditIcon, TrashIcon, SparklesIcon, SaveIcon, LoaderIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import Card from "@/components/ui/card";
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from "@/components/ui/input";
import ProgressBar from "@/components/ui/progress-bar";
import MobileSidebar from '@/components/mobile-sidebar';

interface UserCardData {
  repetition: number;
  lapse: number;
  interval_days: number;
  ease_factor: number;
  last_grade: string | null;
  due_at: string | null;
  last_reviewed_at: string | null;
}

interface CardContent {
  id: number;
  kanji: string | null;
  kana: string;
  meaning_id: string;
  meaning_en: string | null;
  example_sentence_ja: string | null;
  example_sentence_id: string | null;
  audio_word_url: string | null;
  audio_sentence_url: string | null;
  tags: string[] | null;
  user_card?: UserCardData | null;
}

import { useHeader } from "@/components/header-context";

// --- Helper Functions (Pure/Global) ---

function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[type]);
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}

function formatSessionTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export default function ReviewPage() {
  const router = useRouter();
  const { setHeaderContent } = useHeader();
  const [queue, setQueue] = useState<CardContent[] | null>(null);
  const [currentCard, setCurrentCard] = useState<CardContent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintState, setHintState] = useState<'none' | 'kana' | 'meaning'>('none');
  const [kanaInput, setKanaInput] = useState('');
  const [kanaCorrect, setKanaCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(''); // New state for input validation
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  // Mobile: stick input bar above keyboard when focused
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardBottomOffset, setKeyboardBottomOffset] = useState(0);

  // ... (existing state) ...

  // Helper: input is Japanese (kana/kanji) → we check kana; otherwise we check meaning
  const isJapanese = (text: string) => {
    return /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\n\r\s\d～！、。？]*$/.test(text);
  };

  const meaningMatchesCard = (input: string, card: CardContent): boolean => {
    const n = input.trim().toLowerCase();
    if (!n) return false;
    const id = (card.meaning_id || '').trim().toLowerCase();
    const en = (card.meaning_en || '').trim().toLowerCase();
    return n === id || n === en;
  };

  const handeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKanaInput(value);
    if (inputError) setInputError('');
  };

  const toggleHint = () => {
    setHintState(prev => {
      if (prev === 'none') return 'kana';
      if (prev === 'kana') return 'meaning';
      return 'none';
    });
  };




  // Session statistics
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    startTime: Date.now(),
    cardTimes: [] as number[]
  });

  // Card tracking
  const [currentCardStartTime, setCurrentCardStartTime] = useState(Date.now());
  const [cardDifficulty, setCardDifficulty] = useState<'new' | 'learning' | 'mastered'>('new');
  const [mnemonic, setMnemonic] = useState<any>(null);
  const [similarCards, setSimilarCards] = useState<CardContent[]>([]);
  const [showFurigana, setShowFurigana] = useState(false);
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [mnemonicContent, setMnemonicContent] = useState('');
  const [generatingMnemonic, setGeneratingMnemonic] = useState(false);
  const [savingMnemonic, setSavingMnemonic] = useState(false);
  const [lastAction, setLastAction] = useState<{ cardId: number, grade: string, reviewId: number } | null>(null);
  const [skippedCards, setSkippedCards] = useState<number[]>([]);
  const [reviewStreak, setReviewStreak] = useState(0);

  // --- Helper Functions (Hoisted) ---

  // --- Helper Functions (Hoisted) ---
  // triggerHaptic, formatTime, formatSessionTime are defined outside component


  function handleAnswerCheck() {
    if (!currentCard) return;
    const cardContent = currentCard;
    const trimmed = kanaInput.trim();

    if (!trimmed) {
      setShowAnswer(true);
      return;
    }

    const inputIsJapanese = isJapanese(trimmed);
    let correct: boolean;

    if (inputIsJapanese) {
      correct = trimmed.toLowerCase() === cardContent.kana.toLowerCase();
    } else {
      correct = meaningMatchesCard(trimmed, cardContent);
    }

    setKanaCorrect(correct);
    setShowFeedback(true);
    if (correct) triggerHaptic('light');
    else triggerHaptic('medium');

    setTimeout(() => {
      setShowAnswer(true);
      setShowFeedback(false);
    }, 1500);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnswerCheck();
    }
  }

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Handle audio play errors silently
    });
  };

  async function fetchMnemonic(cardId: number) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/cards/${cardId}/mnemonic`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMnemonic(data);
        if (data && data.content) {
          setMnemonicContent(data.content);
        } else {
          setMnemonicContent('');
        }
      } else if (response.status === 404) {
        setMnemonic(null);
        setMnemonicContent('');
      }
    } catch (err) {
      // Silently fail
    }
  }

  async function generateMnemonic() {
    if (!currentCard) return;
    const cardContent = currentCard;

    setGeneratingMnemonic(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/cards/${cardContent.id}/mnemonic/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.mnemonics && data.mnemonics.length > 0) {
          const generatedMnemonic = data.mnemonics[0];
          setMnemonicContent(generatedMnemonic);
          setEditingMnemonic(true);
        }
      }
    } catch (err) {
      console.error('Failed to generate mnemonic:', err);
    } finally {
      setGeneratingMnemonic(false);
    }
  }

  async function saveMnemonic() {
    if (!currentCard || !mnemonicContent.trim()) return;
    const cardContent = currentCard;

    setSavingMnemonic(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      let response;
      if (mnemonic && mnemonic.id) {
        response = await fetch(`${apiUrl}/api/v1/mnemonics/${mnemonic.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ content: mnemonicContent.trim() }),
        });
      } else {
        response = await fetch(`${apiUrl}/api/v1/cards/${cardContent.id}/mnemonic`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ content: mnemonicContent.trim(), type: 'custom' }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setMnemonic(data);
        setEditingMnemonic(false);
        fetchMnemonic(cardContent.id);
      }
    } catch (err) {
      console.error('Failed to save mnemonic:', err);
    } finally {
      setSavingMnemonic(false);
    }
  }

  async function deleteMnemonic() {
    if (!currentCard || !mnemonic || !mnemonic.id) return;

    if (!confirm('Are you sure you want to delete this mnemonic?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/mnemonics/${mnemonic.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setMnemonic(null);
        setMnemonicContent('');
        setEditingMnemonic(false);
      }
    } catch (err) {
      console.error('Failed to delete mnemonic:', err);
    }
  }

  async function fetchSimilarCards(cardId: number) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/cards/${cardId}/similar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSimilarCards(data.cards || []);
      }
    } catch (err) {
      // Silently fail
    }
  }

  const handleUndo = useCallback(() => {
    if (!lastAction || !queue) return;

    const originalQueue = [...queue];
    const cardToReinsert = originalQueue.find(item => item.id === lastAction.reviewId);

    if (cardToReinsert) {
      const newQueue = [cardToReinsert, ...queue];
      setQueue(newQueue);
      setCurrentCard(cardToReinsert);
    } else {
      if (queue.length > 0) {
        setCurrentCard(queue[0]);
      } else {
        router.push('/dashboard');
      }
    }

    setLastAction(null);
    setShowAnswer(false);
    setKanaInput('');
    setKanaCorrect(null);
    setShowFeedback(false);

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct - (lastAction.grade === 'good' || lastAction.grade === 'easy' ? 1 : 0),
      incorrect: prev.incorrect - (lastAction.grade === 'again' ? 1 : 0),
      total: prev.total - 1,
      cardTimes: prev.cardTimes.slice(0, -1)
    }));
  }, [lastAction, queue, router]);

  function handleSkip() {
    if (!queue || !currentCard) return;

    setSkippedCards([...skippedCards, currentCard.id]);

    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    if (nextQueue.length > 0) {
      setCurrentCard(nextQueue[0]);
    } else {
      router.push('/dashboard');
    }
  }

  async function handleGrade(grade: 'again' | 'hard' | 'good' | 'easy') {
    if (!queue || !currentCard) return;

    setSubmitting(true);
    const cardContent = currentCard;
    const cardTime = Math.floor((Date.now() - currentCardStartTime) / 1000);

    setLastAction({
      cardId: cardContent.id,
      grade,
      reviewId: currentCard.id,
    });

    const wasCorrect = grade === 'good' || grade === 'easy';
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (grade === 'again' ? 1 : 0),
      total: prev.total + 1,
      cardTimes: [...prev.cardTimes, cardTime],
    }));

    triggerHaptic('medium');

    try {
      await api.post(`/api/v1/review/${currentCard.id}`, {
        grade: grade,
        was_correct: wasCorrect,
        response_time_ms: cardTime * 1000,
      });

      const nextQueue = queue.slice(1);
      setQueue(nextQueue);
      if (nextQueue.length > 0) {
        setCurrentCard(nextQueue[0]);
        triggerHaptic('light');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  // --- Effects ---

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
      }
    }

    const fetchQueue = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.get<{ cards: CardContent[] }>('/api/v1/review/queue?limit=10');

        const items = data.cards || [];
        setQueue(items);
        if (items.length > 0) {
          setCurrentCard(items[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [router]);

  useEffect(() => {
    const fetchStreak = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.chartData && data.chartData.length > 0) {
            const recentDays = [...data.chartData].reverse().slice(-5);
            let streak = 0;
            const todayData = recentDays[recentDays.length - 1];

            if (todayData && (todayData.reviews > 0 || todayData.focusMinutes > 0)) {
              streak = 1;
              for (let i = recentDays.length - 2; i >= 0; i--) {
                if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) {
                  streak++;
                } else {
                  break;
                }
              }
            }
            setReviewStreak(streak);
          }
        }
      } catch (err) {
      }
    };

    fetchStreak();
  }, []);

  useEffect(() => {
    if (currentCard) {
      setShowAnswer(false);
      setHintState('none'); // Reset hint
      setKanaInput('');
      setKanaCorrect(null);
      setShowFeedback(false);
      setInputFocused(false);
      setKeyboardBottomOffset(0);
      setCurrentCardStartTime(Date.now());
      setMnemonic(null);
      setSimilarCards([]);
      setShowFurigana(false);
      setEditingMnemonic(false);
      setMnemonicContent('');

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentCard]);

  useEffect(() => {
    if (showAnswer && currentCard) {
      setInputFocused(false);
      setKeyboardBottomOffset(0);
      fetchMnemonic(currentCard.id);
      fetchSimilarCards(currentCard.id);
    }
  }, [showAnswer, currentCard]);

  useEffect(() => {
    if (currentCard) {
      const userCard = currentCard.user_card;

      if (!userCard || userCard.repetition === 0) {
        setCardDifficulty('new');
      } else if (userCard.repetition > 0 && userCard.repetition < 5) {
        setCardDifficulty('learning');
      } else if (userCard.repetition >= 5 && userCard.interval_days > 7) {
        setCardDifficulty('mastered');
      } else {
        setCardDifficulty('learning');
      }
    }
  }, [currentCard]);

  useEffect(() => {
    if (!currentCard || kanaCorrect !== null || showFeedback || !kanaInput.trim()) return;
    const cardContent = currentCard;
    const trimmed = kanaInput.trim();
    const inputIsJapanese = isJapanese(trimmed);
    let correct: boolean;
    if (inputIsJapanese) {
      correct = trimmed.toLowerCase() === cardContent.kana.toLowerCase();
    } else {
      correct = meaningMatchesCard(trimmed, cardContent);
    }
    if (correct) {
      setKanaCorrect(true);
      setShowFeedback(true);
      setTimeout(() => {
        setShowAnswer(true);
        setShowFeedback(false);
      }, 1500);
    }
  }, [kanaInput, currentCard, kanaCorrect, showFeedback]);

  // Header Context
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: when input is focused, position input bar above keyboard (visualViewport)
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv || !isMobile) return;

    const updateKeyboardOffset = () => {
      if (!inputFocused) {
        setKeyboardBottomOffset(0);
        return;
      }
      const offset = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
      setKeyboardBottomOffset(offset);
    };

    updateKeyboardOffset();
    vv.addEventListener('resize', updateKeyboardOffset);
    vv.addEventListener('scroll', updateKeyboardOffset);
    return () => {
      vv.removeEventListener('resize', updateKeyboardOffset);
      vv.removeEventListener('scroll', updateKeyboardOffset);
    };
  }, [isMobile, inputFocused]);

  useEffect(() => {
    if (!inputFocused) setKeyboardBottomOffset(0);
  }, [inputFocused]);

  // Set header content
  useEffect(() => {
    if (isMobile) {
      setHeaderContent(
        <div className="w-full h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-3 flex-1 justify-center">
            {/* Session Stats */}
            {sessionStats.total > 0 && queue && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                </span>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatSessionTime(Date.now() - sessionStats.startTime)}
                </span>
              </div>
            )}

            {/* Review Streak */}
            {reviewStreak > 0 && (
              <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                <TrendingUpIcon className="w-3 h-3" />
                <span>{reviewStreak}d</span>
              </div>
            )}

            {/* Card Counter */}
            {queue && (
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {sessionStats.total + 1} / {sessionStats.total + queue.length}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Undo Button */}
            {lastAction && (
              <button
                onClick={handleUndo}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Undo last action (←)"
              >
                <UndoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      );
    } else {
      setHeaderContent(null);
    }

    return () => setHeaderContent(null);
  }, [setHeaderContent, sidebarOpen, sessionStats, queue, reviewStreak, lastAction, formatSessionTime, handleUndo, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Enter' && e.key !== 'Escape') {
          return;
        }
      }

      // Prevent default for our shortcuts
      if (['Space', '1', '2', '3', '4', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Space') {
        if (!showAnswer) {
          setShowAnswer(true);
        }
      } else if (e.key === '1' && showAnswer && !submitting) {
        handleGrade('again');
      } else if (e.key === '2' && showAnswer && !submitting) {
        handleGrade('hard');
      } else if (e.key === '3' && showAnswer && !submitting) {
        handleGrade('good');
      } else if (e.key === '4' && showAnswer && !submitting) {
        handleGrade('easy');
      } else if (e.key === 'ArrowLeft' && lastAction) {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, submitting, lastAction, queue]);


  // --- Render ---

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading review queue...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">No cards to review!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You're all caught up. Great job!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full font-medium hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  const cardContent = currentCard!;
  const progress = (sessionStats.total / (sessionStats.total + queue.length + (currentCard ? 0 : 0))) * 100; // rough estimate
  const hasKanji = cardContent.kanji && cardContent.kanji.trim() !== '';
  // Prefer meaning_id (Indonesian), fallback to meaning_en (English) so we always show meaning when available
  const displayMeaning = (cardContent.meaning_id && cardContent.meaning_id.trim()) ? cardContent.meaning_id : (cardContent.meaning_en && cardContent.meaning_en.trim()) ? cardContent.meaning_en : null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl dark:bg-gray-900">
        {/* Local Top Navigation removed - using global HeaderContext */}


        {/* Progress Bar */}
        <div className="px-4 my-4">
          <ProgressBar progress={progress} />
        </div>

        {/* Session Stats Card (Mobile) */}
        {sessionStats.total > 0 && (
          <div className="px-4 mb-4 md:hidden">
            <Card className="p-3 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatSessionTime(Date.now() - sessionStats.startTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {queue.length}
                    </div>
                  </div>
                </div>
                {/* End Session Button */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="End session"
                >
                  <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Question Card */}
        <div className="px-4 mb-4">
          <Card
            ref={cardRef}
            className={`relative transition-all duration-300 dark:bg-gray-800 ${kanaCorrect === true
              ? 'border-2 border-green-500 dark:border-green-500'
              : kanaCorrect === false
                ? 'border-2 border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
              }`}
          >

            {/* Top Row: Hint Button, Difficulty Badge, and Timer */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              {/* Show/Hide Hint Button (Updated) */}
              <button
                onClick={toggleHint}
                className="p-2 rounded-full hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 z-20"
                title="Cycle hints (Kana -> Meaning)"
              >
                {hintState !== 'none' ? (
                  <LightbulbIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                ) : (
                  <LightbulbOffIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
                {hintState !== 'none' && (
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter">
                    {hintState}
                  </span>
                )}
              </button>

              {/* Difficulty Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${cardDifficulty === 'new'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : cardDifficulty === 'learning'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                {cardDifficulty === 'new' ? 'New' : cardDifficulty === 'learning' ? 'Learning' : 'Mastered'}
              </span>

              {/* Review Timer */}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-3 h-3" />
                <span>{formatTime(Math.floor((Date.now() - currentCardStartTime) / 1000))}</span>
              </div>
            </div>

            {/* Tags */}
            {cardContent.tags && cardContent.tags.length > 0 && (
              <div className="absolute top-14 left-4 flex flex-wrap gap-2 max-w-[calc(100%-8rem)] z-0">
                {cardContent.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-center mb-8 mt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                {cardContent.audio_word_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(cardContent.audio_word_url!);
                    }}
                    className="absolute top-14 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20"
                  >
                    <Volume2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {!showAnswer ? (
                <div className="text-center space-y-6 pt-12">
                  {/* Word Display (Question) + Hint directly below */}
                  <div className="space-y-2">
                    {hasKanji ? (
                      <div
                        className="text-6xl font-bold text-gray-900 dark:text-white"
                        style={{ fontFamily: 'serif' }}
                      >
                        {cardContent.kanji}
                      </div>
                    ) : (
                      <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {cardContent.kana}
                      </div>
                    )}
                    {/* Hint text below the word only — does not overlap */}
                    {hintState !== 'none' && (
                      <div className="text-center mt-2">
                        <span className="inline-block bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800/50">
                          {hintState === 'kana' ? cardContent.kana : (displayMeaning ?? '—')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Answer input + buttons: on mobile when keyboard open, stick above keyboard */}
                  {isMobile && keyboardBottomOffset > 0 && (
                    <div aria-hidden className="min-h-[160px]" />
                  )}
                  <div
                    ref={inputBarRef}
                    className={`space-y-3 px-4 md:px-0 ${isMobile && keyboardBottomOffset > 0 ? 'bg-gray-50 dark:bg-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]' : ''}`}
                    style={isMobile && keyboardBottomOffset > 0 ? {
                      position: 'fixed',
                      left: 0,
                      right: 0,
                      bottom: keyboardBottomOffset,
                      zIndex: 50,
                      padding: '12px 16px',
                      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                    } : undefined}
                  >
                    <div className="max-w-md mx-auto space-y-3">
                      <Input
                        ref={inputRef}
                        type="text"
                        label="Kana or meaning"
                        value={kanaInput}
                        onChange={handeInputChange}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        placeholder="かな or meaning"
                        className={`text-center text-lg text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${kanaCorrect === true
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : kanaCorrect === false
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : inputError
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                              : ''
                          }`}
                        disabled={showAnswer || showFeedback}
                      />
                      {inputError && (
                        <div className="text-xs text-red-500 font-medium text-center animate-pulse">
                          {inputError}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 max-w-md mx-auto">
                      <Button
                        onClick={handleSkip}
                        variant="outline"
                        className="px-3"
                        title="Skip card"
                      >
                        <SkipForwardIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={handleAnswerCheck}
                        disabled={showFeedback}
                        className="flex-1"
                      >
                        Show Answer
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 pt-12">
                  {/* Word Display (Answer) */}
                  <div className="space-y-4">
                    {hasKanji ? (
                      <>
                        <div
                          className="text-6xl font-bold mb-4 text-gray-900 dark:text-white"
                          style={{ fontFamily: 'serif' }}
                        >
                          {cardContent.kanji}
                        </div>
                        <div className="text-2xl text-gray-600 dark:text-gray-300">
                          {cardContent.kana}
                        </div>
                      </>
                    ) : (
                      <div className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        {cardContent.kana}
                      </div>
                    )}
                  </div>


                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-2xl text-gray-800 dark:text-white mb-2 font-serif">
                      {displayMeaning ?? 'No meaning available'}
                    </div>
                    {cardContent.meaning_id && cardContent.meaning_en && cardContent.meaning_id.trim() !== cardContent.meaning_en.trim() && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                        {cardContent.meaning_en}
                      </div>
                    )}

                    {/* Example Sentence Section */}
                    {cardContent.example_sentence_ja && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-left">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Example</div>
                        <div className="text-lg text-gray-800 dark:text-gray-200 font-serif mb-2 leading-relaxed">
                          {cardContent.example_sentence_ja}
                        </div>
                        {cardContent.example_sentence_id && (
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none list-none select-none">
                              <span className="group-open:hidden">Show translation</span>
                              <span className="hidden group-open:inline">Hide translation</span>
                            </summary>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic animate-in slide-in-from-top-1 fade-in">
                              {cardContent.example_sentence_id}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mnemonic Display */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Mnemonic:</div>
                      <div className="flex items-center gap-2">
                        {!editingMnemonic && (
                          <>
                            <button
                              onClick={generateMnemonic}
                              disabled={generatingMnemonic}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                              title="Generate mnemonic with AI"
                            >
                              {generatingMnemonic ? (
                                <LoaderIcon className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                              ) : (
                                <SparklesIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                            {mnemonic && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingMnemonic(true);
                                    setMnemonicContent(mnemonic.content || '');
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Edit mnemonic"
                                >
                                  <EditIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={deleteMnemonic}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete mnemonic"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {editingMnemonic && (
                          <>
                            <button
                              onClick={saveMnemonic}
                              disabled={savingMnemonic}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Save mnemonic"
                            >
                              <SaveIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingMnemonic(false);
                                setMnemonicContent(mnemonic?.content || '');
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Cancel editing"
                            >
                              <XIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingMnemonic ? (
                      <textarea
                        value={mnemonicContent}
                        onChange={(e) => setMnemonicContent(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-y min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder="Type a mnemonic..."
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl italic">
                        {mnemonic ? mnemonic.content : "No mnemonic yet. Create one to help you remember!"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Buttons (1–4) — inside card */}
            {showAnswer && !showFeedback && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 px-4 pb-2">
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleGrade('again')}
                    disabled={submitting}
                    className="group flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Again (1)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tabular-nums group-hover:scale-105 transition-transform">1</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-red-600/90 dark:text-red-400/90 uppercase tracking-wide mt-0.5">Again</span>
                  </button>

                  <button
                    onClick={() => handleGrade('hard')}
                    disabled={submitting}
                    className="group flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-300 dark:hover:border-orange-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Hard (2)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums group-hover:scale-105 transition-transform">2</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-orange-600/90 dark:text-orange-400/90 uppercase tracking-wide mt-0.5">Hard</span>
                  </button>

                  <button
                    onClick={() => handleGrade('good')}
                    disabled={submitting}
                    className="group flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Good (3)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums group-hover:scale-105 transition-transform">3</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-blue-600/90 dark:text-blue-400/90 uppercase tracking-wide mt-0.5">Good</span>
                  </button>

                  <button
                    onClick={() => handleGrade('easy')}
                    disabled={submitting}
                    className="group flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Easy (4)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums group-hover:scale-105 transition-transform">4</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90 uppercase tracking-wide mt-0.5">Easy</span>
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

