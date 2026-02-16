'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpenIcon, GraduationCapIcon, BookIcon, LoaderIcon, LayersIcon, SparklesIcon, PlusIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { api } from '@/lib/api';
import DeckFormModal from '@/components/deck-form-modal';
import Button from '@/components/ui/button';

interface Deck {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  level: string | null;
  source: string | null;
  is_official: boolean;
  card_count: number;
}

interface GroupedDecks {
  [level: string]: Deck[];
}

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserEmail(user.email || '');
      }
    } catch (e) {
      console.error('Failed to parse user from local storage');
    }

    fetchDecks();
  }, [router]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If the click target is a menu trigger or inside one, don't close immediately
      // (Let the button's onClick handle the toggle)
      const target = e.target as HTMLElement;
      if (target.closest('[data-menu-trigger]')) {
        return;
      }
      setActiveMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchDecks = async () => {
    try {
      const data = await api.get<{ data: Deck[] } | Deck[]>('/api/v1/decks');
      setDecks(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingDeck(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, deck: Deck) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingDeck(deck);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteClick = async (e: React.MouseEvent, deck: Deck) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) return;

    try {
      await api.delete(`/api/v1/decks/${deck.id}`);
      setDecks(prev => prev.filter(d => d.id !== deck.id));
      setActiveMenu(null);
    } catch (err) {
      alert('Failed to delete deck');
    }
  };

  const handleSaveDeck = (savedDeck: any) => {
    // Cast or validate savedDeck if needed, or update the interface in modal
    const deck = savedDeck as Deck;
    if (editingDeck) {
      setDecks(prev => prev.map(d => d.id === deck.id ? deck : d));
    } else {
      setDecks(prev => [...prev, deck]);
    }
  };

  const getDeckStyle = (deck: Deck) => {
    if (deck.level?.includes('N5')) {
      return { Icon: GraduationCapIcon, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (deck.level?.includes('N4')) {
      return { Icon: GraduationCapIcon, bgColor: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' };
    }
    if (deck.level?.includes('N3')) {
      return { Icon: BookOpenIcon, bgColor: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' };
    }
    if (deck.level?.includes('N2')) {
      return { Icon: BookOpenIcon, bgColor: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600 dark:text-orange-400' };
    }
    if (deck.level?.includes('N1')) {
      return { Icon: BookIcon, bgColor: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' };
    }
    return { Icon: SparklesIcon, bgColor: 'bg-teal-50 dark:bg-teal-900/20', iconColor: 'text-teal-600 dark:text-teal-400' };
  };

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      'N5': 'JLPT N5 - Beginner',
      'N4': 'JLPT N4 - Elementary',
      'N3': 'JLPT N3 - Intermediate',
      'N2': 'JLPT N2 - Upper Intermediate',
      'N1': 'JLPT N1 - Advanced',
      'Other': 'Other Decks',
    };
    return labels[level] || level;
  };

  const getLevelOrder = (level: string) => {
    const order: { [key: string]: number } = { 'N5': 1, 'N4': 2, 'N3': 3, 'N2': 4, 'N1': 5, 'Other': 6 };
    return order[level] || 99;
  };

  // Group decks by level
  const groupedDecks = decks.reduce((acc, deck) => {
    let level = 'Other';
    if (deck.level) {
      const match = deck.level.match(/N[1-5]/);
      if (match) level = match[0];
    }
    if (!acc[level]) acc[level] = [];
    acc[level].push(deck);
    return acc;
  }, {} as GroupedDecks);

  // Sort levels
  const sortedLevels = Object.keys(groupedDecks).sort((a, b) => getLevelOrder(a) - getLevelOrder(b));

  // Find general deck (contains all combined cards)
  const generalDeck = decks.find(deck =>
    deck.name.toLowerCase().includes('general') ||
    deck.slug.toLowerCase().includes('general')
  );
  const totalCards = generalDeck?.card_count || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Study Decks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'}{totalCards > 0 && ` • ${totalCards.toLocaleString()} cards total`}
          </p>
        </div>
        <Button onClick={handleCreateClick} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Create Deck
        </Button>
      </div>

      {/* Error State */}
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
          {error}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <LayersIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No decks available yet.</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateClick}>
            Create your first deck
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedLevels.map((level) => (
            <div key={level} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Level Header */}
              <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${level === 'N5' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    level === 'N4' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      level === 'N3' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        level === 'N2' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          level === 'N1' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            'bg-teal-100 dark:bg-teal-900/30'
                    }`}>
                    <span className={`text-sm font-bold ${level === 'N5' ? 'text-emerald-600 dark:text-emerald-400' :
                      level === 'N4' ? 'text-blue-600 dark:text-blue-400' :
                        level === 'N3' ? 'text-amber-600 dark:text-amber-400' :
                          level === 'N2' ? 'text-orange-600 dark:text-orange-400' :
                            level === 'N1' ? 'text-purple-600 dark:text-purple-400' :
                              'text-teal-600 dark:text-teal-400'
                      }`}>{level !== 'Other' ? level : '★'}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{getLevelLabel(level)}</h2>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {groupedDecks[level].length} {groupedDecks[level].length === 1 ? 'deck' : 'decks'}
                </span>
              </div>

              {/* Deck List */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {groupedDecks[level].map((deck, index) => {
                  const { Icon, bgColor, iconColor } = getDeckStyle(deck);
                  const isLast = index === groupedDecks[level].length - 1;
                  return (
                    <div key={deck.id} className="relative group">
                      <Link
                        href={`/decks/${deck.slug}`}
                        className={`block p-4 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors pr-12 ${isLast ? 'rounded-b-2xl' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                              {deck.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {deck.card_count.toLocaleString()} {deck.card_count === 1 ? 'card' : 'cards'}
                              </span>
                              {deck.is_official && (
                                <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full">
                                  Official
                                </span>
                              )}
                            </div>
                            {deck.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {deck.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Action Menu */}
                      {(!deck.is_official || currentUserEmail === 'jabbarpanggabean@gmail.com') && (
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            data-menu-trigger
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenu(activeMenu === deck.id ? null : deck.id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            <MoreVerticalIcon className="w-5 h-5 pointer-events-none" />
                          </button>

                          {activeMenu === deck.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                              <button
                                onClick={(e) => handleEditClick(e, deck)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <PencilIcon className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, deck)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <TrashIcon className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeckFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeck}
        deck={editingDeck}
      />
    </div>
  );
}
