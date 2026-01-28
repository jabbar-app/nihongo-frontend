'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LightbulbIcon, LightbulbOffIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, Volume2Icon, MenuIcon, UndoIcon, SkipForwardIcon, ClockIcon, TrendingUpIcon, XIcon, EditIcon, TrashIcon, SparklesIcon, SaveIcon, LoaderIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
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

interface Card {
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

interface ReviewQueue {
  cards: (Card | { card: Card })[];
}

export default function ReviewPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showKana, setShowKana] = useState(false);
  const [kanaInput, setKanaInput] = useState('');
  const [kanaCorrect, setKanaCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
  const [similarCards, setSimilarCards] = useState<Card[]>([]);
  const [showFurigana, setShowFurigana] = useState(false);
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [mnemonicContent, setMnemonicContent] = useState('');
  const [generatingMnemonic, setGeneratingMnemonic] = useState(false);
  const [savingMnemonic, setSavingMnemonic] = useState(false);
  const [lastAction, setLastAction] = useState<{cardId: number, grade: string, index: number} | null>(null);
  const [skippedCards, setSkippedCards] = useState<number[]>([]);
  const [reviewStreak, setReviewStreak] = useState(0);

  // Helper to get card from queue item (handles both flat and nested structures)
  const getCard = (item: Card | { card: Card }): Card => {
    return 'card' in item ? item.card : item;
  };

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

    const fetchQueue = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/review/queue`, {
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
          throw new Error('Failed to load review queue');
        }

        const data = await response.json();
        // Normalize the cards array - handle both flat and nested structures
        const normalizedCards = data.cards?.map((item: any) => {
          if (item.id) return item;
          if (item.card) return item.card;
          return item;
        }) || [];

        setQueue({ cards: normalizedCards });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [router]);

  // Fetch review streak from dashboard
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
          // Calculate streak from chartData
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
        // Silently fail
      }
    };

    fetchStreak();
  }, []);

  // Reset state when moving to next card
  useEffect(() => {
    if (queue && queue.cards[currentIndex]) {
      setShowAnswer(false);
      setShowKana(false);
      setKanaInput('');
      setKanaCorrect(null);
      setShowFeedback(false);
      setCurrentCardStartTime(Date.now());
      setMnemonic(null);
      setSimilarCards([]);
      setShowFurigana(false);
      setEditingMnemonic(false);
      setMnemonicContent('');

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, queue]);

  // Fetch mnemonic and similar cards when answer is shown
  useEffect(() => {
    if (showAnswer && queue && queue.cards[currentIndex]) {
      const card = getCard(queue.cards[currentIndex]);
      fetchMnemonic(card.id);
      fetchSimilarCards(card.id);
    }
  }, [showAnswer, currentIndex, queue]);

  // Calculate card difficulty
  useEffect(() => {
    if (queue && queue.cards[currentIndex]) {
      const card = getCard(queue.cards[currentIndex]);
      const userCard = card.user_card;

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
  }, [currentIndex, queue]);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(patterns[type]);
    }
  };


  const handleKanaCheck = () => {
    if (!queue || !queue.cards[currentIndex]) return;
    const card = getCard(queue.cards[currentIndex]);
    const hasKanji = card.kanji && card.kanji.trim() !== '';

    // If card has kanji and user has input, check the answer first
    if (hasKanji && kanaInput.trim()) {
      const normalized = kanaInput.trim().toLowerCase();
      const correct = normalized === card.kana.toLowerCase();

      setKanaCorrect(correct);
      setShowFeedback(true);

      // Haptic feedback
      if (correct) {
        triggerHaptic('light');
      } else {
        triggerHaptic('medium');
      }

      // Show answer after feedback (for both correct and incorrect)
      setTimeout(() => {
        setShowAnswer(true);
        setShowFeedback(false);
      }, 1500);
    } else if (!hasKanji) {
      // If no kanji, just show the answer directly
      setShowAnswer(true);
    }
    // If has kanji but no input, do nothing (button should be disabled)
  };

  // Auto-check when input matches the kana (only if not already checked)
  useEffect(() => {
    if (!queue || !queue.cards[currentIndex] || kanaCorrect !== null || showFeedback || !kanaInput.trim()) return;
    const card = getCard(queue.cards[currentIndex]);
    const hasKanji = card.kanji && card.kanji.trim() !== '';
    if (!hasKanji) return;

    const normalized = kanaInput.trim().toLowerCase();
    const cardKana = card.kana.toLowerCase();

    if (normalized === cardKana) {
      setKanaCorrect(true);
      setShowFeedback(true);
      setTimeout(() => {
        setShowAnswer(true);
        setShowFeedback(false);
      }, 1500);
    }
  }, [kanaInput, currentIndex, queue, kanaCorrect, showFeedback]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleKanaCheck();
    }
  };

  // Fetch mnemonic for current card
  const fetchMnemonic = async (cardId: number) => {
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
        // No mnemonic exists yet
        setMnemonic(null);
        setMnemonicContent('');
      }
    } catch (err) {
      // Silently fail
    }
  };

  // Generate mnemonic with AI
  const generateMnemonic = async () => {
    if (!queue || !queue.cards[currentIndex]) return;
    const card = getCard(queue.cards[currentIndex]);

    setGeneratingMnemonic(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/cards/${card.id}/mnemonic/generate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns { mnemonics: [...] } where mnemonics is an array of strings
        if (data.mnemonics && data.mnemonics.length > 0) {
          // Use the first generated mnemonic
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
  };

  // Save mnemonic (create or update)
  const saveMnemonic = async () => {
    if (!queue || !queue.cards[currentIndex] || !mnemonicContent.trim()) return;
    const card = getCard(queue.cards[currentIndex]);

    setSavingMnemonic(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      let response;
      if (mnemonic && mnemonic.id) {
        // Update existing mnemonic
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
        // Create new mnemonic
        response = await fetch(`${apiUrl}/api/v1/cards/${card.id}/mnemonic`, {
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
        // Refresh the mnemonic to get the latest version
        fetchMnemonic(card.id);
      }
    } catch (err) {
      console.error('Failed to save mnemonic:', err);
    } finally {
      setSavingMnemonic(false);
    }
  };

  // Delete mnemonic
  const deleteMnemonic = async () => {
    if (!queue || !queue.cards[currentIndex] || !mnemonic || !mnemonic.id) return;

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
  };

  // Fetch similar cards
  const fetchSimilarCards = async (cardId: number) => {
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
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  // Format session time
  const formatSessionTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Undo last action
  const handleUndo = () => {
    if (!lastAction) return;

    setCurrentIndex(lastAction.index);
    setLastAction(null);
    setShowAnswer(false);
    setKanaInput('');
    setKanaCorrect(null);
    setShowFeedback(false);

    // Revert session stats
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct - (lastAction.grade === 'good' || lastAction.grade === 'easy' ? 1 : 0),
      incorrect: prev.incorrect - (lastAction.grade === 'again' ? 1 : 0),
      total: prev.total - 1,
    }));
  };

  // Skip card
  const handleSkip = () => {
    if (!queue || !queue.cards[currentIndex]) return;
    const card = getCard(queue.cards[currentIndex]);

    setSkippedCards([...skippedCards, card.id]);

    // Move to next card
    if (currentIndex < queue.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/dashboard');
    }
  };


  const handleGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!queue || !queue.cards[currentIndex]) return;

    setSubmitting(true);
    const card = getCard(queue.cards[currentIndex]);
    const cardTime = Math.floor((Date.now() - currentCardStartTime) / 1000);
    const startTime = Date.now();

    // Store action for undo
    setLastAction({
      cardId: card.id,
      grade,
      index: currentIndex,
    });

    // Update session stats
    const wasCorrect = grade === 'good' || grade === 'easy';
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (grade === 'again' ? 1 : 0),
      total: prev.total + 1,
      cardTimes: [...prev.cardTimes, cardTime],
    }));

    // Haptic feedback
    triggerHaptic('medium');

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const responseTime = Date.now() - startTime;

      const response = await fetch(`${apiUrl}/api/v1/review/${card.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          grade,
          was_correct: wasCorrect,
          response_time_ms: responseTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Move to next card
      if (currentIndex < queue.cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        triggerHaptic('light');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts
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
  }, [showAnswer, submitting, lastAction, queue, currentIndex]);

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Handle audio play errors silently
    });
  };

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

  if (!queue || queue.cards.length === 0) {
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

  const currentCard = getCard(queue.cards[currentIndex]);
  const progress = ((currentIndex + 1) / queue.cards.length) * 100;
  const hasKanji = currentCard.kanji && currentCard.kanji.trim() !== '';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl dark:bg-gray-900">
        {/* Top Navigation */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-3 flex-1 justify-center">
            {/* Session Stats */}
            {sessionStats.total > 0 && (
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
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {currentIndex + 1}/{queue.cards.length}
            </div>
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
                      {queue.cards.length - currentIndex}
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
            className={`relative transition-all duration-300 dark:bg-gray-800 ${
              kanaCorrect === true
                ? 'border-2 border-green-500 dark:border-green-500'
                : kanaCorrect === false
                ? 'border-2 border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Top Row: Hint Button, Difficulty Badge, and Timer */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              {/* Show/Hide Kana Button */}
              {hasKanji ? (
                <button
                  onClick={() => setShowKana(!showKana)}
                  className="p-2 rounded-full hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                  title={showKana ? "Hide reading hint" : "Show reading hint (kana)"}
                >
                  {showKana ? (
                    <LightbulbOffIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <LightbulbIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  )}
                </button>
              ) : (
                <div></div>
              )}

              {/* Difficulty Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                cardDifficulty === 'new'
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

            {/* Tags Display */}
            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-1 z-10">
                {currentCard.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Speaker Icon - Top right */}
            {currentCard.audio_word_url && (
              <button
                onClick={() => playAudio(currentCard.audio_word_url!)}
                className="absolute top-14 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Volume2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {!showAnswer ? (
              <div className="text-center space-y-6 pt-12">
                {/* Word Display */}
                <div className="space-y-4">
                  {hasKanji ? (
                    <>
                      <div className="text-6xl font-bold mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'serif' }}>
                        {currentCard.kanji}
                      </div>
                      {showKana && (
                        <div className="text-2xl text-gray-500 dark:text-gray-400">
                          {currentCard.kana}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-6xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'serif' }}>
                      {currentCard.kana}
                    </div>
                  )}
                </div>

                {/* Kana Input (always show if card has kanji) */}
                {hasKanji && (
                  <div className="space-y-3">
                    <Input
                      ref={inputRef}
                      type="text"
                      label="Type the reading (kana):"
                      value={kanaInput}
                      onChange={(e) => {
                        setKanaInput(e.target.value);
                        setKanaCorrect(null);
                        setShowFeedback(false);
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="かなを入力"
                      className={`text-center text-lg text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${kanaCorrect === true
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : kanaCorrect === false
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : ''
                        }`}
                      disabled={showAnswer || showFeedback}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="px-3"
                    title="Skip card"
                  >
                    <SkipForwardIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleKanaCheck}
                    disabled={hasKanji && !kanaInput.trim() || showAnswer || showFeedback}
                    className="flex-1"
                  >
                    Show Answer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 pt-12">
                {/* Word Display */}
                <div className="space-y-4">
                  {hasKanji ? (
                    <>
                      <div className="text-6xl font-bold mb-2 text-gray-900 dark:text-white" style={{ fontFamily: 'serif' }}>
                        {currentCard.kanji}
                      </div>
                      <div className="text-2xl text-gray-500 dark:text-gray-400">
                        {currentCard.kana}
                      </div>
                    </>
                  ) : (
                    <div className="text-6xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'serif' }}>
                      {currentCard.kana}
                    </div>
                  )}
                </div>

                {/* Meaning */}
                <div className="space-y-2">
                  <div className="font-semibold text-xl text-gray-900 dark:text-white">{currentCard.meaning_id}</div>
                  {currentCard.meaning_en && (
                    <div className="text-gray-500 dark:text-gray-400">{currentCard.meaning_en}</div>
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
                            disabled={!mnemonicContent.trim() || savingMnemonic}
                            className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                            title="Save mnemonic"
                          >
                            {savingMnemonic ? (
                              <LoaderIcon className="w-4 h-4 animate-spin text-green-600 dark:text-green-400" />
                            ) : (
                              <SaveIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
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
                    <div className="space-y-2">
                      <textarea
                        value={mnemonicContent}
                        onChange={(e) => setMnemonicContent(e.target.value)}
                        placeholder="Enter your mnemonic..."
                        className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                        rows={4}
                        maxLength={1000}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        {mnemonicContent.length}/1000
                      </div>
                    </div>
                  ) : mnemonic ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      {mnemonic.content}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      No mnemonic yet. Click the sparkle icon to generate one with AI.
                    </div>
                  )}
                </div>

                {/* Example Sentence */}
                {(currentCard.example_sentence_ja || currentCard.example_sentence_id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <button
                        onClick={() => setShowFurigana(!showFurigana)}
                        className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Toggle furigana"
                      >
                        {showFurigana ? 'Hide' : 'Show'} Furigana
                      </button>
                      {currentCard.audio_sentence_url && (
                        <button
                          onClick={() => playAudio(currentCard.audio_sentence_url!)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Play sentence audio"
                        >
                          <Volume2Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                    {currentCard.example_sentence_ja && (
                      <div className="text-base text-gray-700 dark:text-gray-300">
                        {showFurigana ? (
                          <ruby>
                            {currentCard.example_sentence_ja.split('').map((char, idx) => {
                              // Simple furigana: show kana above kanji
                              // This is a basic implementation - for full furigana, a library would be better
                              if (/[\u4e00-\u9faf]/.test(char)) {
                                // Kanji character - try to find corresponding kana from the word
                                return (
                                  <ruby key={idx}>
                                    {char}
                                    <rt className="text-xs text-gray-500 dark:text-gray-400">
                                      {/* Placeholder - would need proper furigana data */}
                                    </rt>
                                  </ruby>
                                );
                              }
                              return <span key={idx}>{char}</span>;
                            })}
                          </ruby>
                        ) : (
                          currentCard.example_sentence_ja
                        )}
                      </div>
                    )}
                    {currentCard.example_sentence_id && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentCard.example_sentence_id}
                      </div>
                    )}
                  </div>
                )}

                {/* Similar Cards */}
                {similarCards.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Similar Cards:</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {similarCards.slice(0, 3).map((card) => (
                        <div
                          key={card.id}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                        >
                          {card.kanji || card.kana} - {card.meaning_id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Buttons - 4 Levels */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <Button
                    onClick={() => handleGrade('again')}
                    disabled={submitting}
                    variant="danger"
                    className="text-lg"
                    title="Again (1)"
                  >
                    一
                  </Button>
                  <Button
                    onClick={() => handleGrade('hard')}
                    disabled={submitting}
                    variant="outline"
                    className="text-lg border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    title="Hard (2)"
                  >
                    二
                  </Button>
                  <Button
                    onClick={() => handleGrade('good')}
                    disabled={submitting}
                    variant="success"
                    className="text-lg"
                    title="Good (3)"
                  >
                    三
                  </Button>
                  <Button
                    onClick={() => handleGrade('easy')}
                    disabled={submitting}
                    variant="primary"
                    className="text-lg bg-blue-600 hover:bg-blue-700"
                    title="Easy (4)"
                  >
                    四
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Feedback Card */}
        {showFeedback && kanaCorrect !== null && (
          <div className="px-4 mb-4">
            <Card className={`dark:bg-gray-800 dark:border-gray-700 ${kanaCorrect
                ? 'bg-green-50 border-2 border-green-500 dark:bg-green-900/20'
                : 'bg-red-50 border-2 border-red-500 dark:bg-red-900/20'
              }`}>
              <div className="flex items-center gap-3 mb-2">
                {kanaCorrect ? (
                  <>
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="font-semibold text-green-700 dark:text-green-300 text-lg">Correct!</div>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="font-semibold text-red-700 dark:text-red-300 text-lg">Incorrect</div>
                  </>
                )}
              </div>
              {kanaCorrect && (
                <div className="text-sm text-green-700 dark:text-green-300">
                  {currentCard.kanji || currentCard.kana} ({currentCard.kana}) means {currentCard.meaning_id}
                </div>
              )}
              {!kanaCorrect && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  Try again or click "Show Answer" above.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
