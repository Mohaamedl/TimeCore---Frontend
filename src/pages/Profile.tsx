import { UserProfile, VerificationType, getUserProfile, sendVerificationOtp, updatePassword, updateProfile, updateTwoFactorStatus, verifyAndEnableTwoFactor } from '@/services/profileService';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormDataProfile {
  id: number;
  fullname: string;
  email: string;
  mobile: string;
  status: string;
  isVerified: boolean;
  twoFactorAuth: any;
  picture: any;
  role: string;
  changedFields?: Set<string>;
}

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
  const [formData, setFormData] = useState<FormDataProfile>({
    id: 0,
    fullname: '',
    email: '',
    mobile: "",
    status: 'ACTIVE',
    isVerified: false,
    twoFactorAuth: undefined,
    picture: null,
    role: 'USER',
    changedFields: new Set<string>()
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
        ...profile,
        changedFields: new Set()
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
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Falha ao atualizar o perfil' });
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (data: Partial<UserProfile>) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updatedFormData = { ...prev, [field]: value, changedFields: prev.changedFields ? new Set(prev.changedFields).add(field) : new Set([field]) };
      debouncedUpdate({ [field]: value });
      return updatedFormData;
    });
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
      setMessage({ type: 'success', text: 'As palavras-passe não correspondem' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Password update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Falha ao atualizar a senha' 
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
        setMessage({ type: 'success', text: 'Autenticação de dois fatores desativada com êxito' });
      } else {
        // Start enable 2FA flow
        setOtpVerification({
          isVerifying: true,
          otp: '',
          verificationType: 'EMAIL'
        });
        await sendVerificationOtp('EMAIL');
        setMessage({ type: 'success', text: 'Código de verificação enviado para o seu e-mail' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Falha ao atualizar o status 2FA'
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
      setMessage({ type: 'success', text: 'Autenticação de dois fatores ativada com êxito' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Código de verificação inválido' });
    }
  };

  const render2FASection = () => (
    <div className="space-y-6">
      <div className="flex flex-colum items-center">
        <div>
          <h3 className="block text-sm font-medium text-gray-500 dark:text-gray-00 mb-2">
          Autenticação de dois fatores
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {profile?.twoFactorAuth.enabled  
              ? 'A autenticação está habilitada' 
              : 'A autenticação está desativada'}
          </p>
        </div>
        
        {otpVerification.isVerifying ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Insira o código"              
              value={otpVerification.otp}
              onChange={(e) => setOtpVerification({
                ...otpVerification,
                otp: e.target.value
              })}
              className="w-full px-3 py-2 shadow-lg border border-gray-200 rounded-md text-[#240960] placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            /><br></br>
            <button
              onClick={handleVerifyOtp}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Verificar
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
    <div className="min-h-screen flex items-center justify-center  bg-[#240960] py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#ffffff] flex flex-col items-center p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#240960]">Configurações</h1><br></br>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Gerir as definições e preferências da sua conta</p>
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
        <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-00 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
                    Númbero de telemovel
                  </label>
                  <input
                    type="tel"
                    pattern="[0-9\s+()-]*"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="+1 (234) 567-8900"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Introduza o número de telemóvel com o indicativo do país
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
                  Palavra-passe atual
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
                  Nova palavra-passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
                    Confirma Nova palavra-passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-10 dark:bg-gray-200 dark:border-gray-300 dark:text-gray-400"
                  />
                </div><br></br>
                <button
                  onClick={handlePasswordUpdate}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Atualizar palavra-passe
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

