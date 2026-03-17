'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, RotateCcwIcon, LanguagesIcon, EyeIcon, EyeOffIcon, SendIcon, LoaderIcon, ChevronDownIcon, LightbulbIcon, RefreshCwIcon, PowerIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '@/components/ui/button';
import SmartDictionaryFAB from '@/components/smart-dictionary-fab';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { API_CONSTANTS } from '@/constants/api';
import { ROUTES } from '@/constants/routes';

interface PracticeSentence {
  practice_sentence_id?: number | string;
  ja: string;
  ja_annotated?: string;
  id?: string;
  en?: string;
  explanation?: string;
}

interface CardContent {
  id: number;
  word_id: number;
  kana: string;
  kanji: string | null;
  meaning_id: string | null;
  meaning_en: string | null;
  practice_sentences?: PracticeSentence[];
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const wordId = params.wordId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<CardContent | null>(null);

  // Practice State
  const [practiceSentence, setPracticeSentence] = useState<PracticeSentence | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showFurigana, setShowFurigana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showEnTranslation, setShowEnTranslation] = useState(false);
  const [generatingSentence, setGeneratingSentence] = useState(false);
  const [generatingTranslation, setGeneratingTranslation] = useState(false);
  const [generatingFurigana, setGeneratingFurigana] = useState(false);
  const practiceInputRef = useRef<HTMLTextAreaElement>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
      // Close selection menu if clicking outside
      if (selection && !(e.target as HTMLElement).closest('.selection-menu')) {
        setSelection(null);
      }
    };
    if (showHeaderMenu || selection) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHeaderMenu, selection]);

  useEffect(() => {
    if (!wordId) return;
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    fetchCardData();
  }, [wordId]);

  const fetchCardData = async () => {
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) {
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
      const res = await fetch(`${apiUrl}/api/v1/cards/${wordId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!res.ok) throw new Error('Failed to fetch card details');

      const data = await res.json();
      const cardData = data.data || data;
      setCard(cardData);

      // Check if there are existing sentences to display immediately
      if (cardData.practice_sentences && cardData.practice_sentences.length > 0) {
        const latest = cardData.practice_sentences[cardData.practice_sentences.length - 1];
        setPracticeSentence({
          practice_sentence_id: latest.id,
          ja: latest.ja,
          ja_annotated: latest.ja_annotated,
          id: latest.id_translation,
          en: latest.en_translation,
          explanation: latest.explanation,
        });
      } else {
        // If none, auto-generate one
        generatePracticeSentence(cardData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePracticeSentence = async (currentCard: CardContent | null = card) => {
    if (!currentCard) return;

    setGeneratingSentence(true);
    setPracticeFeedback('none');
    setShowFurigana(false);
    setShowTranslation(false);
    setShowEnTranslation(false);

    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
      const excludeSentence = practiceSentence?.ja;

      const response = await fetch(`${apiUrl}/api/v1/cards/${currentCard.id}/generate-sentence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_lang: 'both',
          save: true,
          exclude: excludeSentence
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.generated && data.generated.ja) {
          setPracticeSentence(data.generated);
          setPracticeInput('');
          setTimeout(() => practiceInputRef.current?.focus(), 100);
        }
      } else {
        throw new Error("Generation response was not ok");
      }
    } catch (error) {
      console.error('Error generating sentence:', error);
      // Optionally set error state to notify user
    } finally {
      setGeneratingSentence(false);
    }
  };

  const handleRegenerateTranslation = async () => {
    if (!practiceSentence || !practiceSentence.practice_sentence_id) return;
    setGeneratingTranslation(true);
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
      const res = await fetch(`${apiUrl}/api/v1/practice-sentences/${practiceSentence.practice_sentence_id}/translate?force=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPracticeSentence(prev => prev ? ({
          ...prev,
          en: data.en_translation,
          id: data.id_translation,
          explanation: data.explanation
        }) : null);
      }
    } catch (error) {
      console.error('Error regenerating translation:', error);
    } finally {
      setGeneratingTranslation(false);
    }
  };

  const handleRegenerateFurigana = async () => {
    if (!practiceSentence || !practiceSentence.practice_sentence_id) return;
    setGeneratingFurigana(true);
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
      const res = await fetch(`${apiUrl}/api/v1/practice-sentences/${practiceSentence.practice_sentence_id}/furigana?force=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPracticeSentence(prev => prev ? ({
          ...prev,
          ja_annotated: data.ja_annotated,
        }) : null);
        setShowFurigana(true);
      }
    } catch (error) {
      console.error('Error regenerating furigana:', error);
    } finally {
      setGeneratingFurigana(false);
    }
  };

  const kanaMatchesCard = (input: string, c: CardContent): boolean => {
    const normalize = (text: string) => text.toLowerCase().replace(/[\s\-\.]/g, '');
    const stripOkurigana = (text: string) => text.replace(/\([^)]+\)/g, ''); // Removes content within parentheses
    const removeParens = (text: string) => text.replace(/[\(\)]/g, ''); // Removes just the parentheses but keeps content

    const nInput = normalize(input);
    if (!nInput) return false;

    // Split kana field into variants by separator
    const rawCandidates = c.kana.split(/[,、/・]/).map(normalize).filter(s => s.length > 0);

    // Build a comprehensive list of acceptable candidates
    let allCandidates = new Set<string>();

    rawCandidates.forEach(cand => {
      allCandidates.add(removeParens(cand)); // E.g., 'かた(る)' -> 'かたる'
      if (cand.includes('(')) {
        allCandidates.add(stripOkurigana(cand)); // E.g., 'かた(る)' -> 'かた'
      }
    });

    return allCandidates.has(nInput);
  };

  const meaningMatchesCard = (input: string, c: CardContent): boolean => {
    const normalize = (text: string) => text.toLowerCase().trim();
    const nInput = normalize(input);
    if (!nInput) return false;
    const checkMeanings = (text: string | null) => {
      if (!text) return false;
      const candidates = text.split(/[/()、,;]/).map(normalize).filter(s => s.length > 0);
      return candidates.some(can => can === nInput);
    };
    return checkMeanings(c.meaning_id) || checkMeanings(c.meaning_en);
  };

  const sentenceMatches = (input: string, sentence: PracticeSentence | null): boolean => {
    if (!sentence) return false;
    const normalize = (text: string) => text.toLowerCase().replace(/[\s\-\.\(\)、「」。？\?]/g, '');
    const nInput = normalize(input);
    if (!nInput) return false;
    if (nInput === normalize(sentence.ja)) return true;
    if (sentence.en && nInput === normalize(sentence.en)) return true;
    return false;
  };

  const handleCheck = () => {
    if (!practiceInput.trim() || !card) return;
    const trimmed = practiceInput.trim();
    const isCorrect = kanaMatchesCard(trimmed, card) || meaningMatchesCard(trimmed, card) || sentenceMatches(trimmed, practiceSentence);

    setPracticeFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setTimeout(() => {
        generatePracticeSentence(card);
      }, 1500);
    }
  };

  const handleCheckAndShowTranslation = () => {
    if (!practiceInput.trim() || !card) return;
    const trimmed = practiceInput.trim();
    const isCorrect = kanaMatchesCard(trimmed, card) || meaningMatchesCard(trimmed, card) || sentenceMatches(trimmed, practiceSentence);

    setPracticeFeedback(isCorrect ? 'correct' : 'incorrect');

    setShowTranslation(true);
    if (practiceSentence?.practice_sentence_id && !practiceSentence.en) {
      handleRegenerateTranslation();
    }
  };

  const handleCheckAndFinish = () => {
    if (!practiceInput.trim() || !card) return;
    const trimmed = practiceInput.trim();
    const isCorrect = kanaMatchesCard(trimmed, card) || meaningMatchesCard(trimmed, card) || sentenceMatches(trimmed, practiceSentence);

    setPracticeFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setTimeout(() => {
        console.log('[PracticePage] handleCheckAndFinish: Navigating back to review');
        router.back();
      }, 1000);
    }
  };

  const handleMouseUp = () => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Position the menu above the selection
          setSelection({
            text: sel.toString().trim(),
            x: rect.left + rect.width / 2,
            y: rect.top - 12
          });
        } catch (e) {
          // Range might be invalid
          setSelection(null);
        }
      } else {
        setSelection(null);
      }
    }, 10);
  };

  const triggerTranslation = () => {
    if (selection) {
      window.dispatchEvent(new CustomEvent('smart-dictionary-search', {
        detail: { query: selection.text }
      }));
      setSelection(null);
      // Clear current selection
      window.getSelection()?.removeAllRanges();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error || "Card not found"}</div>
        <Button onClick={() => {
          console.log('[PracticePage] Error back button clicked');
          router.back();
        }} variant="outline">Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-25 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              router.back();
            }}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            title="Back to Review"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Practice <span className="text-teal-600 dark:text-teal-400 font-serif">「{card.kanji || card.kana}」</span>
          </h2>
        </div>

        <div className="relative" ref={headerMenuRef}>
          <button
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="flex items-center gap-1 p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors cursor-pointer"
            title="Options"
          >
            <LightbulbIcon className="w-5 h-5" />
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showHeaderMenu ? 'rotate-180' : ''}`} />
          </button>

          {showHeaderMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-[52] animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => { generatePracticeSentence(card); setShowHeaderMenu(false); }}
                disabled={generatingSentence}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <RotateCcwIcon className={`w-4 h-4 text-teal-500 flex-shrink-0 ${generatingSentence ? 'animate-spin' : ''}`} />
                <span className="truncate">Generate New Sentence</span>
              </button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1.5 mx-3" />
              <button
                onClick={() => {
                  const newState = !showFurigana;
                  setShowFurigana(newState);
                  if (newState && practiceSentence?.practice_sentence_id && !practiceSentence.ja_annotated) {
                    handleRegenerateFurigana();
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <LanguagesIcon className={`w-4 h-4 ${showFurigana ? 'text-orange-500' : 'text-gray-400'}`} />
                <span>Furigana</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-bold ${showFurigana ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                  {showFurigana ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                onClick={() => {
                  const newState = !showTranslation;
                  setShowTranslation(newState);
                  if (newState && practiceSentence?.practice_sentence_id && !practiceSentence.en) {
                    handleRegenerateTranslation();
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                {showTranslation ? <EyeIcon className="w-4 h-4 text-blue-500" /> : <EyeOffIcon className="w-4 h-4 text-gray-400" />}
                <span>Terjemahan</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-bold ${showTranslation ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                  {showTranslation ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Body area */}
      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6">
        <div className="max-w-4xl mx-auto w-full pb-32 space-y-8">
          {/* Sentence View */}
          {generatingSentence ? (
            <div className="h-48 flex items-center justify-center">
              <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : practiceSentence && practiceSentence.ja ? (
            <div className='mb-0'>

              {/* Unified Flashcard Area: Japanese Sample + Textarea Input */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-teal-500/50 transition-all mt-4">
                {/* Top Section: Japanese Sample */}
                <div className="bg-gradient-to-br from-teal-50/50 to-blue-50/30 dark:from-teal-900/10 dark:to-blue-900/10 p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/50 relative">
                  {(showFurigana || showTranslation) && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {showFurigana && (
                        <>
                          <button
                            onClick={handleRegenerateFurigana}
                            disabled={generatingFurigana || !practiceSentence.practice_sentence_id}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                            title="Update Furigana"
                          >
                            <RefreshCwIcon className={`w-3.5 h-3.5 ${generatingFurigana ? 'animate-spin' : ''}`} />
                            Update
                          </button>
                          <button
                            onClick={() => setShowFurigana(false)}
                            className="flex items-center justify-center px-2 py-1.5 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
                            title="Hide Furigana"
                          >
                            <EyeOffIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <div 
                    onMouseUp={handleMouseUp}
                    className={`text-xl sm:text-2xl md:text-3xl text-black dark:text-white font-serif leading-relaxed break-words [&_rt]:text-sm [&_rt]:text-gray-400 dark:[&_rt]:text-gray-600 [&_rt]:font-sans text-center ${showFurigana ? 'mt-6' : ''}`}
                  >
                    {showFurigana && practiceSentence.ja_annotated ? (
                      <span dangerouslySetInnerHTML={{ __html: practiceSentence.ja_annotated }} />
                    ) : (
                      practiceSentence.ja
                    )}
                  </div>
                </div>

                {/* Bottom Section: Textarea Input */}
                <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 relative">
                  <div className="mb-3 flex justify-between items-center px-1">
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Your Answer
                    </label>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-md">
                      {card.kana}
                    </div>
                  </div>

                  <textarea
                    ref={practiceInputRef}
                    value={practiceInput}
                    onChange={(e) => {
                      setPracticeInput(e.target.value);
                      setPracticeFeedback('none');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (e.ctrlKey || e.metaKey) {
                          handleCheckAndFinish();
                        } else if (e.altKey) {
                          handleCheckAndShowTranslation();
                        } else {
                          handleCheck();
                        }
                      }
                    }}
                    placeholder="Type the reading or meaning..."
                    rows={2}
                    className={`w-full resize-none bg-gray-50 dark:bg-gray-900/50 text-base md:text-lg min-h-[80px] rounded-2xl p-4 border border-transparent focus:outline-none focus:border-teal-500/30 focus:bg-white dark:focus:bg-gray-800 transition-all scrollbar-hide
                      ${practiceFeedback === 'correct' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : ''}
                      ${practiceFeedback === 'incorrect' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : ''}
                    `}
                    style={{ fieldSizing: 'content' } as React.CSSProperties}
                  />

                  {/* Redesigned Compact Action Buttons */}
                  <div className="flex justify-end gap-2 sm:gap-3 mt-4">
                    <Button
                      onClick={handleCheckAndFinish}
                      variant="outline"
                      title="Submit & Finish (Ctrl + Enter)"
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <PowerIcon className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={handleCheckAndShowTranslation}
                      variant="outline"
                      title="Submit & Show Translation (Alt + Enter)"
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <LanguagesIcon className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={handleCheck}
                      title="Next (Enter)"
                      className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all text-sm font-bold cursor-pointer"
                    >
                      <SendIcon className="w-4 h-4" />
                      <span>Next</span>
                    </Button>
                  </div>

                  {/* Feedback Overlay/Strings */}
                  {practiceFeedback === 'correct' && (
                    <div className="mt-3 text-sm text-green-600 dark:text-green-400 font-bold text-center animate-in fade-in slide-in-from-top-1">
                      ✓ Correct! Great job!
                    </div>
                  )}
                  {practiceFeedback === 'incorrect' && (
                    <div className="mt-3 text-sm text-red-500 dark:text-red-400 font-bold text-center animate-in fade-in slide-in-from-top-1">
                      ✗ Not quite right. Try again!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4 flex flex-col items-center">
              <RotateCcwIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No practice sentence</p>
              <Button onClick={() => generatePracticeSentence(card)} className="inline-flex items-center gap-2 cursor-pointer mt-4">
                Generate First Sentence
              </Button>
            </div>
          )}

          {/* Translations */}
          {practiceSentence && practiceSentence.ja && showTranslation && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-in fade-in duration-200 relative group overflow-hidden mt-6">
              {generatingTranslation && (
                <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                  <LoaderIcon className="w-6 h-6 animate-spin text-teal-500" />
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <LanguagesIcon className="w-4 h-4" />
                    Translation
                  </h4>
                  {practiceSentence.en && (
                    <button
                      onClick={() => setShowEnTranslation(!showEnTranslation)}
                      className={`text-xs px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${showEnTranslation
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
                        }`}
                      title="Toggle English Translation"
                    >
                      EN
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showTranslation && practiceSentence.practice_sentence_id && (
                    <button
                      onClick={handleRegenerateTranslation}
                      disabled={generatingTranslation}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                      title="Update Translation"
                    >
                      <RefreshCwIcon className={`w-3.5 h-3.5 ${generatingTranslation ? 'animate-spin' : ''}`} />
                      Update
                    </button>
                  )}
                  {showTranslation && (
                    <button
                      onClick={() => setShowTranslation(false)}
                      className="flex items-center justify-center px-2 py-1.5 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
                      title="Hide Translation"
                    >
                      <EyeOffIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {(practiceSentence.id || practiceSentence.en) ? (
                  <>
                    {practiceSentence.id && (
                      <div className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed font-medium">
                        {practiceSentence.id}
                      </div>
                    )}
                    {showEnTranslation && practiceSentence.en && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed italic border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {practiceSentence.en}
                      </div>
                    )}
                    {practiceSentence.explanation && (
                      <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 mt-3">
                        <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Penjelasan</h5>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <div className="flex items-center gap-2 mt-5 mb-3 pb-2 border-b border-indigo-200 dark:border-indigo-800/50">
                                  <span className="w-1 h-5 rounded-full bg-indigo-500"></span>
                                  <h3 className="text-base font-bold text-indigo-700 dark:text-indigo-400">{children}</h3>
                                </div>
                              ),
                              h2: ({ children }) => (
                                <div className="flex items-center gap-2 mt-4 mb-2">
                                  <span className="w-1 h-4 rounded-full bg-teal-500"></span>
                                  <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400">{children}</h4>
                                </div>
                              ),
                              h3: ({ children }) => (
                                <div className="flex items-center gap-2 mt-3 mb-1.5">
                                  <span className="w-1 h-3.5 rounded-full bg-amber-500"></span>
                                  <h5 className="text-sm font-semibold text-amber-700 dark:text-amber-400">{children}</h5>
                                </div>
                              ),
                              p: ({ children }) => (
                                <p className="text-sm leading-relaxed mb-2.5 text-gray-700 dark:text-gray-300">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="text-sm pl-1 mb-3 space-y-1.5 text-gray-700 dark:text-gray-300 [&>li]:relative [&>li]:pl-4 [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.55em] [&>li]:before:w-1.5 [&>li]:before:h-1.5 [&>li]:before:rounded-full [&>li]:before:bg-teal-400 [&>li]:before:dark:bg-teal-600">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="text-sm pl-5 mb-3 list-decimal space-y-1.5 text-gray-700 dark:text-gray-300 marker:text-indigo-500 marker:font-bold">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1 leading-relaxed">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-1 py-0.5 rounded">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="text-amber-700 dark:text-amber-400 not-italic font-medium">{children}</em>
                              ),
                              hr: () => (
                                <hr className="my-4 border-none h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                              ),
                              code: ({ children }) => (
                                <code className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-mono border border-teal-200 dark:border-teal-800/50">{children}</code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="my-3 pl-4 py-2 pr-3 border-l-3 border-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg text-amber-800 dark:text-amber-300 text-sm italic">{children}</blockquote>
                              ),
                            }}
                          >
                            {practiceSentence.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 italic">
                    No translation generated yet. Click the refresh button to generate one.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Selection Tooltip Menu */}
      {selection && (
        <div
          className="fixed z-[100] bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl py-1 px-1 flex items-center gap-1 animate-in zoom-in-95 fade-in duration-200 selection-menu"
          style={{
            top: selection.y,
            left: selection.x,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button
            onClick={triggerTranslation}
            className="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-lg transition-colors text-sm font-bold whitespace-nowrap cursor-pointer"
          >
            <LanguagesIcon className="w-4 h-4" />
            <span>Translate</span>
          </button>
        </div>
      )}

      <SmartDictionaryFAB />
    </div>
  );
}
