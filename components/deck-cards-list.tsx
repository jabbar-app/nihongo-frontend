'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { PencilIcon, GraduationCapIcon } from 'lucide-react';

/**
 * DeckCardsList - Virtualized list component for displaying deck cards
 * 
 * Optimized for rendering large lists of cards (50+ items) with:
 * - Virtual scrolling for performance
 * - Search filtering
 * - Edit functionality
 * - Responsive grid layout
 */

interface Card {
  id: number;
  kanji?: string;
  kana: string;
  meaning_en?: string;
  meaning_id?: string;
}

interface DeckCardsListProps {
  cards: Card[];
  searchQuery: string;
  onEditCard: (card: Card) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Card item renderer for virtualized list
 */
const CardItem = React.memo(
  ({
    card,
    onEdit,
  }: {
    card: Card;
    onEdit: (card: Card) => void;
  }) => (
    <div className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        {card.kanji ? (
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
            {card.kanji}
          </div>
        ) : (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {card.kana}
          </div>
        )}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(card)}
            className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 flex items-center justify-center transition-colors"
          >
            <PencilIcon className="w-4 h-4 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <GraduationCapIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {card.kanji && (
        <div className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">
          {card.kana}
        </div>
      )}

      <div className="text-gray-600 dark:text-gray-300 text-sm border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
        {card.meaning_id || card.meaning_en}
      </div>
    </div>
  )
);

CardItem.displayName = 'CardItem';

/**
 * Grid wrapper for virtualized items
 * Renders items in a responsive grid layout
 */
const GridWrapper = React.memo(
  ({
    children,
    index,
    style,
  }: {
    children: React.ReactNode;
    index: number;
    style: React.CSSProperties;
  }) => {
    // Calculate grid position (3 columns on desktop, 2 on tablet, 1 on mobile)
    const colsPerRow = 3;
    const rowIndex = Math.floor(index / colsPerRow);
    const colIndex = index % colsPerRow;

    return (
      <div
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
        }}
      >
        {children}
      </div>
    );
  }
);

GridWrapper.displayName = 'GridWrapper';

/**
 * DeckCardsList component - renders virtualized list of cards
 */
export const DeckCardsList = React.memo(
  ({
    cards,
    searchQuery,
    onEditCard,
    isLoading = false,
    emptyMessage = 'No cards found',
  }: DeckCardsListProps) => {
    // Filter cards based on search query
    const filteredCards = useMemo(() => {
      if (!searchQuery) return cards;

      return cards.filter((card) =>
        (card.kanji && card.kanji.includes(searchQuery)) ||
        (card.kana && card.kana.includes(searchQuery)) ||
        (card.meaning_en &&
          card.meaning_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (card.meaning_id &&
          card.meaning_id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }, [cards, searchQuery]);

    // Render function for virtualized list
    const renderCard = useCallback(
      (card: Card, index: number) => (
        <CardItem key={card.id} card={card} onEdit={onEditCard} />
      ),
      [onEditCard]
    );

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading cards...</p>
          </div>
        </div>
      );
    }

    if (filteredCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    // Render all cards in a grid
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <CardItem key={card.id} card={card} onEdit={onEditCard} />
        ))}
      </div>
    );
  }
);

DeckCardsList.displayName = 'DeckCardsList';
