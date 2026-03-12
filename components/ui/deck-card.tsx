import { ReactNode } from "react";
import { StarIcon } from "lucide-react";

export interface DeckCardProps {
  deck: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    level?: string | null;
    source?: string | null;
    is_official?: boolean;
    card_count: number;
    mastered_count?: number;
    is_favorite?: boolean;
  };
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  onClick: () => void;
  onToggleFavorite?: (deckId: number, e: React.MouseEvent) => void;
}

export default function DeckCard({
  deck,
  icon,
  iconBgColor,
  iconTextColor,
  onClick,
  onToggleFavorite,
}: DeckCardProps) {
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(deck.id, e);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer flex flex-col relative"
    >
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer transition-colors ${
          deck.is_favorite
            ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30"
            : "text-gray-300 dark:text-gray-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30"
        }`}
        aria-label="Toggle favorite"
      >
        <StarIcon className={`w-5 h-5 ${deck.is_favorite ? "fill-current" : ""}`} />
      </button>

      <div
        className={`w-10 h-10 ${iconBgColor} dark:opacity-80 rounded-lg flex items-center justify-center mb-2`}
      >
        <span className={`[&>svg]:w-5 [&>svg]:h-5 ${iconTextColor}`}>
          {icon}
        </span>
      </div>

      <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white pr-8">
        {deck.name}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {deck.card_count} {deck.card_count === 1 ? "card" : "cards"}
        {deck.level && ` • ${deck.level}`}
      </div>

      <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Mastery</span>
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
            {deck.mastered_count ?? 0} / {deck.card_count}
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-500 dark:bg-teal-400 h-full transition-all duration-300"
            style={{
              width: `${
                deck.card_count > 0
                  ? Math.min(100, ((deck.mastered_count ?? 0) / deck.card_count) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
