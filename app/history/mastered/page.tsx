'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, AwardIcon, Trash2Icon, LoaderIcon, RotateCcwIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import { api } from '@/lib/api';

interface CardData {
  id: number;
  kanji: string;
  kana: string;
  meaning_id: string;
  meaning_en: string | null;
}

interface UserCard {
  is_manually_mastered: boolean;
  last_grade: string | null;
}

interface CardWithUser extends CardData {
  user_card?: UserCard;
}

export default function MasteredCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unmasteringId, setUnmasteringId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchMasteredCards();
  }, [router]);

  const fetchMasteredCards = async () => {
    try {
      setLoading(true);
      // The API response is paginated: { data: Card[], ... }
      const response = await api.get<{ data: CardWithUser[] }>('/api/v1/cards?status=mastered&per_page=100');
      setCards(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mastered cards');
    } finally {
      setLoading(false);
    }
  };

  const handleUnmaster = async (cardId: number) => {
    if (!confirm('Are you sure you want to unmaster this card? It will be returned to the review queue.')) {
      return;
    }

    try {
      setUnmasteringId(cardId);
      await api.post(`/api/v1/cards/${cardId}/unmaster`, {});

      // Remove from list
      setCards((prev: CardWithUser[]) => prev.filter((c: CardWithUser) => c.id !== cardId));
    } catch (err) {
      alert('Failed to unmaster card');
      console.error(err);
    } finally {
      setUnmasteringId(null);
    }
  };

  if (loading && cards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="flex items-center justify-center min-h-screen">
          <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-md mx-auto md:max-w-4xl px-4 pt-4 md:pt-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to History
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <AwardIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mastered Cards</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have mastered {cards.length} cards
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card: CardWithUser) => (
              <Card key={card.id} className="p-4 flex items-center justify-between group hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {card.kanji || card.kana}
                    </span>
                    {card.kanji && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {card.kana}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {card.meaning_id}
                  </div>
                </div>

                <button
                  onClick={() => handleUnmaster(card.id)}
                  disabled={unmasteringId === card.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Unmaster (Return to Review)"
                >
                  {unmasteringId === card.id ? (
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <RotateCcwIcon className="w-5 h-5" />
                  )}
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <AwardIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No mastered cards yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Keep practicing! Cards will appear here once you mark them as mastered or reach the highest proficiency level.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
