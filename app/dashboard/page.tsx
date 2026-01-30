'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlameIcon, PlayIcon, BookOpenIcon, GlobeIcon, BriefcaseIcon, UserIcon, ShoppingBagIcon, GraduationCapIcon, BookIcon, MenuIcon, InfoIcon, XIcon } from 'lucide-react';
import MobileSidebar from '@/components/mobile-sidebar';
import { useHeader } from '@/components/header-context';
import ThemeToggle from '@/components/theme-toggle';
import { useTheme } from '@/lib/theme-context';
import { api } from '@/lib/api';

interface DashboardData {
  dueToday: number;
  reviewedToday: number;
  accuracyRate: number;
  timeSpentToday: number;
  cardsMastered: number;
  rank: string;
  rankNext: string | null;
  cardsToNext: number;
  chartData: Array<{
    label: string;
    reviews: number;
    accuracy: number | null;
    focusMinutes: number;
  }>;
  dailyPlanSections: Array<{
    key: string;
    label: string;
    hint: string;
    badge: string;
    rows: Array<{
      item: any;
      progress: number;
      target: number;
      pct: number;
      completed: boolean;
      status: string;
      statusLabel: string;
      kindLabel: string;
    }>;
    totalCount: number;
    doneCount: number;
    pctGroup: number;
  }>;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [decksLoading, setDecksLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const [cardsMasteredInfoOpen, setCardsMasteredInfoOpen] = useState(false);

  // Header Context
  const { setHeaderContent } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setHeaderContent(
        <div className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
                {formatTime(data.timeSpentToday)}
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      );
    } else {
      setHeaderContent(null); // Use default navbar on desktop
    }
    return () => setHeaderContent(null);
  }, [setHeaderContent, data, sidebarOpen, isMobile]);


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await api.get<DashboardData>('/api/v1/dashboard');
        // Normalize chartData in case API returns snake_case (focus_minutes, etc.)
        if (dashboardData.chartData?.length) {
          dashboardData.chartData = dashboardData.chartData.map((d) => ({
            label: d.label,
            reviews: d.reviews ?? 0,
            accuracy: d.accuracy ?? null,
            focusMinutes: (d as { focusMinutes?: number; focus_minutes?: number }).focusMinutes
              ?? (d as { focus_minutes?: number }).focus_minutes ?? 0,
          }));
        }
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchDecks = async () => {
      try {
        const decksData = await api.get<{ data: Deck[] } | Deck[]>('/api/v1/decks?per_page=4');
        setDecks(Array.isArray(decksData) ? decksData : decksData.data || []);
      } catch {
        // Failed to load decks
      } finally {
        setDecksLoading(false);
      }
    };

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load user from local storage immediately to avoid layout shift if possible,
    // though real verification happens via API 401 check inside api.ts
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Invalid user data
      }
    }

    fetchDashboard();
    fetchDecks();

    // Refetch dashboard when user returns to this page/tab so indicators stay in sync
    const onVisible = () => {
      if (document.visibilityState === 'visible' && token) {
        fetchDashboard();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="p-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  // Format time in minutes to readable format (25m, 1h, 1d)
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      if (mins === 0) {
        return `${hours}h`;
      }
      return `${hours}h${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      if (hours === 0) {
        return `${days}d`;
      }
      return `${days}d${hours}h`;
    }
  };

  // Calculate streak from last 7 days of activity
  const calculateStreak = () => {
    if (!data.chartData || data.chartData.length === 0) {
      return { streakDays: 0, recentDays: [] };
    }

    // Get last 7 days
    const recentDays = data.chartData.slice(-7);

    // Calculate streak: consecutive days from today backwards with activity
    // Activity = reviews > 0 OR focusMinutes > 0
    let streakDays = 0;
    const todayData = recentDays[recentDays.length - 1];

    // Check if today has activity
    if (todayData && (todayData.reviews > 0 || todayData.focusMinutes > 0)) {
      streakDays = 1;

      // Count backwards for consecutive days
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) {
          streakDays++;
        } else {
          break; // Streak broken
        }
      }
    } else {
      // Today has no activity, check yesterday backwards
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    return { streakDays, recentDays };
  };

  const { streakDays, recentDays } = calculateStreak();
  const rankLevel = data.rank === 'Novice' ? 1 : data.rank === 'Beginner' ? 2 : data.rank === 'Intermediate' ? 3 : data.rank === 'Advanced' ? 4 : data.rank === 'Expert' ? 5 : 6;

  // Get icon and color for deck based on level or type
  const getDeckIcon = (deck: Deck) => {
    if (deck.level?.includes('N5') || deck.level?.includes('N4')) {
      return { Icon: GraduationCapIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
    }
    if (deck.level?.includes('N3') || deck.level?.includes('N2')) {
      return { Icon: BookOpenIcon, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
    }
    if (deck.level?.includes('N1')) {
      return { Icon: BookIcon, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
    }
    // Default
    return { Icon: BookOpenIcon, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' };
  };

  const handleDeckClick = (deck: Deck) => {
    router.push(`/decks/${deck.slug}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl">
        {/* User Profile Section */}
        <div className="px-4 pt-4 pb-2 md:pt-8">
          <div className="hidden md:flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name || 'User'}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Level {rankLevel}</div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
              {formatTime(data.timeSpentToday)}
            </div>
          </div>

          {/* Current Course / Cards Mastered */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push('/history')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/history'); } }}
            className="w-full bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cards Mastered</div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">{data.cardsMastered} cards</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCardsMasteredInfoOpen(true); }}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    aria-label="How is Cards Mastered calculated?"
                  >
                    <InfoIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); router.push('/review'); }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Start Review
              </button>
            </div>
            {data.rankNext && data.cardsToNext > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Progress to {data.rankNext}</span>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{data.cardsToNext} cards left</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-teal-600 dark:bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((data.cardsMastered / (data.cardsMastered + data.cardsToNext)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cards Mastered – how it's calculated (info modal) */}
          {cardsMasteredInfoOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setCardsMasteredInfoOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cards-mastered-info-title"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-5 border border-gray-200 dark:border-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 id="cards-mastered-info-title" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <InfoIcon className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                    How is Cards Mastered calculated?
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCardsMasteredInfoOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    aria-label="Close"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                  <p>
                    A card counts as <strong className="text-gray-900 dark:text-white">mastered</strong> only when <strong className="text-gray-900 dark:text-white">both</strong> are true:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Its <strong>interval</strong> has reached at least <strong>7 days</strong> (you’ll see it again in a week or more).</li>
                    <li>Its <strong>ease factor</strong> is at least <strong>2.5</strong> (the card is in good standing).</li>
                  </ul>
                  <p>
                    So &quot;Cards Mastered&quot; is not &quot;cards you’ve reviewed&quot;—it’s cards that have graduated to a long interval. That usually means answering <strong>Good</strong> or <strong>Easy</strong> several times in a row on the <strong>same</strong> card. Reviewing many different cards once or twice each spreads progress; none of them may reach 7 days yet, so the count can stay at 0 until you build up a few cards with long intervals.
                  </p>
                  <p>
                    <strong>Again</strong> resets a card’s interval; <strong>Hard</strong> grows it slowly. To increase Cards Mastered, keep reviewing and try to pass the same cards with Good or Easy over time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCardsMasteredInfoOpen(false)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Streak Card */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-teal-500 to-teal-400 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <FlameIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-white">
                {streakDays > 0 ? `${streakDays} day${streakDays !== 1 ? 's' : ''} on streak!` : 'Start your streak today!'}
              </span>
            </div>
            <div className="text-white/90 text-sm mb-4">
              {streakDays > 0
                ? streakDays >= 7
                  ? 'Amazing! You\'re on fire! 🔥'
                  : streakDays >= 3
                    ? 'Great progress! Keep it up!'
                    : 'Good start! Build your daily habit!'
                : 'Complete reviews or focus sessions today to start your streak!'}
            </div>

            {/* Daily Progress Indicators */}
            <div className="flex justify-between pb-2 gap-1">
              {recentDays.length > 0 ? (
                recentDays.map((day, idx) => {
                  const reviews = day.reviews ?? 0;
                  const focusMinutes = day.focusMinutes ?? 0;
                  const hasActivity = reviews > 0 || focusMinutes > 0;
                  const isToday = idx === recentDays.length - 1;

                  // Display: focus time if any, else review count, else "—"
                  const circleLabel = focusMinutes > 0
                    ? formatTime(focusMinutes)
                    : reviews > 0
                      ? `${reviews}`
                      : '—';

                  // Get day name from label (e.g., "Jan 24" -> calculate day of week)
                  const getDayName = (label: string, index: number) => {
                    if (!label) {
                      const daysAgo = (recentDays.length - 1) - index;
                      const date = new Date();
                      date.setDate(date.getDate() - daysAgo);
                      return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }
                    // Try to parse date from label (e.g., "Jan 24")
                    try {
                      const currentYear = new Date().getFullYear();
                      const dateStr = `${label} ${currentYear}`;
                      const date = new Date(dateStr);
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                      }
                    } catch (e) {
                      // Fallback
                    }
                    // Fallback: calculate from index
                    const daysAgo = (recentDays.length - 1) - index;
                    const date = new Date();
                    date.setDate(date.getDate() - daysAgo);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  };

                  const dayName = getDayName(day.label || '', idx);
                  // Hide first 2 days on mobile (show 5), show all 7 on desktop
                  // recentDays has 7 items. idx 0,1 hidden on mobile.
                  const visibilityClass = idx < (recentDays.length - 5) ? 'hidden md:flex' : 'flex';

                  return (
                    <div
                      key={idx}
                      className={`${visibilityClass} flex-col items-center gap-1.5 flex-1 ${isToday ? 'bg-teal-400/20 rounded-lg' : ''
                        }`}
                      title={`${day.label || dayName}: ${reviews} reviews, ${focusMinutes > 0 ? formatTime(focusMinutes) : '0'} focus`}
                    >
                      <div className={`text-xs font-medium ${isToday
                        ? 'font-bold text-white'
                        : hasActivity
                          ? 'text-teal-100'
                          : 'text-teal-100'
                        }`}>
                        {dayName}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isToday && hasActivity
                        ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-300 shadow-lg scale-105'
                        : isToday && !hasActivity
                          ? 'bg-teal-300/40 text-white border-2 border-teal-200'
                          : hasActivity
                            ? 'bg-teal-100 text-teal-800 border border-teal-300 hover:bg-teal-200'
                            : 'bg-teal-50 text-teal-600 border border-teal-200'
                        }`}>
                        {circleLabel}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback if no chart data
                Array.from({ length: 7 }).map((_, idx) => {
                  const totalDays = 7;
                  const daysAgo = (totalDays - 1) - idx;
                  const date = new Date();
                  date.setDate(date.getDate() - daysAgo);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const isToday = idx === totalDays - 1;
                  const visibilityClass = idx < (totalDays - 5) ? 'hidden md:flex' : 'flex';

                  return (
                    <div
                      key={idx}
                      className={`${visibilityClass} flex-col items-center gap-1.5 flex-1 ${isToday ? 'bg-teal-400/20 rounded-lg p-2' : ''
                        }`}
                    >
                      <div className={`text-xs font-medium ${isToday
                        ? 'font-bold text-teal-100'
                        : 'text-gray-600'
                        }`}>
                        {dayName}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-semibold ${isToday
                        ? 'bg-teal-300/40 text-white border-2 border-teal-200'
                        : 'bg-teal-50 text-teal-600 border border-teal-200'
                        }`}>
                        —
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Learning Module in Streak Card */}
            {data.dailyPlanSections && data.dailyPlanSections.length > 0 && (
              <div className="mt-4 bg-white/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Daily Reviews</div>
                    <div className="text-white/80 text-xs">{data.reviewedToday} reviews • {data.timeSpentToday} min</div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/review')}
                  className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <PlayIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Your Learning Section */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Your Learning</h2>
            <button
              onClick={() => router.push('/decks')}
              className="text-teal-500 text-sm font-medium"
            >
              See All
            </button>
          </div>

          {decksLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : decks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {decks.slice(0, 4).map((deck) => {
                const { Icon, bgColor, iconColor } = getDeckIcon(deck);
                return (
                  <button
                    key={deck.id}
                    onClick={() => handleDeckClick(deck)}
                    className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
                  >
                    <div className={`w-10 h-10 ${bgColor} dark:opacity-80 rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{deck.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
                      {deck.level && ` • ${deck.level}`}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm text-center text-gray-500 dark:text-gray-400 text-sm">
              No decks available
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Today</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.dueToday}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reviewed</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.reviewedToday}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.accuracyRate}%</div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mastered</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.cardsMastered}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
