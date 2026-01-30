'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CameraIcon, PhoneIcon, MailIcon, UserIcon, SaveIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import MobileSidebar from '@/components/mobile-sidebar';
import { MenuIcon } from 'lucide-react';
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Country codes for WhatsApp - All ASEAN + Major countries
  const countryCodes = [
    // ASEAN Countries
    { code: '62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '65', country: 'Singapore', flag: '🇸🇬' },
    { code: '66', country: 'Thailand', flag: '🇹🇭' },
    { code: '84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '63', country: 'Philippines', flag: '🇵🇭' },
    { code: '855', country: 'Cambodia', flag: '🇰🇭' },
    { code: '856', country: 'Laos', flag: '🇱🇦' },
    { code: '95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '673', country: 'Brunei', flag: '🇧🇳' },
    // East Asia
    { code: '81', country: 'Japan', flag: '🇯🇵' },
    { code: '82', country: 'South Korea', flag: '🇰🇷' },
    { code: '86', country: 'China', flag: '🇨🇳' },
    { code: '852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '853', country: 'Macau', flag: '🇲🇴' },
    { code: '886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '91', country: 'India', flag: '🇮🇳' },
    { code: '92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '977', country: 'Nepal', flag: '🇳🇵' },
    // Oceania
    { code: '61', country: 'Australia', flag: '🇦🇺' },
    { code: '64', country: 'New Zealand', flag: '🇳🇿' },
    // Middle East
    { code: '971', country: 'UAE', flag: '🇦🇪' },
    { code: '966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '974', country: 'Qatar', flag: '🇶🇦' },
    { code: '965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '968', country: 'Oman', flag: '🇴🇲' },
    { code: '961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '962', country: 'Jordan', flag: '🇯🇴' },
    { code: '970', country: 'Palestine', flag: '🇵🇸' },
    { code: '90', country: 'Turkey', flag: '🇹🇷' },
    // Europe
    { code: '44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '49', country: 'Germany', flag: '🇩🇪' },
    { code: '33', country: 'France', flag: '🇫🇷' },
    { code: '39', country: 'Italy', flag: '🇮🇹' },
    { code: '34', country: 'Spain', flag: '🇪🇸' },
    { code: '31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '32', country: 'Belgium', flag: '🇧🇪' },
    { code: '41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '43', country: 'Austria', flag: '🇦🇹' },
    { code: '46', country: 'Sweden', flag: '🇸🇪' },
    { code: '47', country: 'Norway', flag: '🇳🇴' },
    { code: '45', country: 'Denmark', flag: '🇩🇰' },
    { code: '358', country: 'Finland', flag: '🇫🇮' },
    { code: '48', country: 'Poland', flag: '🇵🇱' },
    { code: '7', country: 'Russia', flag: '🇷🇺' },
    { code: '351', country: 'Portugal', flag: '🇵🇹' },
    { code: '353', country: 'Ireland', flag: '🇮🇪' },
    { code: '30', country: 'Greece', flag: '🇬🇷' },
    // Americas
    { code: '1', country: 'United States', flag: '🇺🇸' },
    { code: '1', country: 'Canada', flag: '🇨🇦' },
    { code: '52', country: 'Mexico', flag: '🇲🇽' },
    { code: '55', country: 'Brazil', flag: '🇧🇷' },
    { code: '54', country: 'Argentina', flag: '🇦🇷' },
    { code: '56', country: 'Chile', flag: '🇨🇱' },
    { code: '57', country: 'Colombia', flag: '🇨🇴' },
    { code: '51', country: 'Peru', flag: '🇵🇪' },
    // Africa
    { code: '27', country: 'South Africa', flag: '🇿🇦' },
    { code: '20', country: 'Egypt', flag: '🇪🇬' },
    { code: '234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '254', country: 'Kenya', flag: '🇰🇪' },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState('62'); // Default to Indonesia
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Helper function to parse phone number and extract country code + number
  const parsePhoneNumber = (fullNumber: string): { countryCode: string; number: string } => {
    if (!fullNumber) {
      return { countryCode: '62', number: '' };
    }

    // Try to match country code from the stored number
    // Format is like "6289909807991" (country code + number without leading 0)
    const matchedCountry = countryCodes.find(cc => fullNumber.startsWith(cc.code));
    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        number: fullNumber.substring(matchedCountry.code.length),
      };
    }

    // Fallback: try Indonesia first (most common)
    if (fullNumber.startsWith('62')) {
      return {
        countryCode: '62',
        number: fullNumber.substring(2),
      };
    }

    // Default: assume Indonesia
    return {
      countryCode: '62',
      number: fullNumber,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile(token);
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await api.get<User>('/api/v1/me');
      setUser(userData);

      // Extract whatsapp_number from settings if it exists
      const whatsappNumber = userData.settings?.whatsapp_number || userData.whatsapp_number || '';
      const profileImageUrl = userData.settings?.profile_image_url || userData.profile_image_url || '';

      // Parse existing phone number to extract country code and number
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('profile_image', file);

      const updatedUser = await api.put<User>('/api/v1/profile/update', formDataToSend);
      setUser(updatedUser);

      const profileImageUrl = updatedUser.settings?.profile_image_url || updatedUser.profile_image_url || '';
      setFormData(prev => ({ ...prev, profile_image_url: profileImageUrl }));

      // Update localStorage user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile image updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Format phone number: remove leading 0 if present, combine with country code
      let formattedPhoneNumber = phoneNumber.trim();

      // If phone number is provided, format it
      let finalPhoneNumber = '';
      if (formattedPhoneNumber) {
        // Remove leading 0 if present
        if (formattedPhoneNumber.startsWith('0')) {
          formattedPhoneNumber = formattedPhoneNumber.substring(1);
        }
        // Combine country code + number (format: "6289909807991")
        finalPhoneNumber = selectedCountryCode + formattedPhoneNumber;
      }
      // If empty, send empty string (user can clear the number)

      const updatedUser = await api.put<User>('/api/v1/profile/update', {
        name: formData.name,
        whatsapp_number: finalPhoneNumber,
      });
      setUser(updatedUser);

      // Parse the saved phone number to update state
      const savedWhatsappNumber = updatedUser.settings?.whatsapp_number || updatedUser.whatsapp_number || '';
      const { countryCode, number } = parsePhoneNumber(savedWhatsappNumber);
      setSelectedCountryCode(countryCode);
      setPhoneNumber(number);

      // Update localStorage user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  const displayImage = formData.profile_image_url ||
    (user?.settings?.profile_image_url) ||
    (user?.profile_image_url);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="max-w-md mx-auto md:max-w-4xl">




        {/* Desktop Header */}
        <div className="hidden md:block px-4 pt-8 pb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 mb-4"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile information</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="px-4 mb-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl">
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="px-4 mb-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {/* Profile Image Section */}
        <div className="px-4 my-4">
          <Card>
            <div className="flex flex-col items-center py-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={formData.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  disabled={saving}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Tap the camera icon to change your profile picture
              </p>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="px-4 mb-4">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MailIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <PhoneIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCountryDropdown(!showCountryDropdown);
                        setCountrySearchQuery(''); // Reset search when opening
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-500 dark:hover:border-teal-400 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-colors min-w-[100px]"
                    >
                      <span className="text-sm font-medium">+{selectedCountryCode}</span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {showCountryDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => {
                            setShowCountryDropdown(false);
                            setCountrySearchQuery('');
                          }}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 w-80 max-h-96 flex flex-col">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl">
                            <div className="relative">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <input
                                type="text"
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="Search country..."
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none text-sm"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Country List */}
                          <div className="overflow-y-auto max-h-80">
                            {countryCodes
                              .filter((country) => {
                                if (!countrySearchQuery) return true;
                                const query = countrySearchQuery.toLowerCase();
                                return (
                                  country.country.toLowerCase().includes(query) ||
                                  country.code.includes(query) ||
                                  `+${country.code}`.includes(query)
                                );
                              })
                              .map((country) => (
                                <button
                                  key={`${country.code}-${country.country}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountryCode(country.code);
                                    setShowCountryDropdown(false);
                                    setCountrySearchQuery('');
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCountryCode === country.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                                    }`}
                                >
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">{country.country}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">+{country.code}</span>
                                </button>
                              ))}
                            {countryCodes.filter((country) => {
                              if (!countrySearchQuery) return false;
                              const query = countrySearchQuery.toLowerCase();
                              return (
                                country.country.toLowerCase().includes(query) ||
                                country.code.includes(query) ||
                                `+${country.code}`.includes(query)
                              );
                            }).length === 0 && (
                                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No countries found
                                </div>
                              )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex-1">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(value);
                      }}
                      placeholder="8123456789"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter your phone number (leading 0 will be removed automatically)
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* WhatsApp Review Info */}
        <div className="px-4 mb-8">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">WhatsApp Review</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                You can review your cards directly through WhatsApp!
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Ensure your WhatsApp number is saved above.</li>
                <li>Send the message <strong>REVIEW</strong> to our bot number.</li>
                <li>Follow the prompts to answer questions.</li>
                <li>Send <strong>STOP</strong> to end the session.</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
