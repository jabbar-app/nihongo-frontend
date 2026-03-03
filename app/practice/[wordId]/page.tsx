'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, RotateCcwIcon, LanguagesIcon, EyeIcon, EyeOffIcon, SendIcon, LoaderIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import SmartDictionaryFAB from '@/components/smart-dictionary-fab';

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
  const practiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!wordId) return;
    fetchCardData();
  }, [wordId]);

  const fetchCardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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

  const kanaMatchesCard = (input: string, c: CardContent): boolean => {
    const normalize = (text: string) => text.toLowerCase().replace(/[\s\-\.\(\)]/g, '');
    const nInput = normalize(input);
    if (!nInput) return false;
    if (nInput === normalize(c.kana)) return true;
    const candidates = c.kana.split(/[,、/・]/).map(normalize).filter(s => s.length > 0);
    return candidates.includes(nInput);
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

  const handleCheck = () => {
    if (!practiceInput.trim() || !card) return;
    const trimmed = practiceInput.trim();
    const isCorrect = kanaMatchesCard(trimmed, card) || meaningMatchesCard(trimmed, card);

    setPracticeFeedback(isCorrect ? 'correct' : 'incorrect');
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
        <Button onClick={() => router.back()} variant="outline">Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            title="Back to Review"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Practice <span className="text-teal-600 dark:text-teal-400 font-serif">「{card.kanji || card.kana}」</span>
          </h2>
        </div>

        <button
          onClick={() => generatePracticeSentence(card)}
          disabled={generatingSentence}
          className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors cursor-pointer disabled:opacity-50"
          title="Generate New Sentence"
        >
          <RotateCcwIcon className={`w-5 h-5 ${generatingSentence ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scrollable Body area */}
      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6">
        <div className="max-w-3xl mx-auto w-full pb-32 space-y-8">

          {/* Toggles */}
          <div className="flex items-center gap-2 justify-center flex-wrap pt-4">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${showFurigana
                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <LanguagesIcon className="w-4 h-4" />
              <span>Furigana</span>
            </button>

            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${showTranslation
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {showTranslation ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
              <span>Translation</span>
            </button>
          </div>

          {/* Sentence View */}
          <div className="space-y-4">
            {generatingSentence ? (
              <div className="h-48 flex items-center justify-center">
                <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : practiceSentence && practiceSentence.ja ? (
              <div className="space-y-6">
                {/* Japanese Text Box */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 sm:p-10 border-l-4 border-teal-500 shadow-sm">
                  <div className="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-200 font-serif leading-relaxed break-words [&_rt]:text-sm [&_rt]:text-gray-500 [&_rt]:font-sans">
                    {showFurigana && practiceSentence.ja_annotated ? (
                      <span dangerouslySetInnerHTML={{ __html: practiceSentence.ja_annotated }} />
                    ) : (
                      practiceSentence.ja
                    )}
                  </div>
                </div>

                {/* Translations */}
                {showTranslation && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-in fade-in duration-200 relative group overflow-hidden">
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
                      <button
                        onClick={handleRegenerateTranslation}
                        disabled={generatingTranslation || !practiceSentence.practice_sentence_id}
                        className="p-1.5 rounded-md text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Regenerate Translation"
                      >
                        <RotateCcwIcon className={`w-4 h-4 ${generatingTranslation ? 'animate-spin' : ''}`} />
                      </button>
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
            ) : (
              <div className="text-center py-12 space-y-4 flex flex-col items-center">
                <RotateCcwIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No practice sentence</p>
                <Button onClick={() => generatePracticeSentence(card)} className="inline-flex items-center gap-2 cursor-pointer mt-4">
                  Generate First Sentence
                </Button>
              </div>
            )}
          </div>

          {/* Input View */}
          {practiceSentence && practiceSentence.ja && (
            <div className="space-y-3 pt-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Target word: <span className="text-teal-600 font-bold">{card.kana}</span> - Type its reading to check:
              </label>
              <div className="relative">
                <Input
                  ref={practiceInputRef}
                  value={practiceInput}
                  onChange={(e) => {
                    setPracticeInput(e.target.value);
                    setPracticeFeedback('none');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheck();
                  }}
                  placeholder="Type the reading or meaning..."
                  className={`pr-14 text-lg md:text-xl min-h-[72px] rounded-2xl shadow-sm border-gray-200 focus:border-teal-500 transition-all ${practiceFeedback === 'correct'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-green-100 dark:shadow-none'
                    : practiceFeedback === 'incorrect'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-red-100 dark:shadow-none'
                      : 'bg-white dark:bg-gray-800'
                    }`}
                />
                <button
                  onClick={handleCheck}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/60 text-teal-600 dark:text-teal-400 transition-colors cursor-pointer"
                  title="Check Answer"
                >
                  <SendIcon className={`w-5 h-5 ${practiceFeedback === 'correct' ? 'text-green-600' : ''}`} />
                </button>
              </div>

              {/* Feedback Strings */}
              {practiceFeedback === 'correct' && (
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
                  ✓ Correct! Great job!
                </div>
              )}
              {practiceFeedback === 'incorrect' && (
                <div className="text-sm text-red-600 dark:text-red-400 font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
                  ✗ Not quite right. Try again!
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <SmartDictionaryFAB />
    </div>
  );
}
