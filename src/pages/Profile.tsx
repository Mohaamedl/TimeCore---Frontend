import { getUserProfile, updatePassword, updateProfile, UserProfile } from '@/services/profileService';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useState } from 'react';
import { Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface FormData extends UserProfile {
  changedFields?: Set<string>;
}

interface TwoFactorAuth {
  isEnabled: boolean;
  sendTo: 'MOBILE' | 'EMAIL' | null;
}

const Profile: FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile'|'security'|'2fa'>('profile');
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [formData, setFormData] = useState<FormData>({
    id: 0,
    fullname: '',
    email: '',
    mobile: '' ,
    status: 'ACTIVE',
    isVerified: false,
    twoFactorAuth: {
      isEnabled: false,
      sendTo: "EMAIL"
    },
    picture: null,
    role: 'USER',
    changedFields: new Set()
  });

  const [twoFactorState, setTwoFactorState] = useState<TwoFactorAuth>({
    isEnabled: profile?.twoFactorAuth?.isEnabled || false,
    sendTo: profile?.twoFactorAuth?.sendTo || null
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        changedFields: new Set()
      });
      setTwoFactorState({
        isEnabled: profile.twoFactorAuth.isEnabled,
        sendTo: profile.twoFactorAuth.sendTo
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (data: UserProfile) => {
      try {
        await updateProfile(data);
        setMessage({ type: 'success', text: 'Profile updated' });
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Update failed' 
        });
      }
    }, 1000),
    []
  );

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      changedFields: prev.changedFields?.add(field)
    }));
    
    // Send entire object with changes
    const updatedProfile = {
      ...formData,
      [field]: value
    };
    
    debouncedUpdate(updatedProfile);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      await updatePassword(passwordData.current, passwordData.new);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Password update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password' 
      });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    }
  };

  const handleTwoFactorUpdate = (changes: Partial<TwoFactorAuth>) => {
    const updatedTwoFactor = {
      ...twoFactorState,
      ...changes
    };

    setTwoFactorState(updatedTwoFactor);

    // Send complete profile object
    const updatedProfile = {
      ...profile,
      twoFactorAuth: updatedTwoFactor
    };

    debouncedUpdate(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="md:flex">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-4 p-4">
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeSection === 'profile'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeSection === 'security'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveSection('2fa')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeSection === '2fa'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Two-Factor Auth
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 md:p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    pattern="[0-9\s+()-]*"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="987456321"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter mobile number with country code (e.g., +1 234 567 8900)
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  onClick={handlePasswordUpdate}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Update Password
                </button>
              </div>
            )}

            {activeSection === '2fa' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div>
                    <Routes
                      checked={twoFactorState.isEnabled}
                      onChange={(checked: any) => handleTwoFactorUpdate({ isEnabled: checked })}
                      className="relative inline-flex h-6 w-11"
                      >
                        
                      </Routes>


                  </div>
                </div>

                {twoFactorState.isEnabled && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Receive codes via:
                    </label>
                    <select
                      value={twoFactorState.sendTo || ''}
                      onChange={(e) => handleTwoFactorUpdate({ 
                        sendTo: e.target.value as 'MOBILE' | 'EMAIL' | null 
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select method</option>
                      <option value="EMAIL">Email</option>
                      <option value="MOBILE">Mobile</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;