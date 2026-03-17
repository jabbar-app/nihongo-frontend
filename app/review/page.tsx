'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LightbulbIcon, LightbulbOffIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, Volume2Icon, MenuIcon, UndoIcon, SkipForwardIcon, ClockIcon, TrendingUpIcon, XIcon, EditIcon, TrashIcon, SparklesIcon, SaveIcon, LoaderIcon, PencilIcon, BookOpenIcon, EyeIcon, EyeOffIcon, LanguagesIcon, RotateCcwIcon, SendIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import Card from "@/components/ui/card";
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from "@/components/ui/input";
import ProgressBar from "@/components/ui/progress-bar";
import MobileSidebar from '@/components/mobile-sidebar';
import CardEditModal from '@/components/card-edit-modal';
import ConfirmModal from '@/components/confirm-modal';
import SmartDictionaryFAB from '@/components/smart-dictionary-fab';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { API_CONSTANTS } from '@/constants/api';

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
  example_sentence_en: string | null;
  practice_sentences?: {
    id: number;
    ja: string;
    ja_annotated: string | null;
    id_translation: string | null;
    en_translation: string | null;
    explanation?: string | null;
  }[];
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
  const [deckId, setDeckId] = useState<string | null>(null);
  
  // Get deck ID from search params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setDeckId(searchParams.get('deck_id'));
  }, []);
  const [queue, setQueue] = useState<CardContent[] | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('reviewQueue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[ReviewPage] useState: Failed to parse saved queue', e);
      }
    }
    return null;
  });
  const [currentCard, setCurrentCard] = useState<CardContent | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('reviewCurrentCard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[ReviewPage] useState: Failed to parse saved currentCard', e);
      }
    }
    return null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExampleSentence, setShowExampleSentence] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [hintState, setHintState] = useState<'none' | 'kana' | 'meaning'>('none');
  const [hintScope, setHintScope] = useState<'this_only' | 'rest_of_session'>('this_only');
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [kanaInput, setKanaInput] = useState('');
  const [kanaCorrect, setKanaCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(''); // New state for input validation
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [editingCard, setEditingCard] = useState<any>(null);

  // --- New states for Flash Practice and End-of-Session Quiz ---
  const [activeFlashPractice, setActiveFlashPractice] = useState<{
    card: CardContent;
    remainingModalities: ('reading' | 'meaning' | 'kanji')[];
    currentModality: 'reading' | 'meaning' | 'kanji';
  } | null>(null);
  const [flashPracticeInput, setFlashPracticeInput] = useState('');
  const [flashPracticeCorrect, setFlashPracticeCorrect] = useState<boolean | null>(null);
  const [flashPracticeFeedback, setFlashPracticeFeedback] = useState(false);
  const flashPracticeInputRef = useRef<HTMLInputElement>(null);

  const [missedCardsForQuiz, setMissedCardsForQuiz] = useState<CardContent[]>([]);
  const [showEndSessionQuiz, setShowEndSessionQuiz] = useState(false);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<{
    card: CardContent;
    options: string[];
    answerIndex: number;
    questionType: 'meaning' | 'reading';
    selectedAnswer: number | null;
    isCorrect: boolean | null;
  }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const kanaMatchesCard = (input: string, card: CardContent): boolean => {
    const normalize = (text: string) => text.toLowerCase().replace(/[\s\-\.\(\)]/g, '');
    const nInput = normalize(input);
    if (!nInput) return false;

    if (nInput === normalize(card.kana)) return true;

    const candidates = card.kana.split(/[,、/・]/).map(normalize).filter(s => s.length > 0);
    return candidates.includes(nInput);
  };

  const meaningMatchesCard = (input: string, card: CardContent): boolean => {
    const normalize = (text: string) => text.toLowerCase().trim();
    const nInput = normalize(input);
    if (!nInput) return false;

    const checkMeanings = (text: string | null) => {
      if (!text) return false;
      // Split by /, (, ), comma, semicolon, Japanese comma
      // This allows "pagi (AM)" -> ["pagi", "am"]
      // "siang/sore" -> ["siang", "sore"]
      // "to eat, to feed" -> ["to eat", "to feed"]
      const candidates = text.split(/[/()、,;]/).map(normalize).filter(s => s.length > 0);
      return candidates.some(c => c === nInput);
    };

    return checkMeanings(card.meaning_id) || checkMeanings(card.meaning_en);
  };

  const handeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKanaInput(value);
    if (inputError) setInputError('');
  };

  const applyHintAndClose = () => {
    setHintModalOpen(false);
  };

  // --- Quiz Logic ---
  const generateQuizQuestions = useCallback(() => {
    if (!missedCardsForQuiz.length) return;

    // We need distractors. We'll use the current queue, similarCards, or whatever we have.
    // Ideally, we have a pool of all cards seen this session. 
    // `sessionStats` doesn't store cards, so we just use `queue` (which might be empty now) 
    // plus `missedCardsForQuiz` itself to cross-pollinate distractors.
    const distractorPool = [...missedCardsForQuiz]; 
    if (queue) {
      distractorPool.push(...queue);
    }

    const questions = missedCardsForQuiz.map(card => {
      // 50/50 chance for meaning or reading question, if reading is possible
      const hasKanji = card.kanji && card.kanji.trim() !== '';
      const questionType: 'meaning' | 'reading' = (hasKanji && Math.random() > 0.5) ? 'reading' : 'meaning';

      let correctText = '';
      if (questionType === 'meaning') {
        correctText = card.meaning_id || card.meaning_en || '';
      } else {
        correctText = card.kana;
      }

      // Find 3 unique distractors
      const distractors = new Set<string>();
      
      // Shuffle pool
      const pool = [...distractorPool].sort(() => 0.5 - Math.random());
      
      for (const pCard of pool) {
        if (distractors.size >= 3) break;
        if (pCard.id === card.id) continue;

        let dText = '';
        if (questionType === 'meaning') {
          dText = pCard.meaning_id || pCard.meaning_en || '';
        } else {
          dText = pCard.kana;
        }

        if (dText && dText !== correctText && !distractors.has(dText)) {
          distractors.add(dText);
        }
      }

      // If we couldn't find 3 real distractors (unlikely unless DB is tiny), pad with generics
      while (distractors.size < 3) {
        const dummy = `Distractor ${distractors.size + 1}`;
        if (!distractors.has(dummy) && dummy !== correctText) {
          distractors.add(dummy);
        }
      }

      const options = [correctText, ...Array.from(distractors)];
      // Shuffle options
      options.sort(() => 0.5 - Math.random());
      const answerIndex = options.indexOf(correctText);

      return {
        card,
        options,
        answerIndex,
        questionType,
        selectedAnswer: null,
        isCorrect: null,
      };
    });

    setQuizQuestions(questions);
  }, [missedCardsForQuiz, queue]);

  const handleQuizAnswer = (index: number) => {
    const questions = [...quizQuestions];
    const currentQ = questions[quizCurrentIndex];
    
    if (currentQ.selectedAnswer !== null) return; // Already answered

    const isCorrect = index === currentQ.answerIndex;
    currentQ.selectedAnswer = index;
    currentQ.isCorrect = isCorrect;
    
    setQuizQuestions(questions);
    triggerHaptic(isCorrect ? 'light' : 'medium');
    
    setTimeout(() => {
      if (quizCurrentIndex < questions.length - 1) {
        setQuizCurrentIndex(quizCurrentIndex + 1);
      } else {
        // Quiz finished
        setShowEndSessionQuiz(false);
        setMissedCardsForQuiz([]); // Clear for next batch
      }
    }, 1500);
  };


  // Session statistics - persisted to sessionStorage
  const [sessionStats, setSessionStats] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        correct: 0,
        incorrect: 0,
        total: 0,
        startTime: Date.now(),
        cardTimes: [] as number[]
      };
    }
    const saved = sessionStorage.getItem('reviewSessionStats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[ReviewPage] useState: Failed to parse saved sessionStats', e);
      }
    }
    return {
      correct: 0,
      incorrect: 0,
      total: 0,
      startTime: Date.now(),
      cardTimes: [] as number[]
    };
  });

  // Persist session stats to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('reviewSessionStats', JSON.stringify(sessionStats));
  }, [sessionStats]);

  // Card tracking
  const [currentCardStartTime, setCurrentCardStartTime] = useState(Date.now());
  const [cardDifficulty, setCardDifficulty] = useState<'new' | 'learning' | 'mastered'>('new');
  const [mnemonic, setMnemonic] = useState<any>(null);
  const [similarCards, setSimilarCards] = useState<CardContent[]>([]);
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [mnemonicContent, setMnemonicContent] = useState('');
  const [generatingMnemonic, setGeneratingMnemonic] = useState(false);
  const [savingMnemonic, setSavingMnemonic] = useState(false);
  const [lastAction, setLastAction] = useState<{ cardId: number, grade: string, reviewId: number } | null>(null);
  const [skippedCards, setSkippedCards] = useState<number[]>([]);
  const [reviewStreak, setReviewStreak] = useState(0);
  const [masteringCard, setMasteringCard] = useState(false);
  const [showMasterConfirm, setShowMasterConfirm] = useState(false);
  
  const [activeMnemonicOverlay, setActiveMnemonicOverlay] = useState<{
    card: CardContent;
    mnemonic: any;
    currentMode: 'pre_flash' | 'post_flash';
    originalGrade: 'again' | 'hard';
    flashPracticeData?: {
      remainingModalities: ('reading' | 'meaning' | 'kanji')[];
      currentModality: 'reading' | 'meaning' | 'kanji';
    };
  } | null>(null);

  const [mnemonicImageFile, setMnemonicImageFile] = useState<File | null>(null);
  const [mnemonicImagePreview, setMnemonicImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMnemonicImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMnemonicImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setMnemonicImageFile(null);
    setMnemonicImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

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

    const correct = kanaMatchesCard(trimmed, cardContent) || meaningMatchesCard(trimmed, cardContent);

    setKanaCorrect(correct);
    setShowFeedback(true);
    if (correct) triggerHaptic('light');
    else triggerHaptic('medium');

    setTimeout(() => {
      setShowAnswer(true);
      setShowFeedback(false);
    }, 1500);
  }

  function handleFlashPracticeSubmit() {
    if (!activeFlashPractice) return;
    const { card, currentModality } = activeFlashPractice;
    const trimmed = flashPracticeInput.trim();

    if (!trimmed) return;

    let correct = false;
    if (currentModality === 'reading') {
      correct = kanaMatchesCard(trimmed, card);
    } else if (currentModality === 'meaning') {
      correct = meaningMatchesCard(trimmed, card);
    } else if (currentModality === 'kanji') {
      // Very simple string match for kanji
      const normalize = (text: string) => text.replace(/[\s\-\.\(\)]/g, '');
      correct = card.kanji ? normalize(trimmed) === normalize(card.kanji) : false;
      // If the card doesn't have kanji, but we somehow asked for it, we should fallback
      // Since we check `hasKanji` when setting modalities, this shouldn't happen, but just in case:
      if (!card.kanji) correct = kanaMatchesCard(trimmed, card);
    }

    setFlashPracticeCorrect(correct);
    setFlashPracticeFeedback(true);
    triggerHaptic(correct ? 'light' : 'medium');

    setTimeout(() => {
      if (correct) {
        setFlashPracticeInput('');
        setFlashPracticeCorrect(null);
        setFlashPracticeFeedback(false);
        const nextModalities = activeFlashPractice.remainingModalities.filter((_, idx) => idx !== 0);

        if (nextModalities.length > 0) {
          setActiveFlashPractice({
            ...activeFlashPractice,
            remainingModalities: nextModalities,
            currentModality: nextModalities[0]
          });
          // Focus input after state update
          setTimeout(() => {
            flashPracticeInputRef.current?.focus();
          }, 50);
        } else {
          // Finished flash practice! 
          // If grade was 'again', show mnemonic one more time BEFORE advancing queue
          if (activeFlashPractice.card.id === activeMnemonicOverlay?.card.id && activeMnemonicOverlay?.originalGrade === 'again' && mnemonic && mnemonic.image_url) {
             setActiveFlashPractice(null);
             setActiveMnemonicOverlay({
               ...activeMnemonicOverlay,
               currentMode: 'post_flash',
               flashPracticeData: undefined
             });
          } else {
            setActiveFlashPractice(null);
            setActiveMnemonicOverlay(null);
            
            const nextQueue = queue ? queue.slice(1) : [];
            setQueue(nextQueue);
            if (nextQueue.length > 0) {
              setCurrentCard(nextQueue[0]);
              triggerHaptic('light');
            }
          }
        }
      } else {
        // Incorrect, let them see the red feedback and try again
        setTimeout(() => {
          setFlashPracticeCorrect(null);
          setFlashPracticeFeedback(false);
          setFlashPracticeInput('');
          flashPracticeInputRef.current?.focus();
        }, 800);
      }
    }, 800);
  }

  function handleFlashPracticeKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFlashPracticeSubmit();
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnswerCheck();
    }
  }

  const handleMnemonicOverlayContinue = () => {
    if (!activeMnemonicOverlay) return;

    if (activeMnemonicOverlay.currentMode === 'pre_flash' && activeMnemonicOverlay.flashPracticeData) {
      setActiveFlashPractice({
        card: activeMnemonicOverlay.card,
        ...activeMnemonicOverlay.flashPracticeData
      });
      // Keep overlay in state but hidden? Better to just transition.
    } else {
      // post_flash or no data
      const nextQueue = queue ? queue.slice(1) : [];
      setQueue(nextQueue);
      if (nextQueue.length > 0) {
        setCurrentCard(nextQueue[0]);
        triggerHaptic('light');
      }
    }
    setActiveMnemonicOverlay(null);
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Handle audio play errors silently
    });
  };

  async function fetchMnemonic(cardId: number) {
    if (!cardId || typeof cardId !== 'number') {
      return;
    }
    
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
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
    
    // Validate that currentCard.id is a valid number
    if (!currentCard.id || typeof currentCard.id !== 'number') {
      return;
    }
    
    const cardContent = currentCard;

    setGeneratingMnemonic(true);
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/cards/${cardContent.id}/mnemonic/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Return only text suggestions - let user pick or edit
        if (data.mnemonics && data.mnemonics.length > 0) {
          setMnemonicContent(data.mnemonics[0]);
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
    
    // Validate that currentCard.id is a valid number
    if (!currentCard.id || typeof currentCard.id !== 'number') {
      return;
    }
    
    const cardContent = currentCard;

    setSavingMnemonic(true);
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;

      const formData = new FormData();
      formData.append('content', mnemonicContent.trim());
      if (mnemonicImageFile) {
        formData.append('image', mnemonicImageFile);
      }

      let response;
      if (mnemonic && mnemonic.id) {
        // Laravel spoof PUT for multipart/form-data
        formData.append('_method', 'PUT');
        response = await fetch(`${apiUrl}/api/v1/mnemonics/${mnemonic.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });
      } else {
        formData.append('type', 'custom');
        response = await fetch(`${apiUrl}/api/v1/cards/${cardContent.id}/mnemonic`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });
      }

      if (response.ok) {
        const data = await response.json();
        setMnemonic(data);
        setEditingMnemonic(false);
        clearImage();
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
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
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
    if (!cardId || typeof cardId !== 'number') {
      return;
    }
    
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
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

    setSessionStats((prev: typeof sessionStats) => ({
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
      // Queue empty - summary will show
    }
  }

  async function handleGrade(grade: 'again' | 'hard' | 'good' | 'easy') {
    if (!queue || !currentCard) return;
    
    // Validate that currentCard.id is a valid number
    if (!currentCard.id || typeof currentCard.id !== 'number') {
      setError('Invalid card ID');
      return;
    }

    setSubmitting(true);
    const cardContent = currentCard;
    const cardTime = Math.floor((Date.now() - currentCardStartTime) / 1000);

    setLastAction({
      cardId: cardContent.id,
      grade,
      reviewId: currentCard.id,
    });

    const wasCorrect = grade === 'good' || grade === 'easy';
    setSessionStats((prev: typeof sessionStats) => {
      const newStats = {
        ...prev,
        correct: prev.correct + (wasCorrect ? 1 : 0),
        incorrect: prev.incorrect + (grade === 'again' ? 1 : 0),
        total: prev.total + 1,
        cardTimes: [...prev.cardTimes, cardTime],
      };
      return newStats;
    });

    triggerHaptic('medium');

    try {
      const cardId = String(currentCard.id);
      await api.post(`/api/v1/review/${cardId}`, {
        grade: grade,
        was_correct: wasCorrect,
        response_time_ms: cardTime * 1000,
      });

      // Special handling for missed cards
      if (grade === 'again' || grade === 'hard') {
        const hasKanji = cardContent.kanji && cardContent.kanji.trim() !== '';
        // Add to quiz list if not already there
        if (!missedCardsForQuiz.some(c => c.id === cardContent.id)) {
          setMissedCardsForQuiz(prev => [...prev, cardContent]);
        }

        const possibleModalities: ('reading' | 'meaning' | 'kanji')[] = hasKanji 
          ? ['reading', 'meaning', 'kanji'] 
          : ['reading', 'meaning'];

        // Shuffle modalities
        const shuffled = [...possibleModalities].sort(() => 0.5 - Math.random());
        
        // Determine required modalities based on grade
        let requiredModalities: ('reading' | 'meaning' | 'kanji')[];
        if (grade === 'again') {
          // Again (1): All modalities
          requiredModalities = shuffled;
        } else if (grade === 'hard') {
          // Hard (2): 2 modalities
          requiredModalities = shuffled.slice(0, 2);
        } else {
          // Good (3) and Easy (4): 1 modality
          requiredModalities = [shuffled[0]];
        }

        const flashData = {
          remainingModalities: requiredModalities,
          currentModality: requiredModalities[0]
        };

        // If card has a mnemonic with an image, show it BEFORE flash practice
        if (mnemonic && mnemonic.image_url) {
          setActiveMnemonicOverlay({
            card: cardContent,
            mnemonic: mnemonic,
            currentMode: 'pre_flash',
            originalGrade: grade,
            flashPracticeData: flashData
          });
        } else {
          setActiveFlashPractice({
            card: cardContent,
            ...flashData
          });
        }
        
        // We do NOT immediately advance the queue. 
        // We wait for flash practice to finish before `setQueue(nextQueue)`
        return;
      }

      const nextQueue = queue.slice(1);
      setQueue(nextQueue);
      if (nextQueue.length > 0) {
        setCurrentCard(nextQueue[0]);
        triggerHaptic('light');
      } else {
        // Queue empty, component will re-render and show summary screen
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkAsMastered() {
    if (!queue || !currentCard) return;

    setShowMasterConfirm(true);
  }

  async function confirmMarkAsMastered() {
    if (!queue || !currentCard) return;
    
    // Validate that currentCard.id is a valid number
    if (!currentCard.id || typeof currentCard.id !== 'number') {
      setError('Invalid card ID');
      return;
    }

    setShowMasterConfirm(false);

    setMasteringCard(true);
    const cardContent = currentCard;

    try {
      const cardId = String(currentCard.id);
      await api.post(`/api/v1/cards/${cardId}/master`, {});

      // Remove card from queue
      const nextQueue = queue.slice(1);
      setQueue(nextQueue);

      if (nextQueue.length > 0) {
        setCurrentCard(nextQueue[0]);
        setShowAnswer(false);
        setKanaInput('');
        setKanaCorrect(null);
        setShowFeedback(false);
        triggerHaptic('light');
      } else {
        // Queue empty, component will re-render and show summary screen
      }

      // Update session stats
      setSessionStats((prev: typeof sessionStats) => ({
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark card as mastered');
    } finally {
      setMasteringCard(false);
    }
  }

  // --- Effects ---

  // Persist session stats to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentSaved = sessionStorage.getItem('reviewSessionStats');
    const currentValue = JSON.stringify(sessionStats);
    
    // Only save if different from what's already saved
    if (currentSaved !== currentValue) {
      sessionStorage.setItem('reviewSessionStats', currentValue);
    }
  }, [sessionStats]);

  // Persist queue to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (queue) {
      const currentSaved = sessionStorage.getItem('reviewQueue');
      const currentValue = JSON.stringify(queue);
      
      // Only save if different from what's already saved
      if (currentSaved !== currentValue) {
        sessionStorage.setItem('reviewQueue', currentValue);
      }
    }
  }, [queue]);

  // Persist current card to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentCard) {
      const currentSaved = sessionStorage.getItem('reviewCurrentCard');
      const currentValue = JSON.stringify(currentCard);
      
      // Only save if different from what's already saved
      if (currentSaved !== currentValue) {
        sessionStorage.setItem('reviewCurrentCard', currentValue);
      }
    }
  }, [currentCard]);

  // Initial fetch - only fetch if no saved session exists
  useEffect(() => {
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    if (!token) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }

    const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
      }
    }

    // Check if we have a saved session in storage
    const savedQueue = sessionStorage.getItem('reviewQueue');
    const savedCurrentCard = sessionStorage.getItem('reviewCurrentCard');
    
    // If we have saved session data, don't fetch - the restore effect already handled it
    if (savedQueue && savedCurrentCard) {
      setLoading(false);
      return;
    }
    const fetchQueue = async () => {
      try {
        setLoading(true);
        setError('');
        // Increase limit to 20 for "continue" batches
        const url = deckId 
          ? `/api/v1/review/queue?limit=20&deck_id=${deckId}`
          : '/api/v1/review/queue?limit=20';
        const data = await api.get<{ cards: CardContent[] }>(url);

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

    if (token) {
      fetchQueue();
    }

    // expose fetchQueue to be called later
    (window as any).refreshReviewQueue = fetchQueue;
  }, [router, deckId]);

  // Re-fetch queue handler
  const handleContinueSession = async () => {
    try {
      setLoading(true);
      setError('');
      const url = deckId 
        ? `/api/v1/review/queue?limit=20&deck_id=${deckId}`
        : '/api/v1/review/queue?limit=20';
      const data = await api.get<{ cards: CardContent[] }>(url);

      const items = data.cards || [];
      setQueue(items);
      if (items.length > 0) {
        setCurrentCard(items[0]);
      }
      
      // Reset quiz state for the new session
      setShowEndSessionQuiz(false);
      setQuizQuestions([]);
      setQuizCurrentIndex(0);
      setMissedCardsForQuiz([]);
      
      // Reset session stats for the new session
      setSessionStats({
        correct: 0,
        incorrect: 0,
        total: 0,
        cardTimes: [],
        startTime: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Restart Session handler
  const handleRestartSession = async () => {
    // Reset session statistics
    setSessionStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      startTime: Date.now(),
      cardTimes: []
    });

    // Reset streak (optional, but keep it clean)
    // Actually reviewStreak is external, we keep it.

    // Fetch new queue (same as continue)
    await handleContinueSession();
  };

  useEffect(() => {
    const fetchStreak = async () => {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
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
      if (hintScope === 'this_only') setHintState('none');
      setKanaInput('');
      setKanaCorrect(null);
      setShowFeedback(false);
      setCurrentCardStartTime(Date.now());
      setMnemonic(null);
      setSimilarCards([]);
      setEditingMnemonic(false);
      setMnemonicContent('');
      setShowExampleSentence(false);
      setShowMnemonic(false);

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentCard, hintScope]);

  useEffect(() => {
    if (showAnswer && currentCard) {
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
    const correct = kanaMatchesCard(trimmed, cardContent) || meaningMatchesCard(trimmed, cardContent);

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

  // Set header content
  useEffect(() => {
    if (isMobile) {
      setHeaderContent(
        <div className="w-full h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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

  // Auto-focus flash practice input when modality changes
  useEffect(() => {
    if (activeFlashPractice && flashPracticeInputRef.current) {
      setTimeout(() => {
        flashPracticeInputRef.current?.focus();
      }, 0);
    }
  }, [activeFlashPractice?.currentModality]);

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
    if (loading) return null; // Wait for loading state

    // If session stats are 0, it means we just entered the page and there were no cards
    // Or we finished everything.
    const isSessionFinished = sessionStats.total > 0;

    if (isSessionFinished && missedCardsForQuiz.length > 0 && quizQuestions.length === 0 && !showEndSessionQuiz) {
      setShowEndSessionQuiz(true);
      generateQuizQuestions();
      return null; // Brief flash while rendering next
    }

    if (showEndSessionQuiz && quizQuestions.length > 0) {
      const currentQ = quizQuestions[quizCurrentIndex];
      return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <RotateCcwIcon className="w-5 h-5 text-teal-500" />
                Quick Review
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Let's double check the words you missed.
                <br />
                Question {quizCurrentIndex + 1} of {quizQuestions.length}
              </div>
            </div>

            <Card className="p-6 text-center shadow-xl dark:bg-gray-800 dark:border-gray-700">
              <div className="mb-8 mt-4">
                {currentQ.questionType === 'meaning' ? (
                  <div className="text-5xl font-bold font-serif text-gray-900 dark:text-white">
                    {currentQ.card.kanji || currentQ.card.kana}
                  </div>
                ) : (
                  <div className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-2">
                    What is the reading for:
                  </div>
                )}

                {currentQ.questionType === 'reading' ? (
                  <div className="text-5xl font-bold font-serif text-gray-900 dark:text-white">
                    {currentQ.card.kanji || currentQ.card.kana}
                  </div>
                ) : (
                   <div className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
                     {currentQ.card.kanji ? currentQ.card.kana : ''}
                   </div>
                )}
              </div>

              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  let btnColor = 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200';
                  
                  if (currentQ.selectedAnswer !== null) {
                    if (idx === currentQ.answerIndex) {
                      btnColor = 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300';
                    } else if (idx === currentQ.selectedAnswer) {
                      btnColor = 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
                    } else {
                      btnColor = 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={currentQ.selectedAnswer !== null}
                      className={`w-full py-4 px-6 rounded-xl border-2 font-medium transition-all text-left ${btnColor} disabled:cursor-default`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {isSessionFinished ? 'Session Complete!' : 'All Caught Up!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {isSessionFinished
                ? "You've finished your current batch of reviews."
                : "You have no cards due for review right now."}
            </p>

            {/* Stats Summary */}
            {isSessionFinished && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reviews</div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                    {sessionStats.total}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                    {formatSessionTime(Date.now() - sessionStats.startTime)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleContinueSession}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <SparklesIcon className="w-5 h-5" />
                Continue Session
              </button>

              <button
                onClick={handleRestartSession}
                className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcwIcon className="w-5 h-5" />
                Restart Session
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem('reviewSessionStats');
                  sessionStorage.removeItem('reviewQueue');
                  sessionStorage.removeItem('reviewCurrentCard');
                  router.push('/dashboard');
                }}
                className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
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

        {/* Session Stats Card */}
        {sessionStats.total > 0 && (
          <div className="px-4 mb-4">
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
                  onClick={() => {
                    sessionStorage.removeItem('reviewSessionStats');
                    sessionStorage.removeItem('reviewQueue');
                    sessionStorage.removeItem('reviewCurrentCard');
                    router.push('/dashboard');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
              {/* Hint Button — opens modal to choose Kana/Meaning and scope */}
              <button
                onClick={() => setHintModalOpen(true)}
                className="p-2 rounded-full hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 z-20 cursor-pointer"
                title="Hint options"
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
                    className="absolute top-14 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 cursor-pointer"
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

                  {/* Answer input: kana or meaning — scrollable, no stick-to-keyboard */}
                  <div className="space-y-2">
                    {/* Label - visible on all screens */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      Your Answer
                    </label>

                    <Input
                      ref={inputRef}
                      type="text"
                      value={kanaInput}
                      onChange={handeInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="かな or meaning"
                      className={`text-center text-lg sm:text-xl font-medium min-h-[56px] ${kanaCorrect === true
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : kanaCorrect === false
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : inputError
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : ''
                        } dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                      disabled={showAnswer || showFeedback}
                    />

                    {/* Helper text when empty */}
                    {!kanaInput && !inputError && !showAnswer && !showFeedback && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Type in Japanese (kana/kanji) or Indonesian • Press <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
                      </div>
                    )}

                    {inputError && (
                      <div className="text-xs text-red-500 font-medium text-center flex items-center justify-center gap-1">
                        <XCircleIcon className="w-3 h-3" />
                        {inputError}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Responsive Layout */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {/* Primary Action - Full width on mobile, shows first */}
                    <Button
                      onClick={handleAnswerCheck}
                      disabled={showFeedback}
                      className="flex-1 cursor-pointer order-1 sm:order-2 min-h-[48px]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Show Answer
                        <span className="hidden sm:inline text-xs opacity-70">(Enter)</span>
                      </span>
                    </Button>

                    {/* Secondary Action - Full width on mobile, shows second */}
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="cursor-pointer order-2 sm:order-1 sm:w-auto min-h-[48px]"
                      title="Skip this card"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <SkipForwardIcon className="w-4 h-4" />
                        <span className="sm:hidden">Skip Card</span>
                      </span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 pt-12">
                  {/* Word Display (Answer) */}
                  <div className="space-y-4 relative">
                    <button
                      onClick={() => setEditingCard(cardContent)}
                      className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      title="Edit Card"
                    >
                      <PencilIcon className="w-5 h-5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                    </button>
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

                    {/* Example Sentence Section Removed from here */}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Buttons (1–4) — inside card */}
            {showAnswer && !showFeedback && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 px-4 pb-2">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
                  How well did you remember? Choose to continue.
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleGrade('again')}
                    disabled={submitting}
                    className="group cursor-pointer flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Forgot (1)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tabular-nums group-hover:scale-105 transition-transform">1</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-red-600/90 dark:text-red-400/90 uppercase tracking-wide mt-0.5">Forgot</span>
                  </button>

                  <button
                    onClick={() => handleGrade('hard')}
                    disabled={submitting}
                    className="group cursor-pointer flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-300 dark:hover:border-orange-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Hard (2)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums group-hover:scale-105 transition-transform">2</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-orange-600/90 dark:text-orange-400/90 uppercase tracking-wide mt-0.5">Hard</span>
                  </button>

                  <button
                    onClick={() => handleGrade('good')}
                    disabled={submitting}
                    className="group cursor-pointer flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Good (3)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums group-hover:scale-105 transition-transform">3</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-blue-600/90 dark:text-blue-400/90 uppercase tracking-wide mt-0.5">Good</span>
                  </button>

                  <button
                    onClick={() => handleGrade('easy')}
                    disabled={submitting}
                    className="group cursor-pointer flex flex-col items-center justify-center min-h-[72px] py-3 px-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    title="Easy (4)"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums group-hover:scale-105 transition-transform">4</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90 uppercase tracking-wide mt-0.5">Easy</span>
                  </button>
                </div>

                {/* Mark as Mastered Button */}
                <button
                  onClick={handleMarkAsMastered}
                  disabled={masteringCard}
                  className="mt-3 w-full cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  title="Mark as Mastered"
                >
                  <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    {masteringCard ? 'Mastering...' : 'Mark as Mastered'}
                  </span>
                </button>
              </div>
            )}

            {/* Study Aids Section - Mnemonic & Example Sentence */}
            {showAnswer && (
              <div className="mt-4 px-4 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                {/* Toggle Buttons Row */}
                {(!showMnemonic || !showExampleSentence) && (
                  <div className="flex gap-2">
                    {!showMnemonic && (
                      <button
                        onClick={() => setShowMnemonic(true)}
                        className="flex-1 py-2 text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Mnemonic
                      </button>
                    )}
                    {!showExampleSentence && (
                      <button
                        onClick={() => router.push('/practice/' + cardContent.id)}
                        className="flex-1 py-2 text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <BookOpenIcon className="w-4 h-4" />
                        Practice
                      </button>
                    )}
                  </div>
                )}

                {/* Mnemonic Content */}
                {showMnemonic && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-left border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mnemonic</div>
                        <div className="flex items-center gap-1">
                          {!editingMnemonic && (
                            <>
                              <button
                                onClick={generateMnemonic}
                                disabled={generatingMnemonic}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                                title="Generate with AI"
                              >
                                {generatingMnemonic ? (
                                  <LoaderIcon className="w-4 h-4 animate-spin text-gray-500" />
                                ) : (
                                  <SparklesIcon className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMnemonic(true);
                                  setMnemonicContent(mnemonic?.content || '');
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                title={mnemonic ? "Edit" : "Create manually"}
                              >
                                {mnemonic ? <EditIcon className="w-4 h-4 text-gray-500" /> : <PencilIcon className="w-4 h-4 text-gray-500" />}
                              </button>
                              {mnemonic && (
                                <button
                                  onClick={deleteMnemonic}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </>
                          )}
                          {editingMnemonic && (
                            <>
                              <button
                                onClick={saveMnemonic}
                                disabled={savingMnemonic}
                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                                title="Save"
                              >
                                <SaveIcon className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMnemonic(false);
                                  setMnemonicContent(mnemonic?.content || '');
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <XIcon className="w-4 h-4 text-gray-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setShowMnemonic(false)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-1 cursor-pointer"
                            title="Hide"
                          >
                            <XIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      {editingMnemonic ? (
                        <div className="space-y-3">
                          <textarea
                            value={mnemonicContent}
                            onChange={(e) => setMnemonicContent(e.target.value)}
                            className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-y min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            placeholder="Type a mnemonic to help you remember..."
                            autoFocus
                          />
                          
                          {user && (user.is_admin || user.isAdmin || user.role === 'admin') && (
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-750">
                              <div className="text-xs font-semibold text-gray-500 mb-2">Illustration (Admin)</div>
                              {(mnemonicImagePreview || mnemonic?.image_url) && (
                                <div className="relative w-full aspect-video max-h-48 mb-3 group">
                                  <img 
                                    src={mnemonicImagePreview || mnemonic.image_url} 
                                    className="w-full h-full object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-black/5" 
                                    alt="Preview"
                                  />
                                  <button
                                    onClick={(e) => { e.preventDefault(); clearImage(); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              <input
                                type="file"
                                ref={imageInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 text-gray-600 dark:text-gray-400 transition-all flex items-center justify-center gap-2 group"
                              >
                                <EyeIcon className="w-4 h-4 group-hover:text-teal-500" />
                                <span className="text-sm font-medium group-hover:text-teal-600">
                                  {mnemonicImagePreview || mnemonic?.image_url ? 'Change Illustration' : 'Upload Illustration'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mnemonic?.image_url && (
                             <img
                                src={mnemonic.image_url}
                                alt="Mnemonic illustration"
                                className="w-full h-auto max-h-64 rounded-xl object-contain border border-gray-100 dark:border-gray-700 shadow-sm bg-black/5"
                                loading="lazy"
                              />
                          )}
                          <div className={`text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-teal-500 pl-3 ${!mnemonic?.content && 'py-2 opacity-50'}`}>
                            {mnemonic?.content || (
                              <button 
                                onClick={() => setEditingMnemonic(true)}
                                className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer not-italic"
                              >
                                Click here to add a mnemonic or illustration
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


              </div>
            )}
          </Card>

          {/* Hint options modal */}
          {hintModalOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
              onClick={() => setHintModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hint-modal-title"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 id="hint-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <LightbulbIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    Hint
                  </h2>
                  <button
                    onClick={() => setHintModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                    aria-label="Close"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Show hint</div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-900/20">
                        <input
                          type="radio"
                          name="hint-type"
                          value="none"
                          checked={hintState === 'none'}
                          onChange={() => setHintState('none')}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">No hint</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-900/20">
                        <input
                          type="radio"
                          name="hint-type"
                          value="kana"
                          checked={hintState === 'kana'}
                          onChange={() => setHintState('kana')}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Kana (reading)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-900/20">
                        <input
                          type="radio"
                          name="hint-type"
                          value="meaning"
                          checked={hintState === 'meaning'}
                          onChange={() => setHintState('meaning')}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Meaning</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Show for</div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 dark:has-[:checked]:bg-teal-900/20">
                        <input
                          type="radio"
                          name="hint-scope"
                          value="this_only"
                          checked={hintScope === 'this_only'}
                          onChange={() => setHintScope('this_only')}
                          className="w-4 h-4 text-teal-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">This question only</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 dark:has-[:checked]:bg-teal-900/20">
                        <input
                          type="radio"
                          name="hint-scope"
                          value="rest_of_session"
                          checked={hintScope === 'rest_of_session'}
                          onChange={() => setHintScope('rest_of_session')}
                          className="w-4 h-4 text-teal-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">Rest of questions</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={applyHintAndClose}
                  className="mt-4 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <CardEditModal
          card={editingCard}
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSave={(updatedCard) => {
            // Update current card
            setCurrentCard(prev => prev ? { ...prev, ...updatedCard } : null);

            // Update queue
            setQueue(prev => {
              if (!prev) return null;
              return prev.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c);
            });
          }}
        />
      )}


      {/* Confirm Modal for Mark as Mastered */}
      <ConfirmModal
        isOpen={showMasterConfirm}
        title="Mark as Mastered"
        message="Are you sure you want to mark this card as mastered? It will be excluded from future review sessions."
        confirmText="Yes, Mark as Mastered"
        cancelText="Cancel"
        onConfirm={confirmMarkAsMastered}
        onCancel={() => setShowMasterConfirm(false)}
        variant="info"
      />

      <SmartDictionaryFAB />
      
      {/* Mnemonic Reminder Overlay */}
      {activeMnemonicOverlay && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
              <SparklesIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {activeMnemonicOverlay.currentMode === 'pre_flash' ? 'Mnemonic Reminder' : 'Remember this one!'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-serif">
              {activeMnemonicOverlay.card.kanji || activeMnemonicOverlay.card.kana}
            </p>

            <div className="space-y-4 mb-8">
               {activeMnemonicOverlay.mnemonic.image_url && (
                  <img
                    src={activeMnemonicOverlay.mnemonic.image_url}
                    alt="Mnemonic hint"
                    className="w-full rounded-2xl object-contain max-h-64 border border-gray-100 dark:border-gray-700 bg-black/5"
                  />
               )}
               {activeMnemonicOverlay.mnemonic.content && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-teal-500 pl-4 py-2 text-left">
                    {activeMnemonicOverlay.mnemonic.content}
                  </div>
               )}
            </div>

            <button
              onClick={handleMnemonicOverlayContinue}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              <span className="text-sm">
                {activeMnemonicOverlay.currentMode === 'pre_flash' ? 'Go to Flash Quiz' : 'Continue Review'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Flash Practice Modal */}
      {activeFlashPractice && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-4">
                <SparklesIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Flash Practice!
              </h2>
              <div className="flex justify-center gap-1 mb-4">
                {activeFlashPractice.remainingModalities.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let's make sure you remember this one.
                <br />
                What is the <span className="font-bold text-teal-600 dark:text-teal-400 capitalize">{activeFlashPractice.currentModality}</span>?
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center bg-gray-50 dark:bg-gray-750 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                {activeFlashPractice.currentModality === 'meaning' && (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                    {activeFlashPractice.card.kanji || activeFlashPractice.card.kana}
                  </div>
                )}
                {activeFlashPractice.currentModality === 'reading' && (
                  <>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                      {activeFlashPractice.card.kanji || activeFlashPractice.card.kana}
                    </div>
                    {activeFlashPractice.card.kanji && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {activeFlashPractice.card.meaning_id || activeFlashPractice.card.meaning_en}
                      </div>
                    )}
                  </>
                )}
                {activeFlashPractice.currentModality === 'kanji' && (
                  <>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {activeFlashPractice.card.kana}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">
                      {activeFlashPractice.card.meaning_id || activeFlashPractice.card.meaning_en}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  ref={flashPracticeInputRef}
                  type="text"
                  value={flashPracticeInput}
                  onChange={(e) => setFlashPracticeInput(e.target.value)}
                  onKeyPress={handleFlashPracticeKeyPress}
                  placeholder={`Type the ${activeFlashPractice.currentModality}...`}
                  className={`text-center text-lg font-medium min-h-[56px] focus-visible:ring-1 focus-visible:ring-teal-400 focus-visible:border-teal-400 ${flashPracticeCorrect === true
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 focus-visible:ring-green-500'
                    : flashPracticeCorrect === false
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 focus-visible:ring-red-500'
                      : ''
                    }`}
                  disabled={flashPracticeFeedback}
                  autoFocus
                />
                <button
                  onClick={handleFlashPracticeSubmit}
                  disabled={flashPracticeFeedback || !flashPracticeInput.trim()}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white font-medium rounded-xl transition-colors min-h-[48px] cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main >
  );
}
