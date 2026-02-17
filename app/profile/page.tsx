'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CameraIcon, PhoneIcon, MailIcon, UserIcon,
  ChevronDownIcon, AwardIcon, TrendingUpIcon, TargetIcon,
  CalendarIcon, ChevronRightIcon, MenuIcon, FileTextIcon, StickyNoteIcon, SettingsIcon, ActivityIcon, TrashIcon, LoaderIcon, LockIcon, HistoryIcon
} from 'lucide-react';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import MobileSidebar from '@/components/mobile-sidebar';
import { api } from '@/lib/api';
import { useHeader } from '@/components/header-context';
import ThemeToggle from '@/components/theme-toggle';

interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string;
  whatsapp_number?: string;
  settings?: {
    whatsapp_number?: string;
    profile_image_url?: string;
  };
}

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

interface Note {
  id: number;
  title: string | null;
  content: string;
  material_id: number | null;
  created_at: string;
  material?: {
    id: number;
    title: string;
    source: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'notes' | 'settings'>('stats');

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
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h1>
          </div>
          <ThemeToggle />
        </div>
      );
    } else {
      setHeaderContent(null);
    }
    return () => setHeaderContent(null);
  }, [setHeaderContent, sidebarOpen, isMobile]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp_number: '',
    profile_image_url: '',
  });

  // Country codes for WhatsApp
  const countryCodes = [
    { code: '62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '65', country: 'Singapore', flag: '🇸🇬' },
    { code: '66', country: 'Thailand', flag: '🇹🇭' },
    { code: '84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '63', country: 'Philippines', flag: '🇵🇭' },
    { code: '81', country: 'Japan', flag: '🇯🇵' },
    { code: '82', country: 'South Korea', flag: '🇰🇷' },
    { code: '86', country: 'China', flag: '🇨🇳' },
    { code: '1', country: 'United States', flag: '🇺🇸' },
    { code: '44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '61', country: 'Australia', flag: '🇦🇺' },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState('62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const parsePhoneNumber = (fullNumber: string): { countryCode: string; number: string } => {
    if (!fullNumber) return { countryCode: '62', number: '' };
    const matchedCountry = countryCodes.find(cc => fullNumber.startsWith(cc.code));
    if (matchedCountry) return { countryCode: matchedCountry.code, number: fullNumber.substring(matchedCountry.code.length) };
    if (fullNumber.startsWith('62')) return { countryCode: '62', number: fullNumber.substring(2) };
    return { countryCode: '62', number: fullNumber };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile(token);
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Fetch Notes when tab is active
  useEffect(() => {
    if (activeTab === 'notes') {
      fetchNotes();
    }
  }, [activeTab]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await api.get<Note[]>('/api/v1/notes');
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/api/v1/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await api.get<DashboardData>('/api/v1/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchUserProfile = async (_token: string) => {
    try {
      const userData = await api.get<User>('/api/v1/me');
      setUser(userData);

      const whatsappNumber = userData.settings?.whatsapp_number || userData.whatsapp_number || '';
      const profileImageUrl = userData.settings?.profile_image_url || userData.profile_image_url || '';
      const { countryCode, number } = parsePhoneNumber(whatsappNumber);

      setSelectedCountryCode(countryCode);
      setPhoneNumber(number);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        whatsapp_number: whatsappNumber,
        profile_image_url: profileImageUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profile_image', file);
      const updatedUser = await api.put<User>('/api/v1/profile/update', formDataToSend);
      setUser(updatedUser);
      const profileImageUrl = updatedUser.settings?.profile_image_url || updatedUser.profile_image_url || '';
      setFormData(prev => ({ ...prev, profile_image_url: profileImageUrl }));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile image updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      let formattedPhoneNumber = phoneNumber.trim();
      let finalPhoneNumber = '';
      if (formattedPhoneNumber) {
        if (formattedPhoneNumber.startsWith('0')) formattedPhoneNumber = formattedPhoneNumber.substring(1);
        finalPhoneNumber = selectedCountryCode + formattedPhoneNumber;
      }
      const updatedUser = await api.put<User>('/api/v1/profile/update', {
        name: formData.name,
        whatsapp_number: finalPhoneNumber,
      });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      await api.put('/api/v1/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="flex items-center justify-center min-h-screen">
          <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </main>
    );
  }

  const displayImage = formData.profile_image_url || user?.settings?.profile_image_url || user?.profile_image_url;

  // Streak Calc...
  const calculateStreak = () => {
    if (!dashboardData?.chartData || dashboardData.chartData.length === 0) return 0;
    const recentDays = [...dashboardData.chartData].reverse().slice(-5);
    let streakDays = 0;
    const todayData = recentDays[recentDays.length - 1];
    if (todayData && (todayData.reviews > 0 || todayData.focusMinutes > 0)) {
      streakDays = 1;
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) streakDays++;
        else break;
      }
    } else {
      for (let i = recentDays.length - 2; i >= 0; i--) {
        if (recentDays[i] && (recentDays[i].reviews > 0 || recentDays[i].focusMinutes > 0)) streakDays++;
        else break;
      }
    }
    return streakDays;
  };

  const streakDays = calculateStreak();
  const totalReviews = dashboardData?.chartData?.reduce((sum, day) => sum + day.reviews, 0) || 0;
  const totalFocusMinutes = dashboardData?.chartData?.reduce((sum, day) => sum + day.focusMinutes, 0) || 0;

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins === 0 ? `${hours}h` : `${hours}h${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours === 0 ? `${days}d` : `${days}d${hours}h`;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <div className="max-w-md mx-auto md:max-w-4xl">
        {/* Desktop Header */}
        <div className="hidden md:block px-4 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile and notes</p>
        </div>

        {/* Profile Header Card */}
        <div className="px-4 mb-6">
          <Card>
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-gray-50 dark:ring-gray-800">
                  {displayImage ? (
                    <img src={displayImage} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  disabled={saving}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 md:opacity-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${activeTab === 'stats'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <ActivityIcon className="w-5 h-5" />
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${activeTab === 'notes'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <StickyNoteIcon className="w-5 h-5" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${activeTab === 'settings'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}

        {/* STATS TAB */}
        {activeTab === 'stats' && dashboardData && (
          <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="p-4 dark:border dark:border-gray-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => router.push('/history/mastered')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AwardIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cards Mastered</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.cardsMastered}</div>
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

            {dashboardData.rankNext && (
              <Card className="p-4 dark:border dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Rank</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{dashboardData.rank}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Rank</div>
                    <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{dashboardData.rankNext}</div>
                  </div>
                </div>
                {dashboardData.cardsToNext > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{dashboardData.cardsToNext} cards to level up</span>
                      <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                        {Math.round((dashboardData.cardsMastered / (dashboardData.cardsMastered + dashboardData.cardsToNext)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, ((dashboardData.cardsMastered / (dashboardData.cardsMastered + dashboardData.cardsToNext)) * 100))}%`
                        }}
                      />
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Learning History Link */}
            <Link
              href="/history"
              className="group block w-full p-5 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/10 dark:hover:to-cyan-900/10 border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <HistoryIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Learning History
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View detailed stats and progress
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-medium text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View All
                  </span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingNotes ? (
              <div className="flex justify-center py-12">
                <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <StickyNoteIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No notes yet. Add notes while studying materials!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {notes.map((note) => (
                  <Link
                    key={note.id}
                    href={note.material_id ? `/materials/${note.material_id}` : '#'}
                    className="block cursor-pointer"
                  >
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {note.material && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                              <FileTextIcon className="w-3 h-3" />
                              {note.material.title}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteNote(note.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {note.title && (
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{note.title}</h3>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                        {note.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="px-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Card>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Name
                  </label>
                  <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MailIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Email
                  </label>
                  <Input type="email" value={formData.email} disabled className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <PhoneIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-w-[100px] cursor-pointer">
                        <span className="text-sm font-medium">+{selectedCountryCode}</span>
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      {/* Dropdown implementation simplified for brevity, assume reusable component or similar to before */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 w-72 max-h-60 overflow-y-auto">
                          {countryCodes.map(cc => (
                            <button
                              key={cc.code}
                              type="button"
                              onClick={() => { setSelectedCountryCode(cc.code); setShowCountryDropdown(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left cursor-pointer"
                            >
                              <span>{cc.flag}</span>
                              <span className="text-sm">{cc.country} (+{cc.code})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="812345678" />
                    </div>
                  </div>
                </div>
                <Button type="submit" variant="primary" fullWidth disabled={saving} className="cursor-pointer disabled:cursor-not-allowed">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">WhatsApp Review</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Send <strong>REVIEW</strong> to our bot number to start.</p>
              </div>
            </Card>
          </form>
        )}

        {/* PASSWORD CHANGE SECTION (in settings tab) */}
        {activeTab === 'settings' && (
          <div className="px-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
                    <LockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <LockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <LockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <LockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={changingPassword}
                  className="bg-teal-600 hover:bg-teal-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <span className="flex items-center gap-2">
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Update Password
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
