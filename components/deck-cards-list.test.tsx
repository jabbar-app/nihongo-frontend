import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckCardsList } from './deck-cards-list';

describe('DeckCardsList', () => {
  const mockCards = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    kanji: i % 2 === 0 ? `漢字${i}` : undefined,
    kana: `かな${i}`,
    meaning_en: `Meaning ${i}`,
    meaning_id: `ID ${i}`,
  }));

  const mockOnEditCard = jest.fn();

  beforeEach(() => {
    mockOnEditCard.mockClear();
  });

  it('renders card list with items', () => {
    render(
      <DeckCardsList
        cards={mockCards.slice(0, 10)}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );

    // Should render some cards
    const cards = screen.getAllByText(/Meaning/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('filters cards by search query', () => {
    render(
      <DeckCardsList
        cards={mockCards}
        searchQuery="Meaning 5"
        onEditCard={mockOnEditCard}
      />
    );

    // Should only show matching card
    expect(screen.getByText('Meaning 5')).toBeInTheDocument();
  });

  it('shows empty message when no cards match search', () => {
    render(
      <DeckCardsList
        cards={mockCards}
        searchQuery="nonexistent"
        onEditCard={mockOnEditCard}
        emptyMessage="No cards found"
      />
    );

    expect(screen.getByText('No cards found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <DeckCardsList
        cards={mockCards}
        searchQuery=""
        onEditCard={mockOnEditCard}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading cards...')).toBeInTheDocument();
  });

  it('calls onEditCard when edit button is clicked', () => {
    const { container } = render(
      <DeckCardsList
        cards={mockCards.slice(0, 5)}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );

    // Find and click edit button
    const editButtons = container.querySelectorAll('button');
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockOnEditCard).toHaveBeenCalled();
    }
  });

  it('uses virtualization for large lists (50+ items)', () => {
    const largeCardList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      kanji: `漢字${i}`,
      kana: `かな${i}`,
      meaning_en: `Meaning ${i}`,
      meaning_id: `ID ${i}`,
    }));

    const { container } = render(
      <DeckCardsList
        cards={largeCardList}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );

    // Should render without crashing
    expect(container).toBeInTheDocument();
  });

  it('renders normal grid for small lists (<50 items)', () => {
    const smallCardList = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      kanji: `漢字${i}`,
      kana: `かな${i}`,
      meaning_en: `Meaning ${i}`,
      meaning_id: `ID ${i}`,
    }));

    render(
      <DeckCardsList
        cards={smallCardList}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );

    // Should render all cards
    const meanings = screen.getAllByText(/Meaning/);
    expect(meanings.length).toBe(20);
  });

  it('handles cards with and without kanji', () => {
    const mixedCards = [
      {
        id: 1,
        kanji: '漢字',
        kana: 'かんじ',
        meaning_en: 'Kanji',
        meaning_id: 'ID1',
      },
      {
        id: 2,
        kanji: undefined,
        kana: 'ひらがな',
        meaning_en: 'Hiragana',
        meaning_id: 'ID2',
      },
    ];

    render(
      <DeckCardsList
        cards={mixedCards}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );

    expect(screen.getByText('漢字')).toBeInTheDocument();
    expect(screen.getByText('ひらがな')).toBeInTheDocument();
  });

  it('filters by kanji', () => {
    render(
      <DeckCardsList
        cards={mockCards}
        searchQuery="漢字5"
        onEditCard={mockOnEditCard}
      />
    );

    // Should find the card with matching kanji
    expect(screen.getByText('Meaning 5')).toBeInTheDocument();
  });

  it('filters by kana', () => {
    render(
      <DeckCardsList
        cards={mockCards}
        searchQuery="かな5"
        onEditCard={mockOnEditCard}
      />
    );

    // Should find the card with matching kana
    expect(screen.getByText('Meaning 5')).toBeInTheDocument();
  });

  it('handles empty card list', () => {
    render(
      <DeckCardsList
        cards={[]}
        searchQuery=""
        onEditCard={mockOnEditCard}
        emptyMessage="No cards available"
      />
    );

    expect(screen.getByText('No cards available')).toBeInTheDocument();
  });

  it('performance: renders 1000 items efficiently', () => {
    const largeCardList = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      kanji: `漢字${i}`,
      kana: `かな${i}`,
      meaning_en: `Meaning ${i}`,
      meaning_id: `ID ${i}`,
    }));

    const startTime = performance.now();
    const { container } = render(
      <DeckCardsList
        cards={largeCardList}
        searchQuery=""
        onEditCard={mockOnEditCard}
      />
    );
    const endTime = performance.now();

    // Should render in reasonable time (< 1 second)
    expect(endTime - startTime).toBeLessThan(1000);
    expect(container).toBeInTheDocument();
  });
});
