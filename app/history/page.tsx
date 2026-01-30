'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrendingUpIcon, CalendarIcon, TargetIcon, AwardIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import { api } from '@/lib/api';
import MobileSidebar from '@/components/mobile-sidebar';
import { MenuIcon } from 'lucide-react';

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
}

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const fetchDashboard = async () => {
      try {
        const dashboardData = await api.get<DashboardData>('/api/v1/dashboard');
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="max-w-md mx-auto px-4 pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 mb-4 cursor-pointer"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
            {error || 'Failed to load history'}
          </div>
        </div>
      </main>
    );
  }

  // Calculate totals from chartData
  const totalReviews = data.chartData?.reduce((sum, day) => sum + day.reviews, 0) || 0;
  const totalFocusMinutes = data.chartData?.reduce((sum, day) => sum + day.focusMinutes, 0) || 0;
  const avgAccuracy = data.chartData?.filter(d => d.accuracy !== null).length > 0
    ? Math.round(data.chartData.filter(d => d.accuracy !== null).reduce((sum, day) => sum + (day.accuracy || 0), 0) / data.chartData.filter(d => d.accuracy !== null).length)
    : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (!data.chartData || data.chartData.length === 0) {
      return 0;
    }
    const recentDays = [...data.chartData].reverse().slice(-5);
    let streakDays = 0;
    const todayData = recentDays[recentDays.length - 1];

    if (todayData && (todayData.reviews > 0 || todayData.focusMinutes > 0)) {
      streakDays = 1;
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) {
          streakDays++;
        } else {
          break;
        }
      }
    } else {
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) {
          streakDays++;
        } else {
          break;
        }
      }
    }
    return streakDays;
  };

  const streakDays = calculateStreak();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl">
        {/* Mobile Header */}
        <div className="md:hidden px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">History & Summary</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block px-4 pt-8 pb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 mb-4 cursor-pointer"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History & Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your learning progress and statistics</p>
        </div>

        {/* Summary Cards */}
        <div className="px-4 my-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 dark:border dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <AwardIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div className="text-xs text-gray-500 dark:text-gray-400">Cards Mastered</div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.cardsMastered}</div>
            </Card>
            <Card className="p-4 dark:border dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div className="text-xs text-gray-500 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{streakDays} days</div>
            </Card>
            <Card className="p-4 dark:border dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <TargetIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Reviews</div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalReviews}</div>
            </Card>
            <Card className="p-4 dark:border dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Time</div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(totalFocusMinutes)}</div>
            </Card>
          </div>
        </div>

        {/* Rank Progress */}
        <div className="px-4 mb-4">
          <Card className="dark:border dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Rank</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{data.rank}</div>
              </div>
              {data.rankNext && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Rank</div>
                  <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{data.rankNext}</div>
                </div>
              )}
            </div>
            {data.rankNext && data.cardsToNext > 0 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{data.cardsToNext} cards to level up</span>
                  <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                    {Math.round((data.cardsMastered / (data.cardsMastered + data.cardsToNext)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((data.cardsMastered / (data.cardsMastered + data.cardsToNext)) * 100))}%`
                    }}
                  />
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Recent Activity Chart */}
        {data.chartData && data.chartData.length > 0 && (
          <div className="px-4 mb-4">
            <Card className="dark:border dark:border-gray-600">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Last 14 Days Activity</h2>
              <div className="space-y-3">
                {data.chartData.slice(-14).map((day, idx) => {
                  const hasActivity = day.reviews > 0 || day.focusMinutes > 0;
                  return (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{day.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {day.reviews} reviews • {formatTime(day.focusMinutes)} focus
                          {day.accuracy !== null && ` • ${day.accuracy}% accuracy`}
                        </div>
                      </div>
                      {hasActivity && (
                        <div className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Today's Stats */}
        <div className="px-4 mb-4">
          <Card className="dark:border dark:border-gray-600">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Today's Progress</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reviews</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{data.reviewedToday}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Spent</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(data.timeSpentToday)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Today</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{data.dueToday}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{data.accuracyRate}%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
