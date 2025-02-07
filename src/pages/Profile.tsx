import { getUserProfile, updatePassword, updateProfile, UserProfile, sendVerificationOtp, verifyAndEnableTwoFactor, VerificationType, updateTwoFactorStatus } from '@/services/profileService';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Switch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
      border-transparent transition-colors duration-200 ease-in-out focus:outline-none
      ${enabled ? 'bg-green-600' : 'bg-gray-200'}
    `}
  >
    <span
      className={`
        ${enabled ? 'translate-x-5' : 'translate-x-0'}
        pointer-events-none inline-block h-5 w-5 transform rounded-full 
        bg-white shadow ring-0 transition duration-200 ease-in-out
      `}
    />
  </button>
);

const Profile: FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile'|'security'|'2fa'>('profile');
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [formData, setFormData] = useState({
    fullname: '',
    mobile: ''
  });
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [otpVerification, setOtpVerification] = useState({
    isVerifying: false,
    otp: '',
    verificationType: 'EMAIL' as VerificationType
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullname: profile.fullname || '',
        mobile: profile.mobile || ''
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
    debounce((data: Partial<UserProfile>) => {
      handleProfileUpdate(data);
    }, 1000),
    []
  );

  const handleInputChange = (field: string, value: string) => {
    if (field === 'mobile') {
      // Allow only numbers, spaces, and special characters like +, -, ()
      const formattedValue = value.replace(/[^\d\s+()-]/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
      debouncedUpdate({ [field]: formattedValue });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    debouncedUpdate({ [field]: value });
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

  const handleTwoFactorToggle = async () => {
    setIsTwoFactorLoading(true);
    try {
      if (profile?.twoFactorAuth.enabled) { 
        // Disable 2FA
        await updateTwoFactorStatus(false);
        const updatedProfile = await getUserProfile();
        setProfile(updatedProfile);
        setMessage({ type: 'success', text: 'Two-factor authentication disabled successfully' });
      } else {
        // Start enable 2FA flow
        setOtpVerification({
          isVerifying: true,
          otp: '',
          verificationType: 'EMAIL'
        });
        await sendVerificationOtp('EMAIL');
        setMessage({ type: 'success', text: 'Verification code sent to your email' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update 2FA status'
      });
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const updatedUser = await verifyAndEnableTwoFactor(otpVerification.otp);
      setProfile(updatedUser);
      setOtpVerification({ isVerifying: false, otp: '', verificationType: 'EMAIL' });
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    }
  };

  const render2FASection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {profile?.twoFactorAuth.enabled  
              ? 'Two-factor authentication is enabled' 
              : 'Two-factor authentication is disabled'}
          </p>
        </div>
        
        {otpVerification.isVerifying ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter verification code"
              value={otpVerification.otp}
              onChange={(e) => setOtpVerification({
                ...otpVerification,
                otp: e.target.value
              })}
              className="px-4 py-2 border rounded-md"
            />
            <button
              onClick={handleVerifyOtp}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Verify
            </button>
          </div>
        ) : (
          <button
            onClick={handleTwoFactorToggle}
            disabled={isTwoFactorLoading}
            className={`px-4 py-2 rounded-md ${
              profile?.twoFactorAuth.enabled  
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white font-medium transition-colors`}
          >
            {isTwoFactorLoading 
              ? 'Processing...' 
              : profile?.twoFactorAuth.enabled 
                ? 'Disable 2FA' 
                : 'Enable 2FA'}
          </button>
        )}
      </div>
    </div>
  );

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[75%] max-w-3x1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div><br></br>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mb-6">
          <nav className="flex gap-1 mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out">
          
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
        </div><br></br>

        {/* Content */}
        <div className="space-y-6 items-center justify-center">
          <div className="p-4 rounded-lg">
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
                    placeholder="+1 (234) 567-8900"
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

            {activeSection === '2fa' && render2FASection()}
          </div><br></br>
        </div>
      </div>
    </div>
  );
};

export default Profile;